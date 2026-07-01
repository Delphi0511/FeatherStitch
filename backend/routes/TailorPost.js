import express from "express";
import { auth } from "../middleware/auth.js";
import uploadPost from "../middleware/uploadPost.js";
import {
  createPost,
  getTailorPosts,
  getPostById,
  updatePost,
  deletePost,
} from "../controllers/postController.js";

const router = express.Router();

// Create a new post
router.post("/", auth, uploadPost.array("images", 5), createPost);

// Get all posts belonging to the logged-in tailor
router.get("/", auth, getTailorPosts);

// Get a single post by id
router.get("/:id", auth, getPostById);

// Update an existing post (supports adding new images + keeping/removing old ones)
router.put("/:id", auth, uploadPost.array("images", 5), updatePost);

// Delete a post
router.delete("/:id", auth, deletePost);

export default router;