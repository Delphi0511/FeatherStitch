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

const uploadPost = multer({ storage });

export default uploadPost;