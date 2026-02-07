import os

# Use project-local folder for DeepFace to avoid permission errors (e.g. ~/.deepface)
os.environ.setdefault("DEEPFACE_HOME", os.path.join(os.path.dirname(os.path.abspath(__file__)), ".deepface"))

from flask import Flask, request, jsonify
from flask_cors import CORS
from model import analyze_sentiment, analyze_image_sentiment
import pandas as pd
from flask import request
import base64
from PIL import Image
from io import BytesIO
from detection import detect_emotion
from deepface import DeepFace
import cv2
import numpy as np
import base64

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/")
def home():
    return "Flask Server is Running!"


@app.route("/analyze-text", methods=["POST"])
def analyze_text():
    """Analyze sentiment of a single text (VADER + TextBlob)."""
    data = request.get_json(silent=True) or {}
    text = (data.get("text") or "").strip()
    if not text:
        return jsonify({"error": "No text provided"}), 400
    try:
        sentiment_result = analyze_sentiment(text)
        vader = sentiment_result.get("VADER", {})
        textblob = sentiment_result.get("TextBlob", {})
        row = {
            "Text": text,
            "VADER Sentiment": f"{vader.get('sentiment', 'N/A')} ({vader.get('confidence', 0) * 100:.1f}%)",
            "TextBlob Sentiment": f"{textblob.get('sentiment', 'N/A')} ({textblob.get('confidence', 0) * 100:.1f}%)",
        }
        return jsonify([row]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Analyze image sentiment
@app.route("/analyze-image", methods=["POST"])
def analyze_image():
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    print("FILES RECEIVED:", request.files)

    image = request.files["image"]
    image_path = os.path.join(UPLOAD_FOLDER, image.filename)
    image.save(image_path)
   
    result = analyze_image_sentiment(image_path)

    return jsonify(result), 200
@app.route('/start-detecting', methods=['POST'])
def detect_sentiment():
    try:
        data = request.get_json()
        image_data = data['image'].split(',')[1]
        img_bytes = base64.b64decode(image_data)
        np_img = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

        result = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)
        emotion = result[0]['dominant_emotion']
        return jsonify({"emotion": emotion})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/analyze_dataset', methods=['POST'])
def analyze_dataset():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        df = pd.read_csv(file)
        if 'text' not in df.columns:
            return jsonify({"error": "CSV must contain a 'text' column"}), 400

        results = []
        for index, row in df.iterrows():
            text = row['text']
            sentiment_result = analyze_sentiment(text)

            vader = sentiment_result.get('VADER', {})
            textblob = sentiment_result.get('TextBlob', {})
            # bert = sentiment_result.get('BERT Model', {})
            
            # Clean BERT output formatting
            # bert_sentiment = bert.get('sentiment', 'N/A')
            # bert_confidence = bert.get('confidence', 0)

            # if bert_sentiment == 'N/A':
            #     bert_result = "N/A"
            # else:
            #     bert_result = f"{bert_sentiment} ({bert_confidence * 100:.1f}%)"
            
            results.append({
                "Text": text,
                "VADER Sentiment": f"{vader.get('sentiment', 'N/A')} ({vader.get('confidence', 0) * 100:.1f}%)",
                "TextBlob Sentiment": f"{textblob.get('sentiment', 'N/A')} ({textblob.get('confidence', 0) * 100:.1f}%)",
                # "BERT Model": bert_result
            })
            
            
            
            print("RESULTS TO FRONTEND >>>", results)

        return jsonify(results), 200
    # try:
    #     df = pd.read_csv(file)
    #     if 'text' not in df.columns:
    #        return jsonify({"error": "CSV must contain a 'text' column"}), 400

    #     results = []
    #     for index, row in df.iterrows():
    #         text = row['text']
    #         sentiment_result = analyze_sentiment(text)

    #         results.append({
    #         "Text": text,
    #         "VADER": {
    #             "Sentiment": sentiment_result['VADER'].get('sentiment', 'N/A'),
    #             "Confidence": f"{sentiment_result['VADER'].get('confidence', 0) * 100:.1f}%"
    #         },
    #         "TextBlob": {
    #             "Sentiment": sentiment_result['TextBlob'].get('sentiment', 'N/A'),
    #             "Confidence": f"{sentiment_result['TextBlob'].get('confidence', 0) * 100:.1f}%"
    #         },
    #         "BERT Model": {
    #             "Sentiment": sentiment_result['BERT Model'].get('sentiment', 'N/A'),
    #             "Confidence": f"{sentiment_result['BERT Model'].get('confidence', 0) * 100:.1f}%"
    #         }
    #     })

    #     return jsonify(results)


    except Exception as e:
        return jsonify({"error": str(e)}), 500






if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port, debug=True)
