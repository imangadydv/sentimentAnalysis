const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const userRoute = require("./routes/user.js")
const postRoutes = require("./routes/post.js");
const storyRoutes = require("./routes/story.js")
const analyzeRoute = require("./routes/analyze.js");
const path = require("path");
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use('/api', userRoute);
app.use('/api/posts', postRoutes);
app.use('/api',storyRoutes);
app.use('/api', analyzeRoute);

// MongoDB Connection
const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("✅ MongoDB Connected");
    } catch (error) {
      console.error("❌ MongoDB Connection Error:", error);
      process.exit(1); // Exit process if connection fails
    }
  };
  

  connectDB();
  app.get("/", (req, res) => {
    res.send("API is running 🚀");
  });
  
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
