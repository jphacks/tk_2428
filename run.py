import os
from src.prism import create_app

app = create_app()

#devブランチへ切替
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)  