import mongoose from "mongoose";

const Schema = mongoose.Schema;

export const ORDER_STATUSES = ["Pending", "Accepted", "In progress", "Ready", "Delivered", "Declined", "Cancelled"];

// Orders store snapshots of the design, the customer's contact details and the measurements
// as they were when the order was placed, so later edits or deletions don't change past orders.
const OrderSchema = new Schema(
  {
    // Customer: the User id from the JWT (same id measurements are stored under).
    customerUserId: { type: String, required: true, index: true },
    customer: {
      email: { type: String, required: true },
      name: { type: String, required: true },
      address: String,
      city: String,
      state: String,
    },

    tailor: { type: Schema.Types.ObjectId, ref: "TailorProfile", required: true, index: true },
    tailorName: String,

    // The ordered design; `post` may later point to a deleted post, so `design` keeps what was ordered.
    post: { type: Schema.Types.ObjectId, ref: "Post" },
    design: {
      title: { type: String, required: true },
      category: String,
      image: String,
      price: Number,
      turnaround: String,
    },

    measurements: [
      {
        _id: false,
        gender: String,
        // Written as { type: String } because a bare `type: String` would make Mongoose treat
        // the whole entry as a string instead of a field named "type".
        type: { type: String },
        values: { type: Schema.Types.Mixed, default: {} },
        units: { type: Schema.Types.Mixed, default: {} },
      },
    ],

    notes: { type: String, maxlength: 1000, trim: true },

    status: { type: String, enum: ORDER_STATUSES, default: "Pending", index: true },
    statusHistory: [
      {
        _id: false,
        status: { type: String, enum: ORDER_STATUSES, required: true },
        by: { type: String, enum: ["customer", "tailor"], required: true },
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Order", OrderSchema);
