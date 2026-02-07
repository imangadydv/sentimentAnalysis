const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Post = require("../model/postModel");

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().populate("user", "username").sort({ createdAt: -1 }).limit(50);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const { text, sentiment } = req.body;
    const newPost = new Post({
      user: req.user.id,
      text: text || "",
      sentiment: sentiment || null,
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (String(post.user) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not allowed to delete this post" });
    }
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
