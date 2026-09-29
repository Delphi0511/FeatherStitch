import express from "express";
import * as userController from "../controllers/userController.js";

const router = express.Router();

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);

export default router;