
import mongoose from "mongoose";

const measurementSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },

    type: {
      type: String,
      required: true,
    },

    // Upper Body
    chest: Number,
    waist: Number,
    shoulderWidth: Number,
    sleeveLength: Number,
    armhole: Number,
    neck: Number,
    shirtLength: Number,
    bicep: Number,
    wrist: Number,

    // Female Upper
    bust: Number,
    underbust: Number,
    apex: Number,
    neckDepthFront: Number,
    neckDepthBack: Number,
    topLength: Number,

    // Lower Body
    hip: Number,
    thigh: Number,
    knee: Number,
    calf: Number,
    inseam: Number,
    outseam: Number,
    ankleOpening: Number,

    // Traditional
    kurtiLength: Number,
    salwarLength: Number,
    lehengaLength: Number,
    lehengaWaist: Number,
    lehengaFlare: Number,
    dupattaLength: Number,

    blouseBackStyle: String,

    // Unit chosen for each measurement, keyed by field name (e.g. { chest: "in", dupattaLength: "m" }).
    units: {
      type: Map,
      of: { type: String, enum: ["cm", "in", "m"] },
      default: {},
    },
  },
  { timestamps: true }
);

measurementSchema.index({ userId: 1, gender: 1, type: 1 }, { unique: true });

const Measurement = mongoose.model("Measurement", measurementSchema);

export default Measurement;

