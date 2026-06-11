import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


export const signup = async (req, res) => {
  try {
    const { email, password, usertype } = req.body;

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
});

  } catch (err) {
    console.log("Login Error:", err);

    res.status(500).json({
      message: "Error logging in",
    });
  }
};