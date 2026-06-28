import Post from "../models/TailorPosts.js";
import TailorProfile from "../models/TailorProfile.js";

export const createPost = async (req, res) => {
  try {
    const tailor = await TailorProfile.findOne({
      email: req.user.email,
    });

    if (!tailor) {
      return res.status(404).json({
        success: false,
        message: "Tailor profile not found",
      });
    }

    const {
      title,
      category,
      description,
      price,
      turnaround,
      tags,
      status,
    } = req.body;

    const numericPrice = Number(
      String(price).replace(/[^\d]/g, "")
    );

    let parsedTags = [];

    if (tags) {
      parsedTags = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
    }

    const images = req.files
      ? req.files.map((file) => file.path)
      : [];

    const post = new Post({
      tailor: tailor._id,
      title,
      category,
      description,
      price: numericPrice,
      turnaround,
      tags: parsedTags,
      images,
      status,
    });

    await post.save();

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      post,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};