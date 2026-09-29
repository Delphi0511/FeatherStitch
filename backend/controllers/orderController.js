import mongoose from "mongoose";
import Order, { ORDER_STATUSES } from "../models/Order.js";
import Post from "../models/TailorPosts.js";
import TailorProfile from "../models/TailorProfile.js";
import CustomerProfile from "../models/CustomerProfile.js";
import Measurement from "../models/Measurements.js";

// ---- Helpers -------------------------------------------------------

// Status changes a tailor may make, from -> allowed next statuses. Anything else is rejected.
const TAILOR_TRANSITIONS = {
  Pending: ["Accepted", "Declined"],
  Accepted: ["In progress"],
  "In progress": ["Ready"],
  Ready: ["Delivered"],
};

// Measurement fields copied into an order (everything except ids, owner and bookkeeping).
const MEASUREMENT_SKIP = new Set(["_id", "__v", "userId", "gender", "type", "units", "createdAt", "updatedAt"]);

const MAX_MEASUREMENT_SECTIONS = 10;

// Keeps only the filled-in values of a saved measurement section for the order snapshot.
function snapshotMeasurement(m) {
  const doc = m.toObject({ flattenMaps: true });
  const values = {};
  for (const [key, value] of Object.entries(doc)) {
    if (!MEASUREMENT_SKIP.has(key) && value !== undefined && value !== null && value !== "") values[key] = value;
  }
  return { gender: doc.gender, type: doc.type, values, units: doc.units || {} };
}

// Validates an optional ?status filter against the known statuses.
function statusFilter(status) {
  if (!status) return {};
  return ORDER_STATUSES.includes(status) ? { status } : null;
}

const notFound = (res) => res.status(404).json({ success: false, message: "Order not found" });
const serverError = (res, err) => {
  console.error(err);
  return res.status(500).json({ success: false, message: "Internal Server Error" });
};

// ---- Customer --------------------------------------------------------

// Places an order for a published design, snapshotting the design, the customer's contact
// details and the measurement sections they chose to attach.
export const createOrder = async (req, res) => {
  try {
    const { postId, measurementIds = [], notes } = req.body;

    if (!mongoose.isValidObjectId(postId)) {
      return res.status(400).json({ success: false, message: "Choose a design to order" });
    }
    if (!Array.isArray(measurementIds) || measurementIds.length > MAX_MEASUREMENT_SECTIONS ||
        !measurementIds.every((id) => mongoose.isValidObjectId(id))) {
      return res.status(400).json({ success: false, message: "Invalid measurements selection" });
    }
    if (notes !== undefined && (typeof notes !== "string" || notes.length > 1000)) {
      return res.status(400).json({ success: false, message: "Notes must be text of at most 1000 characters" });
    }

    const customer = await CustomerProfile.findOne({ emailId: req.user.email });
    if (!customer) {
      return res.status(400).json({ success: false, message: "Complete your profile before placing an order" });
    }

    // Drafts can't be ordered: only published posts are visible to customers.
    const post = await Post.findOne({ _id: postId, status: "Published" });
    if (!post) {
      return res.status(404).json({ success: false, message: "This design is no longer available" });
    }
    const tailor = await TailorProfile.findById(post.tailor);
    if (!tailor) {
      return res.status(404).json({ success: false, message: "This tailor is no longer available" });
    }

    // Only the customer's own measurement sections may be attached.
    const uniqueIds = [...new Set(measurementIds.map(String))];
    const measurements = await Measurement.find({ _id: { $in: uniqueIds }, userId: req.user.userId });
    if (measurements.length !== uniqueIds.length) {
      return res.status(400).json({ success: false, message: "Some selected measurements were not found" });
    }

    const order = await Order.create({
      customerUserId: req.user.userId,
      customer: {
        email: req.user.email,
        name: customer.name,
        address: customer.address,
        city: customer.city,
        state: customer.state,
      },
      tailor: tailor._id,
      tailorName: tailor.name,
      post: post._id,
      design: {
        title: post.title,
        category: post.category,
        image: post.images[0],
        price: post.price,
        turnaround: post.turnaround,
      },
      measurements: measurements.map(snapshotMeasurement),
      notes: notes?.trim() || undefined,
      status: "Pending",
      statusHistory: [{ status: "Pending", by: "customer" }],
    });

    return res.status(201).json({ success: true, message: "Order placed", order });
  } catch (err) {
    return serverError(res, err);
  }
};

