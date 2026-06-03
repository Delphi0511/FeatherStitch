import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  usertype: {
    type: String,
    required: true,
  },

  dos: {
    type: Date,
    default: Date.now,
  },

  status: {
    type: Boolean,
    default: true,
  },
});

const User = mongoose.model("User", userSchema);

export default User;