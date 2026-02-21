import express from "express";
import bcrypt from "bcrypt";
import User from "../models/User.model.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { email, username, password, confirmPassword } = req.body;

    // Basic validation
    if (!email || !username || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email or username already in use" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save the new user
    const newUser = await User.create({
      email,
      username,
      password: hashedPassword,
    });
    res.status(201).json({
      message: "User registered successfully",
      userId: newUser._id,
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login an existing user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, email: user.email, username: user.username },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
