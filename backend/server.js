import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import userRouter from "./routes/userRouter.js";
import customerRoutes from "./routes/customer.js";
import measurementRoutes from "./routes/measurements.js";
import tailorRoutes from "./routes/tailor.js";
import postRoutes from "./routes/TailorPost.js"; 

dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Server is Running");
});

app.use("/user", userRouter);
app.use("/api/customer", customerRoutes);
app.use("/api/measurements", measurementRoutes);
app.use("/api/tailor", tailorRoutes);
app.use("/api/posts", postRoutes);

mongoose.connect("mongodb://localhost:27017/Tailordb")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
