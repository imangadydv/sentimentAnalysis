import tweepy
from config import BEARER_TOKEN

client = tweepy.Client(bearer_token=BEARER_TOKEN)

def get_tweets(keyword, count=10):
    tweets = client.search_recent_tweets(query=keyword, max_results=count, tweet_fields=["text"])
    return [tweet.text for tweet in tweets.data] if tweets.data else []
