import express from "express";
import { auth } from "../middleware/auth.js";
import uploadPost from "../middleware/uploadPost.js";
import { createPost } from "../controllers/postController.js";

const router = express.Router();

router.post(
  "/",
  auth,
  uploadPost.array("images", 5),
  createPost
);

export default router;