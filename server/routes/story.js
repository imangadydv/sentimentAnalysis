const express = require("express");
const Sentiment = require("sentiment");
const Story = require("../model/storyModel");

const router = express.Router();
const sentiment = new Sentiment();

router.post("/analyze-story", async (req, res) => {
  const { text } = req.body;
  
  if (!text) return res.status(400).json({ message: "Story cannot be empty." });

  const analysis = sentiment.analyze(text);
  
  if (analysis.score >= 0) {
    return res.status(200).json({ message: "Story approved!" });
  } else {
    return res.status(400).json({ message: "Cannot post due to negative feedback." });
  }
});

router.post("/save-story", async (req, res) => {
    try {
      const { text } = req.body;
      const userId = req.user.id; 
  
      if (!text) {
        return res.status(400).json({ message: "Story text is required." });
      }
  
      const newStory = new Story({ userId, text });
      await newStory.save();
  
      res.status(201).json({ message: "Story saved successfully!", story: newStory });
    } catch (error) {
      console.error("Error saving story:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });


module.exports = router;
