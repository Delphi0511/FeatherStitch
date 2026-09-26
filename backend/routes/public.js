import express from "express";
import { auth } from "../middleware/auth.js";
import {
  listPublishedPosts,
  getPublishedPost,
  listTailors,
  getTailorPublicProfile,
} from "../controllers/publicController.js";

const router = express.Router();

// Read-only browsing for any signed-in user (customers and tailors).
// Only published posts and public tailor fields are ever returned.
router.use(auth);

router.get("/posts", listPublishedPosts);
router.get("/posts/:id", getPublishedPost);
router.get("/tailors", listTailors);
router.get("/tailors/:id", getTailorPublicProfile);

export default router;
