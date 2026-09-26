import express from "express";
import mongoose from "mongoose";
import { auth, requireRole } from "../middleware/auth.js";
import { uploadPostImages } from "../middleware/uploadPost.js";
import {
  createPost,
  getTailorPosts,
  getPostById,
  updatePost,
  deletePost,
} from "../controllers/postController.js";

const router = express.Router();

// Rejects malformed post ids with 404 before any image upload or database query runs.
const validatePostId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ success: false, message: "Post not found" });
  }
  next();
};

// Create a new post
router.post("/", auth, requireRole("Tailor"), uploadPostImages, createPost);

// Get all posts belonging to the logged-in tailor
router.get("/", auth, requireRole("Tailor"), getTailorPosts);

// Get a single post by id
router.get("/:id", auth, requireRole("Tailor"), validatePostId, getPostById);

// Update an existing post (supports adding new images + keeping/removing old ones)
router.put("/:id", auth, requireRole("Tailor"), validatePostId, uploadPostImages, updatePost);

// Delete a post
router.delete("/:id", auth, requireRole("Tailor"), validatePostId, deletePost);

export default router;
