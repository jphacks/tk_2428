"""src/prism/db.py"""
from pymongo import MongoClient
import os

def test_connection():
    # 接続文字
    uri =os.getenv("MONGODB_URI")

    try:
        # クライアントの作成
        client = MongoClient(uri)
        #pingコマンドで確認
        client.admin.command('ping')
        print("Success")
        return True
    except Exception as e:
        print(f"False : {e}")
        return False
    finally:
        client.close()

if __name__ == "__main__":
    test_connection()