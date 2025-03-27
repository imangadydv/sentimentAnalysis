from flask import Flask, request, jsonify
from flask_cors import CORS
from model import analyze_sentiment, analyze_image_sentiment
import os

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/")
def home():
    return "Flask Server is Running!"

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.json
    text = data.get("text", "")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    sentiment_results = analyze_sentiment(text)
    return jsonify({"sentiments": sentiment_results})

@app.route("/analyze-image", methods=["POST"])
def analyze_image():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    image = request.files["image"]
    image_path = os.path.join(UPLOAD_FOLDER, image.filename)
    image.save(image_path)

    sentiment = analyze_image_sentiment(image_path)
    return jsonify({"sentiment": sentiment})

if __name__ == "__main__":
    app.run(debug=True)
