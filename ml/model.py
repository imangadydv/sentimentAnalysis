from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from transformers import pipeline
from deepface import DeepFace
import time
from PIL import Image
import numpy as np
from colorthief import ColorThief
import io

analyzer = SentimentIntensityAnalyzer()
# bert_sentiment_analyzer = pipeline("sentiment-analysis", model="nlptown/bert-base-multilingual-uncased-sentiment")

def get_vader_sentiment(text):
    score = analyzer.polarity_scores(text)["compound"]
    sentiment = "Positive" if score > 0.05 else "Negative" if score < -0.05 else "Neutral"
    confidence = abs(score)
    return sentiment, round(confidence, 2)

def get_textblob_sentiment(text):
    polarity = TextBlob(text).sentiment.polarity
    sentiment = "Positive" if polarity > 0.05 else "Negative" if polarity < -0.05 else "Neutral"
    confidence = abs(polarity)
    return sentiment, round(confidence, 2)

# def get_bert_sentiment(text):
#     try:
#         result = bert_sentiment_analyzer(text)[0]
#         label = result["label"]
#         score = result["score"]

#         if "4" in label or "5" in label:
#             sentiment = "Positive"
#         elif "1" in label or "2" in label:
#             sentiment = "Negative"
#         else:
#             sentiment = "Neutral"

#         return sentiment, round(score * 100, 1)
#     except Exception as e:
#         print(f"BERT error: {str(e)}")
#         return "N/A", 0.0
# def get_bert_sentiment(text):
#     try:
#         result = bert_sentiment_analyzer(text)
#         print(f"BERT Raw Output for: {text} >>> {result}")
#         result = result[0]
#         label = result["label"].upper()
#         score = result["score"]

#         if "POSITIVE" in label:
#             sentiment = "Positive"
#         elif "NEGATIVE" in label:
#             sentiment = "Negative"
#         elif "NEUTRAL" in label:
#             sentiment = "Neutral"
#         else:
#             sentiment = "N/A"

#         return sentiment, round(score * 100, 1)
#     except Exception as e:
#         print(f"BERT error: {str(e)}")
#         return "N/A", 0.0



def analyze_sentiment(text):
    vader, vader_conf = get_vader_sentiment(text)
    blob, blob_conf = get_textblob_sentiment(text)
    # bert, bert_conf = get_bert_sentiment(text)

    return {
        "VADER": {"sentiment": vader, "confidence": vader_conf},
        "TextBlob": {"sentiment": blob, "confidence": blob_conf},
        # "BERT Model": {"sentiment": bert, "confidence": bert_conf}
    }

def extract_dominant_colors(image_path, num_colors=3):
    try:
        color_thief = ColorThief(image_path)
        palette = color_thief.get_palette(color_count=num_colors)
        return ['#%02x%02x%02x' % color for color in palette]
    except:
        return []

def analyze_image_sentiment(image_path):
    try:
        start_time = time.time()

        analysis = DeepFace.analyze(image_path, actions=["emotion"], enforce_detection=False)
        emotion_scores = analysis[0].get("emotion", {})
        dominant_emotion = analysis[0].get("dominant_emotion", "")

        sentiment_mapping = {
            "happy": "Positive",
            "sad": "Negative",
            "angry": "Negative",
            "surprise": "Neutral",
            "fear": "Negative",
            "disgust": "Negative",
            "neutral": "Neutral"
        }

        sentiment = sentiment_mapping.get(dominant_emotion.lower(), "Neutral")

        predictions = [
            {
                "emotion": k.capitalize(),
                "confidence": float(round(float(v) / 100, 4))  # Ensure float conversion for JSON safety
            }
            for k, v in sorted(emotion_scores.items(), key=lambda x: x[1], reverse=True)
        ] if emotion_scores else []

        # ✅ Fix: Actually assign confidence
        confidence = float(round(float(emotion_scores.get(dominant_emotion, 0.0)) / 100, 4)) if dominant_emotion else 0.0

        colors = extract_dominant_colors(image_path) or []

        suggestion = {
            "Positive": "Looks cheerful! You can go ahead and post it.",
            "Neutral": "Seems okay. You may post it if it fits your context.",
            "Negative": "The image seems to express negative emotions. Posting is not recommended."
        }.get(sentiment, "No suggestion provided")

        end_time = time.time()
        processing_time = round(end_time - start_time, 2)

        return {
            "emotion": dominant_emotion.capitalize() if dominant_emotion else "Not Detected",
            "sentiment": sentiment,
            "confidence": confidence,
            "predictions": predictions[:3] if predictions else [],
            "colors": colors,
            "suggestion": suggestion,
            "processed_in": f"{processing_time}s" if dominant_emotion else "N/A"
        }

    # except Exception as e:
    #     return {
    #         "emotion": "Not Detected",
    #         "sentiment": "Neutral",
    #         "confidence": 0.0,
    #         "predictions": [],
    #         "colors": [],
    #         "suggestion": "No suggestion provided",
    #         "processed_in": "N/A",
    #         "error": str(e)
    #     }


    except Exception as e:
        return {"error": str(e)}
