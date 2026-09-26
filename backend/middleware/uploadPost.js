import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "post_images",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

// Must match MAX_IMAGES in frontend/src/components/AddEditPost.tsx.
export const MAX_POST_IMAGES = 6;

const uploadPost = multer({ storage });

// Accepts up to MAX_POST_IMAGES files and turns upload errors (e.g. too many files) into a JSON 400.
export const uploadPostImages = (req, res, next) => {
  uploadPost.array("images", MAX_POST_IMAGES)(req, res, (err) => {
    if (!err) return next();
    const message =
      err.code === "LIMIT_UNEXPECTED_FILE"
        ? `You can upload at most ${MAX_POST_IMAGES} images`
        : err.message || "Image upload failed";
    return res.status(400).json({ success: false, message });
  });
};

export default uploadPost;