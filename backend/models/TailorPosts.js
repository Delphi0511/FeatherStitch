import mongoose from "mongoose";

const Schema = mongoose.Schema;

const PostSchema = new Schema(
  {
    tailor: {
      type: Schema.Types.ObjectId,
      ref: "TailorProfile",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    turnaround: {
      type: String,
    },

    tags: [
      {
        type: String,
      },
    ],

    images: [
      {
        type: String,
      },
    ],

    status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Draft",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Post", PostSchema);