#run.py
from src.prism  import create_app

app = create_app()

#devブランチへ切替
if __name__ == '__main__':
    app.run(debug=True)