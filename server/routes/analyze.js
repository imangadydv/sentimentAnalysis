const express = require("express");
const Sentiment = require("sentiment");
const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");
const Post = require("../model/postModel");
const router = express.Router();

// Setup multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Ensure this folder exists
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

const sentiment = new Sentiment();

// Helper function to analyze sentiment
const analyzeSentiment = (text) => {
  const result = sentiment.analyze(text);
  if (result.score < 0) return "negative";
  if (result.score === 0) return "neutral";
  return "positive";
};

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    req.decoded = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(403).json({ message: "Invalid token" });
  }
};

// POST /api/analyze-post – validate sentiment, save to DB, return saved post
router.post("/analyze-post", verifyToken, upload.single("image"), async (req, res) => {
  try {
    const { caption } = req.body;
    const image = req.file;

    if (!caption && !image) {
      return res.status(400).json({ message: "Caption or image is required" });
    }

    const sentimentResult = analyzeSentiment(caption || "");

    if (sentimentResult === "negative") {
      return res.status(400).json({ message: "Cannot post due to negative sentiment" });
    }

    const imagePath = image ? `/uploads/${image.filename}` : null;

    const newPost = new Post({
      user: req.decoded.id,
      text: caption || "",
      image: imagePath,
      sentiment: sentimentResult,
    });
    await newPost.save();
    const populated = await Post.findById(newPost._id).populate("user", "username");

    res.status(200).json({
      message: "Post accepted",
      data: {
        _id: newPost._id,
        caption: newPost.text,
        image: newPost.image,
        sentiment: newPost.sentiment,
        createdAt: newPost.createdAt,
        user: populated?.user,
      },
    });
  } catch (err) {
    console.error("Analyze-post error:", err);
    res.status(500).json({ message: "Server error analyzing post" });
  }
});

module.exports = router;
