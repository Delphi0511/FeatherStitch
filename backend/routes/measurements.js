import express from "express";

const router = express.Router();

import {
  saveMeasurement,
  getMeasurements,
} from "../controllers/measurementsController.js";

// SAVE or UPDATE
router.post("/save", saveMeasurement);

// GET all measurements of a user
router.get("/:userId", getMeasurements);

export default router;