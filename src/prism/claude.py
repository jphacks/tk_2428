# src/prism/claude.py
import anthropic
from flask import current_app
import json
from math import pi, cos, sin

def analyze_text(text : str):
    """claudeAPIを使用しテキストを解析してグラフデータを作成

    引数:
        text (str): 入力された文字列
    """

    client = anthropic.Anthropic(
        api_key=current_app.config['CLAUDE_API_KEY']
    )

    #プロンプト
    prompt = f"""
入力されたニュース記事から、政治に関連する政策と人物、およびその関係性を抽出し、3D可視化用のJSONデータを生成してください。

【要件】
1. 政策ノード
   - 記事内で言及される具体的な政策や法案
   - 政策の概要説明（140文字以内）

2. 人物ノード
   - 記事内で言及される政治家や関係者
   - 人物の説明（140文字以内）

3. 抽出ルール
   - 政策と人物の関係性が明確な場合のみ抽出
   - 不明確な関係性は推測せず、抽出しない
   - 政治と関係のない記事の場合は抽出失敗とする

【出力形式】
以下の形式のJSONデータのみを出力してください：
{{
  "nodes": [
    {{
      "id": "一意のID",
      "type": "policy" or "person",
      "name": "政策名または人物名",
      "description": "140文字以内の説明",
      "position": {{"x": 0, "y": 0, "z": 0}}
    }}
  ],
  "edges": [
    {{
      "source": "ノードID",
      "target": "ノードID",
      "label": "関係性の説明"
    }}
  ]
}}

入力テキスト：
{text}
"""

    # call claude API
    response = client.messages.create(
        model = current_app.config['CLAUDE_MODEL'],
        max_tokens = 2000,
        messages=[
            {
                "role" : "user",
                "content" : prompt
            }
        ]
    )

    try:
        # レスポンスからJSON形式で抽出
        response_text = response.content[0].text
        graph_data = json.loads(response_text)

        #ノードの位置を動的に設定
        for i, node in enumerate(graph_data['nodes']):
            angle = (2 * pi * i) / len(graph_data['nodes'])
            node['position'] = {
                'x' : 30 * cos(angle),
                'y' : 0,
                'z' : 30 * sin(angle)
            }

            return graph_data
    except Exception as e:
        current_app.logger.error(f"Error : Claude response{e}")
        return None