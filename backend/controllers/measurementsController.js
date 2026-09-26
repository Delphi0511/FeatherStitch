
import Measurement from "../models/Measurements.js";

// helper to safely convert numbers
// Converts optional form values to numbers so MongoDB receives numeric measurements, not strings.
const num = (val) => {
  if (val === "" || val === undefined || val === null) {
    return undefined;
  }

  return Number(val);
};

// Translates UI field labels into the normalized measurement-schema field names.
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

// Form label -> schema field, used to record which unit each entered value was measured in.
const UNIT_FIELD_KEYS = {
  "CHEST": "chest", "WAIST": "waist", "SHOULDER WIDTH": "shoulderWidth", "SHOULDER": "shoulderWidth",
  "SLEEVE LENGTH": "sleeveLength", "ARMHOLE": "armhole", "NECK": "neck", "SHIRT LENGTH": "shirtLength",
  "BICEP": "bicep", "WRIST": "wrist", "BUST": "bust", "UNDERBUST": "underbust", "APEX (BUST POINT)": "apex",
  "NECK DEPTH (FRONT)": "neckDepthFront", "NECK DEPTH (BACK)": "neckDepthBack", "TOP LENGTH": "topLength",
  "HIP": "hip", "THIGH": "thigh", "KNEE": "knee", "CALF": "calf", "INSEAM": "inseam", "OUTSEAM": "outseam",
  "LENGTH": "outseam", "ANKLE OPENING": "ankleOpening", "KURTI LENGTH": "kurtiLength",
  "SALWAR LENGTH": "salwarLength", "LEHENGA LENGTH": "lehengaLength", "LEHENGA WAIST": "lehengaWaist",
  "LEHENGA FLARE": "lehengaFlare", "DUPATTA LENGTH": "dupattaLength",
};
const ALLOWED_UNITS = ["cm", "in", "m"];

// Collects the unit of every filled-in measurement so values can't be misread later (40 in vs 40 cm).
const mapUnits = (data) => {
  const units = {};
  for (const [label, field] of Object.entries(data)) {
    const key = UNIT_FIELD_KEYS[label];
    if (key && num(field?.value) !== undefined && ALLOWED_UNITS.includes(field?.unit)) {
      units[key] = field.unit;
    }
  }
  return units;
};

// Creates or updates one measurement section for the authenticated customer.
export const saveMeasurement = async (req, res) => {
  try {
    const { gender, type, data } = req.body;
    const userId = req.user.userId;

    if (!userId || !gender || !type || !data) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const mappedData = { ...mapFields(data), units: mapUnits(data) };

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

// Returns only the authenticated customer's measurement records for loading the form.
export const getMeasurements = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own measurements",
      });
    }

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

