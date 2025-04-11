from flask import Flask, request, jsonify
from flask_cors import CORS
from model import analyze_sentiment, analyze_image_sentiment
import pandas as pd
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/")
def home():
    return "Flask Server is Running!"

# Analyze a single text input
# @app.route("/analyze", methods=["POST"])
# def analyze():
#     data = request.json
#     text = data.get("text", "")

#     if not text:
#         return jsonify({"error": "No text provided"}), 400

#     sentiment_results = analyze_sentiment(text)
#     return jsonify({"sentiments": sentiment_results})

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
    app.run(debug=True)