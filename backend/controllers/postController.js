import Post from "../models/TailorPosts.js";
import TailorProfile from "../models/TailorProfile.js";
import cloudinary from "../config/cloudinary.js";

// ---- Helpers -------------------------------------------------------

// Normalizes a formatted price such as "₹4,500" before storing it as a number.
function parsePrice(price) {
  return Number(String(price).replace(/[^\d]/g, ""));
}

// Converts the comma-separated tags sent by the form into the schema's string array.
function parseTags(tags) {
  if (!tags) return [];
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

// Pulls the Cloudinary public_id out of a stored secure_url so we can
// delete the asset when a post is removed or an image is replaced.
// Extracts a Cloudinary asset ID so an obsolete image can be deleted with its post.
function getPublicIdFromUrl(url) {
  try {
    const parts = url.split("/");
    const fileName = parts[parts.length - 1];
    const folder = parts[parts.length - 2];
    const publicId = fileName.split(".")[0];
    return `${folder}/${publicId}`;
  } catch {
    return null;
  }
}

// Deletes multiple Cloudinary images concurrently to avoid leaving unused upload assets behind.
async function destroyImages(urls = []) {
  await Promise.all(
    urls.map((url) => {
      const publicId = getPublicIdFromUrl(url);
      if (!publicId) return Promise.resolve();
      return cloudinary.uploader.destroy(publicId).catch(() => {});
    })
  );
}

// ---- Create ----------------------------------------------------------

// Creates a post owned by the tailor profile associated with the verified JWT email.
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

    const post = new Post({
      tailor: tailor._id,
      title,
      category,
      description,
      price: parsePrice(price),
      turnaround,
      tags: parseTags(tags),
      images: req.files ? req.files.map((file) => file.path) : [],
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

// ---- Read (list + single) --------------------------------------------

// Lists the authenticated tailor's posts, newest first, for their portfolio management screen.
export const getTailorPosts = async (req, res) => {
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

    const posts = await Post.find({ tailor: tailor._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      posts,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Returns one post only after confirming it belongs to the authenticated tailor.
export const getPostById = async (req, res) => {
  try {
    const tailor = await TailorProfile.findOne({ email: req.user.email });
    if (!tailor) {
      return res.status(404).json({ success: false, message: "Tailor profile not found" });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.tailor.toString() !== tailor._id.toString()) {
      return res.status(403).json({ success: false, message: "You are not allowed to view this post" });
    }

    return res.status(200).json({
      success: true,
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

// ---- Update ------------------------------------------------------------

// Updates a tailor-owned post and reconciles Cloudinary images removed in the form.
export const updatePost = async (req, res) => {
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

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.tailor.toString() !== tailor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to edit this post",
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
      existingImages, // JSON-stringified array of image URLs the client wants to KEEP
    } = req.body;

    // Work out which of the post's current images should survive.
    let keptImages = post.images;
    if (existingImages !== undefined) {
      try {
        keptImages = JSON.parse(existingImages);
      } catch {
        keptImages = post.images;
      }
    }

    // Anything that was on the post but isn't in "kept" was removed by the
    // user in the UI — delete it from Cloudinary to avoid orphaned assets.
    const removedImages = post.images.filter(
      (url) => !keptImages.includes(url)
    );
    if (removedImages.length) {
      await destroyImages(removedImages);
    }

    const newImages = req.files ? req.files.map((file) => file.path) : [];

    if (title !== undefined) post.title = title;
    if (category !== undefined) post.category = category;
    if (description !== undefined) post.description = description;
    if (price !== undefined) post.price = parsePrice(price);
    if (turnaround !== undefined) post.turnaround = turnaround;
    if (tags !== undefined) post.tags = parseTags(tags);
    if (status !== undefined) post.status = status;
    post.images = [...keptImages, ...newImages];

    await post.save();

    return res.status(200).json({
      success: true,
      message: "Post updated successfully",
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

// ---- Delete ------------------------------------------------------------

// Deletes a tailor-owned post and its associated Cloudinary images.
export const deletePost = async (req, res) => {
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

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.tailor.toString() !== tailor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this post",
      });
    }

    await destroyImages(post.images);
    await post.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
