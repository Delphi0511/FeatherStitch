import express from "express";
import upload from "../middleware/upload.js";
import { uploadProfilePic, saveCustomer, updateCustomer,getCustomerByEmail} from "../controllers/customerController.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.use(auth, requireRole("Customer"));

router.post("/saveCustomer", saveCustomer);
router.post("/upload-profile", upload.single("image"), uploadProfilePic);
router.put("/:email", updateCustomer);
router.get("/getCustomer/:email", getCustomerByEmail);
export default router;
