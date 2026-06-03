import express from "express";
import upload from "../middleware/upload.js";
import Customer from "../models/CustomerProfile.js";
import { uploadProfilePic, saveCustomer, updateCustomer,getCustomerByEmail} from "../controllers/customerController.js";

const router = express.Router();

router.post("/saveCustomer", saveCustomer);
router.post("/upload-profile", upload.single("image"), uploadProfilePic);
router.put("/:email", updateCustomer);
router.get("/getCustomer/:email", getCustomerByEmail);
export default router;