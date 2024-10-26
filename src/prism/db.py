"""src/prism/db.py"""
from pymongo import MongoClient

def test_connection():
    # 接続文字
    uri = "mongodb+srv://Argo:Scenekawaii_11@cluster0.zrenn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

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