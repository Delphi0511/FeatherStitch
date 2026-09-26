import express from "express";

const router = express.Router();

import {
  saveMeasurement,
  getMeasurements,
} from "../controllers/measurementsController.js";
import { auth, requireRole } from "../middleware/auth.js";

router.use(auth, requireRole("Customer"));

// SAVE or UPDATE
router.post("/save", saveMeasurement);

// GET all measurements of a user
router.get("/:userId", getMeasurements);

export default router;
