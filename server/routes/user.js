const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../model/userModel.js"); 
const Post = require("../model/postModel.js");
const router = express.Router();

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
  

module.exports = router;
