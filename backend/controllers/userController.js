import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


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
