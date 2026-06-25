import mongoose from "mongoose";

const Schema = mongoose.Schema;

const TailorSchema = new Schema({
  name: { type: String },
  dob: { type: String },
  gender: { type: String },
  aadharNo: { type: String },

  category: { type: String },
  speciality: { type: String },
  workType: { type: String },
  website: { type: String },
  since: { type: String },
  otherInfo: { type: String },

  email: { type: String, required: true, unique: true },

  phone: { type: String },

  address: { type: String },
  city: { type: String },
  state: { type: String },

  shopAddress: { type: String },
  shopCity: { type: String },

  profilePic: { type: String },
});

const TailorProfile = mongoose.model(
  "TailorProfile",
  TailorSchema
);

export default TailorProfile;