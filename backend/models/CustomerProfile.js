import mongoose from "mongoose";

const Schema = mongoose.Schema;

const CustomerSchema = new Schema({
  emailId: { type: String, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  gender: { type: String, required: true },
  profilePic: { type: String },
});

const CustomerProfile = mongoose.model(
  "CustomerProfile",
  CustomerSchema
);

export default CustomerProfile;