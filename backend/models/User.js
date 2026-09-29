import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
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

  // Password reset: only a SHA-256 hash of the emailed token is stored, so a leaked database
  // can't be used to reset passwords. All three are cleared once the reset succeeds.
  resetPasswordTokenHash: { type: String, index: true },
  resetPasswordExpires: { type: Date },
  resetPasswordRequestedAt: { type: Date },
});

const User = mongoose.model("User", userSchema);

export default User;
