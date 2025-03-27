import json
from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from transformers import pipeline
from deepface import DeepFace

# Initialize sentiment analyzers
analyzer = SentimentIntensityAnalyzer()
bert_sentiment_analyzer = pipeline("text-classification", model="nlptown/bert-base-multilingual-uncased-sentiment")

# Sentiment analysis functions for text
def get_vader_sentiment(text):
    score = analyzer.polarity_scores(text)["compound"]
    return "Positive" if score > 0.05 else "Negative" if score < -0.05 else "Neutral"

def get_textblob_sentiment(text):
    polarity = TextBlob(text).sentiment.polarity
    return "Positive" if polarity > 0.05 else "Negative" if polarity < -0.05 else "Neutral"

def get_bert_sentiment(text):
    result = bert_sentiment_analyzer(text)[0]
    label = result["label"]
    if "5 stars" in label or "4 stars" in label:
        return "Positive"
    elif "1 star" in label or "2 stars" in label:
        return "Negative"
    else:
        return "Neutral"

# Function to analyze text sentiment
def analyze_sentiment(text):
    return {
        "VADER": get_vader_sentiment(text),
        "TextBlob": get_textblob_sentiment(text),
        "BERT Model": get_bert_sentiment(text),
    }

# Function to analyze image sentiment using DeepFace
def analyze_image_sentiment(image_path):
    try:
        analysis = DeepFace.analyze(image_path, actions=["emotion"], enforce_detection=False)
        emotion = analysis[0]["dominant_emotion"]

        # Map emotions to sentiment labels
        sentiment_mapping = {
            "happy": "Positive",
            "sad": "Negative",
            "angry": "Negative",
            "surprise": "Neutral",
            "fear": "Negative",
            "disgust": "Negative",
            "neutral": "Neutral"
        }

        return sentiment_mapping.get(emotion, "Neutral")
    except Exception as e:
        return f"Error analyzing image: {str(e)}"

