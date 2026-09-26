import mongoose from "mongoose";
import Post from "../models/TailorPosts.js";
import TailorProfile from "../models/TailorProfile.js";

// ---- Helpers -------------------------------------------------------

// The only tailor fields customers may see. Aadhar, DOB, gender, phone, email and
// home address are deliberately left out; add a field here only if it is safe to publish.
const PUBLIC_TAILOR_FIELDS =
  "name category speciality workType since city state shopAddress shopCity website otherInfo profilePic";

const PUBLISHED = { status: "Published" };

// Escapes user search text so it is matched literally inside a regex.
function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Reads ?page and ?limit with safe bounds so one request can't pull the whole collection.
function pagination(query) {
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 30, 1), 100);
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  return { limit, page, skip: (page - 1) * limit };
}

// ---- Posts -----------------------------------------------------------

// Lists published posts from all tailors, newest first; supports ?category, ?q (text search) and ?tailor.
export const listPublishedPosts = async (req, res) => {
  try {
    const { category, q, tailor } = req.query;
    const filter = { ...PUBLISHED };

    if (category) filter.category = category;
    if (tailor) {
      if (!mongoose.isValidObjectId(tailor)) {
        return res.status(400).json({ success: false, message: "Invalid tailor id" });
      }
      filter.tailor = tailor;
    }
    if (q) {
      const pattern = new RegExp(escapeRegex(q), "i");
      filter.$or = [{ title: pattern }, { description: pattern }, { tags: pattern }, { category: pattern }];
    }

    const { limit, page, skip } = pagination(req.query);
    const [posts, total] = await Promise.all([
      Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("tailor", PUBLIC_TAILOR_FIELDS),
      Post.countDocuments(filter),
    ]);

    return res.status(200).json({ success: true, posts, total, page, limit });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Returns one published post with its tailor's public profile; drafts are reported as not found.
export const getPublishedPost = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const post = await Post.findOne({ _id: req.params.id, ...PUBLISHED }).populate("tailor", PUBLIC_TAILOR_FIELDS);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    return res.status(200).json({ success: true, post });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ---- Tailors ---------------------------------------------------------

// Lists tailor public profiles with published-post counts and previews; supports ?city and ?q (name/speciality/category).
export const listTailors = async (req, res) => {
  try {
    const { city, q } = req.query;
    const conditions = [];

    if (city) {
      const cityPattern = new RegExp(`^${escapeRegex(city.trim())}$`, "i");
      conditions.push({ $or: [{ city: cityPattern }, { shopCity: cityPattern }] });
    }
    if (q) {
      const pattern = new RegExp(escapeRegex(q), "i");
      conditions.push({ $or: [{ name: pattern }, { speciality: pattern }, { category: pattern }, { workType: pattern }] });
    }
    const filter = conditions.length ? { $and: conditions } : {};

    const { limit, page, skip } = pagination(req.query);
    const [tailors, total] = await Promise.all([
      TailorProfile.find(filter).select(PUBLIC_TAILOR_FIELDS).sort({ name: 1 }).skip(skip).limit(limit).lean(),
      TailorProfile.countDocuments(filter),
    ]);

    // Per tailor: number of published posts and the 3 newest as previews (first photo + title).
    const stats = await Post.aggregate([
      { $match: { ...PUBLISHED, tailor: { $in: tailors.map((t) => t._id) } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$tailor",
          count: { $sum: 1 },
          previews: { $push: { _id: "$_id", title: "$title", image: { $arrayElemAt: ["$images", 0] } } },
        },
      },
      { $project: { count: 1, previews: { $slice: ["$previews", 3] } } },
    ]);
    const statsById = new Map(stats.map((s) => [String(s._id), s]));

    return res.status(200).json({
      success: true,
      tailors: tailors.map((t) => {
        const s = statsById.get(String(t._id));
        return { ...t, postCount: s?.count || 0, previews: s?.previews || [] };
      }),
      total,
      page,
      limit,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Returns one tailor's public profile together with all of their published posts.
export const getTailorPublicProfile = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: "Tailor not found" });
    }

    const tailor = await TailorProfile.findById(req.params.id).select(PUBLIC_TAILOR_FIELDS).lean();
    if (!tailor) {
      return res.status(404).json({ success: false, message: "Tailor not found" });
    }

    const posts = await Post.find({ tailor: tailor._id, ...PUBLISHED }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, tailor: { ...tailor, postCount: posts.length }, posts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
