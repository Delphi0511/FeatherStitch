import crypto from "crypto";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendMail } from "../config/mailer.js";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // reset links work for 1 hour
const RESET_REQUEST_COOLDOWN_MS = 60 * 1000; // at most one reset email per account per minute
const MIN_PASSWORD_LENGTH = 6;

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");


// Creates a credential record with a hashed password so new users can authenticate safely.
export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Normalize the role so "customer"/"tailor" can't be stored and later fail role checks.
    const usertype = { customer: "Customer", tailor: "Tailor" }[String(req.body.usertype ?? "").toLowerCase()];
    if (!email || !password || !usertype) {
      return res.status(400).json({
        message: "Email, password and a valid user type (Customer or Tailor) are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(
  password,
  10
);

const newUser = new User({
  email,
  password: hashedPassword,
  usertype,
});

    await newUser.save();

    res.json({
      message: "User registered successfully",
    });

  } catch (err) {
    console.log("Signup Error:", err);

    res.status(500).json({
      message: "Error registering user",
    });
  }
};

// Verifies credentials and returns a signed identity token used by protected application requests.
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(
  password,
  user.password
);

if (!isMatch) {
  return res.status(400).json({
    message: "Invalid password",
  });
}
 //creating jwt token for user
    const token = jwt.sign(
  {
    userId: user._id,
    email: user.email,
    usertype: user.usertype,
  },
  process.env.JWT_SECRET,
  {
    expiresIn: "7d",
  }
);

return res.status(200).json({
  message: "Login successful",
  token,
  usertype: user.usertype,
  userId: user._id,
  email: user.email
});

  } catch (err) {
    console.log("Login Error:", err);

    res.status(500).json({
      message: "Error logging in",
    });
  }
};

// Emails a one-time, 1-hour password reset link. The reply is identical whether or not the
// email is registered, so this endpoint can't be used to discover accounts.
export const forgotPassword = async (req, res) => {
  const genericReply = {
    message: "If an account exists for that email, we've sent a link to reset the password.",
  };

  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    if (!email) {
      return res.status(400).json({ message: "Please enter your email" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(200).json(genericReply);

    const recentlyRequested =
      user.resetPasswordRequestedAt && Date.now() - user.resetPasswordRequestedAt.getTime() < RESET_REQUEST_COOLDOWN_MS;
    if (recentlyRequested) return res.status(200).json(genericReply);

    const token = crypto.randomBytes(32).toString("hex");
    // updateOne (not save) so old accounts that fail newer schema rules can still reset.
    await User.updateOne(
      { _id: user._id },
      {
        resetPasswordTokenHash: hashToken(token),
        resetPasswordExpires: new Date(Date.now() + RESET_TOKEN_TTL_MS),
        resetPasswordRequestedAt: new Date(),
      }
    );

    const link = `${process.env.CLIENT_ORIGIN || "http://localhost:5173"}/reset-password?token=${token}`;
    try {
      await sendMail({
        to: user.email,
        subject: "Reset your FeatherStitch password",
        text: `We received a request to reset your FeatherStitch password.\n\nOpen this link to choose a new password (valid for 1 hour):\n${link}\n\nIf you didn't ask for this, you can ignore this email.`,
        html: `<p>We received a request to reset your FeatherStitch password.</p>
<p><a href="${link}" style="display:inline-block;padding:10px 18px;background:#0891b2;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">Choose a new password</a></p>
<p style="color:#555">This link works once and expires in 1 hour. If you didn't ask for this, you can ignore this email.</p>`,
      });
    } catch (mailErr) {
      // Still send the generic reply so failures don't reveal which emails are registered.
      console.error("Password reset email failed:", mailErr.message);
    }

    return res.status(200).json(genericReply);
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

// Sets a new password when given a valid, unexpired reset token; the token then stops working.
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) {
      return res.status(400).json({ message: "This reset link is invalid. Please request a new one." });
    }
    if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
    }

    const user = await User.findOne({
      resetPasswordTokenHash: hashToken(token),
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) {
      return res.status(400).json({ message: "This reset link is invalid or has expired. Please request a new one." });
    }

    await User.updateOne(
      { _id: user._id },
      {
        password: await bcrypt.hash(password, 10),
        $unset: { resetPasswordTokenHash: 1, resetPasswordExpires: 1, resetPasswordRequestedAt: 1 },
      }
    );

    return res.status(200).json({ message: "Your password has been updated. You can now log in." });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};
