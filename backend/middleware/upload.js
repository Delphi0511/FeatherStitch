import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary, // ✅ ab yeh correct instance hai
  params: {
    folder: "profile_pics",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({ storage });
console.log("CLOUDINARY CONFIG:", cloudinary.config());
export default upload;