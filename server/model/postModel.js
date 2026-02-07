const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      default: "",
    },
    image: { type: String, default: null },
    sentiment: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
