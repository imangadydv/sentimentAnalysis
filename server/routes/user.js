const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../model/userModel.js"); 
const Post = require("../model/postModel.js");
const router = express.Router();
const bcrypt = require("bcryptjs");

router.get("/profile", async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1]; 
      if (!token) {
        console.log("❌ No token found!");
        return res.status(401).json({ message: "Unauthorized" });
      }  
      const decoded = jwt.verify(token, process.env.JWT_SECRET); 
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        console.log("❌ User not found in DB");
        return res.status(404).json({ message: "User not found" });
      } 
      res.json(user);
    } catch (error) {
      console.error("❌ Server Error:", error);
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
