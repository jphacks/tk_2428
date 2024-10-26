#src/prism/config.py
import os
from dotenv import load_dotenv

load_dotenv('src/prism/config.setting')

class Config:
    #環境変数をブール値として解釈
    DEBUG = os.getenv("DEBUG","False").lower() in ('true', '1', 't')
    MONGODB = os.getenv('MONGODB_URI')
    CLAUDE_API_KEY = os.getenv('CLAUDE_API_KEY')
    CLAUDE_MODEL = os.getenv('CLAUDE_MODEL')

    REQUEST_TIMEOUT = 60
    MONGODB_TIMEOUT = 5
    CLAUDE_API_TIMEOUT = 30
