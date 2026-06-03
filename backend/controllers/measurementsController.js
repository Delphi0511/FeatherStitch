
import Measurement from "../models/Measurements.js";

// helper to safely convert numbers
const num = (val) => {
  if (val === "" || val === undefined || val === null) {
    return undefined;
  }

  return Number(val);
};

const mapFields = (data) => ({
  // Male Upper
  chest: num(data["CHEST"]?.value),
  waist: num(data["WAIST"]?.value),
  shoulderWidth: num(
    data["SHOULDER WIDTH"]?.value ||
    data["SHOULDER"]?.value
  ),

  sleeveLength: num(data["SLEEVE LENGTH"]?.value),
  armhole: num(data["ARMHOLE"]?.value),
  neck: num(data["NECK"]?.value),

  shirtLength: num(
    data["SHIRT LENGTH"]?.value ||
    data["TOP LENGTH"]?.value
  ),

  bicep: num(data["BICEP"]?.value),
  wrist: num(data["WRIST"]?.value),

  // Female Upper
  bust: num(data["BUST"]?.value),
  underbust: num(data["UNDERBUST"]?.value),

  apex: num(data["APEX (BUST POINT)"]?.value),

  neckDepthFront: num(
    data["NECK DEPTH (FRONT)"]?.value
  ),

  neckDepthBack: num(
    data["NECK DEPTH (BACK)"]?.value
  ),

  topLength: num(data["TOP LENGTH"]?.value),

  // Lower Body
  hip: num(data["HIP"]?.value),
  thigh: num(data["THIGH"]?.value),
  knee: num(data["KNEE"]?.value),
  calf: num(data["CALF"]?.value),

  inseam: num(
    data["INSEAM"]?.value ||
    data["INSEAM (INSIDE LEG)"]?.value
  ),

  outseam: num(
    data["OUTSEAM"]?.value ||
    data["OUTSEAM (FULL LENGTH)"]?.value ||
    data["LENGTH"]?.value
  ),

  ankleOpening: num(
    data["ANKLE OPENING"]?.value ||
    data["BOTTOM / ANKLE OPENING"]?.value
  ),

  // Traditional
  kurtiLength: num(data["KURTI LENGTH"]?.value),

  salwarLength: num(data["SALWAR LENGTH"]?.value),

  lehengaLength: num(data["LEHENGA LENGTH"]?.value),

  lehengaWaist: num(data["LEHENGA WAIST"]?.value),

  lehengaFlare: num(data["LEHENGA FLARE"]?.value),

  dupattaLength: num(data["DUPATTA LENGTH"]?.value),

  blouseBackStyle:
    data["BLOUSE BACK STYLE"]?.value,
});

export const saveMeasurement = async (req, res) => {
  try {
    const { userId, gender, type, data } = req.body;

    if (!userId || !gender || !type || !data) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const mappedData = mapFields(data);

    let existing = await Measurement.findOne({
      userId,
      gender,
      type,
    });

    if (existing) {
      Object.assign(existing, mappedData);

      await existing.save();

      return res.json({
        success: true,
        message: "Measurements updated successfully",
      });
    }

    const newMeasurement = new Measurement({
      userId,
      gender,
      type,
      ...mappedData,
    });

    await newMeasurement.save();

    res.status(201).json({
      success: true,
      message: "Measurements saved successfully",
    });

  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getMeasurements = async (req, res) => {
  try {
    const { userId } = req.params;

    const measurements = await Measurement.find({
      userId,
    });

    res.json(measurements);

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

