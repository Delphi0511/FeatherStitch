import User from "../models/User.js";

export const signup = async (req, res) => {
  try {
    const { email, password, usertype } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    const newUser = new User({
      email,
      password,
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

    if (user.password !== password) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    return res.status(200).json({
      message: "Login successful",
      usertype: user.usertype,
    });

  } catch (err) {
    console.log("Login Error:", err);

    res.status(500).json({
      message: "Error logging in",
    });
  }
};