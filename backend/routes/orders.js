import express from "express";
import { auth, requireRole } from "../middleware/auth.js";
import {
  createOrder,
  listMyOrders,
  cancelOrder,
  listIncomingOrders,
  updateOrderStatus,
  getOrder,
} from "../controllers/orderController.js";

const router = express.Router();

router.use(auth);

// Customer
router.post("/", requireRole("Customer"), createOrder);
router.get("/mine", requireRole("Customer"), listMyOrders);
router.patch("/:id/cancel", requireRole("Customer"), cancelOrder);

// Tailor
router.get("/incoming", requireRole("Tailor"), listIncomingOrders);
router.patch("/:id/status", requireRole("Tailor"), updateOrderStatus);

// Either party of the order
router.get("/:id", getOrder);

export default router;
