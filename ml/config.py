import os
from dotenv import load_dotenv

load_dotenv()  

BEARER_TOKEN = os.getenv("TWITTER_BEARER_TOKEN")  
