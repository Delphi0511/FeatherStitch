import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import userRouter from "./routes/userRouter.js";
import customerRoutes from "./routes/customer.js";
import measurementRoutes from "./routes/measurements.js";
import tailorRoutes from "./routes/tailor.js";
import postRoutes from "./routes/TailorPost.js";
import publicRoutes from "./routes/public.js";
import orderRoutes from "./routes/orders.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  credentials: true,
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
app.use("/api/public", publicRoutes);
app.use("/api/orders", orderRoutes);

// Must come after all routes: unknown URLs, then any error, both answered as JSON.
app.use(notFound);
app.use(errorHandler);

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/Tailordb";

mongoose.connect(mongoUri)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Hosting platforms (e.g. Render) provide PORT; locally it stays 5000.
const port = Number(process.env.PORT) || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
