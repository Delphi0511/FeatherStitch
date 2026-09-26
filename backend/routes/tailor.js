import express from "express";
import upload from "../middleware/upload.js";
import { auth, requireRole } from "../middleware/auth.js";

import {
  saveTailor,
  getTailorByEmail,
  updateTailor,
  uploadProfilePic,
} from "../controllers/tailorController.js";

const router = express.Router();

router.use(auth, requireRole("Tailor"));

router.post("/saveTailor", saveTailor);

router.get(
  "/getTailor/:email",
  getTailorByEmail
);

router.put(
  "/:email",
  updateTailor
);

router.post(
  "/upload-profile",
  upload.single("image"),
  uploadProfilePic
);

export default router;
