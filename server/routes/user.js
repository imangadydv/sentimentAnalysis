const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const User = require("../model/userModel.js");
const Post = require("../model/postModel.js");
const router = express.Router();
const bcrypt = require("bcryptjs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `avatar-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } }); // 2MB

router.get("/profile", async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const posts = await Post.find({ user: user._id }).sort({ createdAt: -1 });
      const stories = posts.map((p) => ({
        _id: p._id,
        caption: p.text,
        image: p.image,
        sentiment: p.sentiment,
        createdAt: p.createdAt,
      }));
      res.json({ ...user.toObject(), stories });
    } catch (error) {
      console.error("❌ Server Error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

router.patch("/profile", upload.single("avatar"), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    if (req.body.bio !== undefined) user.bio = String(req.body.bio).slice(0, 160);
    if (req.file && req.file.path) user.avatar = "/uploads/" + req.file.filename;
    await user.save();
    res.json(user);
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

  router.get("/", async (req, res) => {
    try {
      const posts = await Post.find().populate("user", "username email").sort({ createdAt: -1 });
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  router.post("/register", async (req, res) => {
    try {
      const { username, email, password } = req.body;
  
      // Check if user exists
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ message: "User already exists" });
  
      // Create new user
      user = new User({ username, email, password });
      await user.save();
  
      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Login User
  router.post("/login", async (req, res) => {
    try {
      const { username, password } = req.body;
  
      const user = await User.findOne({ username });
      if (!user) return res.status(400).json({ message: "Invalid credentials" });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
  
      // Generate JWT Token
      const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" });
  
      res.json({ message: "Login successful", token });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Protected Route Example
  router.get("/user", async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
  
      if (!token) return res.status(401).json({ message: "No token, authorization denied" });
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
  
      res.json(user);
    } catch (error) {
      res.status(401).json({ message: "Invalid token" });
    }
  });

module.exports = router;