// Lists the signed-in customer's orders, newest first; supports ?status.
export const listMyOrders = async (req, res) => {
  try {
    const filter = statusFilter(req.query.status);
    if (!filter) return res.status(400).json({ success: false, message: "Unknown status" });

    const orders = await Order.find({ customerUserId: req.user.userId, ...filter }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, orders });
  } catch (err) {
    return serverError(res, err);
  }
};

// Lets a customer cancel their own order while the tailor hasn't responded yet.
export const cancelOrder = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);

    const order = await Order.findOne({ _id: req.params.id, customerUserId: req.user.userId });
    if (!order) return notFound(res);

    if (order.status !== "Pending") {
      return res.status(409).json({
        success: false,
        message: `This order is already ${order.status.toLowerCase()} and can no longer be cancelled`,
      });
    }

    order.status = "Cancelled";
    order.statusHistory.push({ status: "Cancelled", by: "customer" });
    await order.save();

    return res.status(200).json({ success: true, message: "Order cancelled", order });
  } catch (err) {
    return serverError(res, err);
  }
};

// ---- Tailor ----------------------------------------------------------

// Lists orders placed with the signed-in tailor, newest first; supports ?status.
export const listIncomingOrders = async (req, res) => {
  try {
    const filter = statusFilter(req.query.status);
    if (!filter) return res.status(400).json({ success: false, message: "Unknown status" });

    const tailor = await TailorProfile.findOne({ email: req.user.email });
    if (!tailor) {
      return res.status(404).json({ success: false, message: "Tailor profile not found" });
    }

    const orders = await Order.find({ tailor: tailor._id, ...filter }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, orders });
  } catch (err) {
    return serverError(res, err);
  }
};

// Moves one of the tailor's orders to the next status, following TAILOR_TRANSITIONS.
export const updateOrderStatus = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);

    const tailor = await TailorProfile.findOne({ email: req.user.email });
    if (!tailor) return notFound(res);

    const order = await Order.findOne({ _id: req.params.id, tailor: tailor._id });
    if (!order) return notFound(res);

    const { status } = req.body;
    const allowed = TAILOR_TRANSITIONS[order.status] || [];
    if (!allowed.includes(status)) {
      return res.status(409).json({
        success: false,
        message: allowed.length
          ? `A ${order.status.toLowerCase()} order can only be moved to: ${allowed.join(", ")}`
          : `This order is ${order.status.toLowerCase()} and can no longer be changed`,
      });
    }

    order.status = status;
    order.statusHistory.push({ status, by: "tailor" });
    await order.save();

    return res.status(200).json({ success: true, message: `Order ${status.toLowerCase()}`, order });
  } catch (err) {
    return serverError(res, err);
  }
};

// ---- Shared ------------------------------------------------------------

// Returns one order to the customer who placed it or the tailor it was placed with.
export const getOrder = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);

    const order = await Order.findById(req.params.id);
    if (!order) return notFound(res);

    const isCustomer = req.user.usertype === "Customer" && order.customerUserId === req.user.userId;
    let isTailor = false;
    if (req.user.usertype === "Tailor") {
      const tailor = await TailorProfile.findOne({ email: req.user.email });
      isTailor = Boolean(tailor && order.tailor.equals(tailor._id));
    }
    // Other people's orders look the same as missing ones, so ids can't be probed.
    if (!isCustomer && !isTailor) return notFound(res);

    return res.status(200).json({ success: true, order });
  } catch (err) {
    return serverError(res, err);
  }
};
