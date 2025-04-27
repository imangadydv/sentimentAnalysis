const express = require("express");
const Sentiment = require("sentiment");
const multer = require("multer");
const path = require("path");
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

// POST /api/analyze-post
router.post("/analyze-post", upload.single("image"), async (req, res) => {
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

    const imageUrl = image ? `/uploads/${image.filename}` : null;

    res.status(200).json({
      message: "Post accepted",
      data: {
        caption,
        image: imageUrl,
        sentiment: sentimentResult,
        createdAt: new Date(),
      },
    });
  } catch (err) {
    console.error("Analyze-post error:", err);
    res.status(500).json({ message: "Server error analyzing post" });
  }
});

module.exports = router;
