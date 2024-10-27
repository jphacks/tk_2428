#src/prism/routes.py
from flask  import Blueprint, render_template, jsonify, request
from .db    import test_connection
from .claude import analyze_text
from .scraper import scrape_article, validate_url
main = Blueprint('main',__name__)

@main.route('/')
def index():
    return render_template('base.html')

@main.route('/api/test-db')
def test_db():
    success = test_connection()
    return jsonify({"success": success})

@main.route('/api/test-graph')
def test_graph():
    test_data = {
        "nodes": [
            {
                "id": "policy1",
                "type": "policy",
                "name": "デジタル社会推進法案",
                "description": "2024年度内の成立を目指す法案",
                "position": {"x": 0, "y": 0, "z": 0}
            },
            {
                "id": "person1",
                "type": "person",
                "name": "山田太郎",
                "description": "内閣総理大臣",
                "position": {"x": 30, "y": 0, "z": 30}
            },
            {
                "id": "policy2",
                "type": "policy",
                "name": "AI規制法案",
                "description": "AI開発に関する規制法案",
                "graph-labels": ["Category A", "Category B", "Category C", "Category D", "Category E", "Category F"],
                "graph-value": [10, 35, 23, 7, 2, 23],
                "position": {"x": -30, "y": 0, "z": 30}
            },
            {
                "id": "person2",
                "type": "person",
                "name": "鈴木花子",
                "description": "デジタル大臣",
                "position": {"x": 0, "y": 0, "z": 60}
            }
        ],
        "edges": [
            {
                "source": "person1",
                "target": "policy1",
                "label": "提案"
            },
            {
                "source": "person2",
                "target": "policy1",
                "label": "推進"
            },
            {
                "source": "person2",
                "target": "policy2",
                "label": "担当"
            }
        ]
    }
    return jsonify(test_data)

@main.route('/api/analyze', methods = ['POST'])
def analyze():
    if not request.is_json:
        return jsonify({"error" : "コンテンツの形式はjson形式である必要があります"
                        }), 400
    text = request.json.get('text')
    if not text:
        return jsonify({"error" : "テキストが送信されていません"}), 400
    graph_data = analyze_text(text)
    if graph_data is None:
        # 処理中になんらかのエラーが発生してもこっちのエラーがでる、クライアントのせいだね
        return jsonify({"error" : """分析に失敗しました、
                        テキストは政治に関連する記事などのコピペである必要があります"""
                        }), 422
    return jsonify(graph_data)



@main.route('/api/analyze-url', methods=['POST'])
def analyze_url():
    if not request.is_json:
        return jsonify({"error": "コンテンツの形式はJSON形式である必要があります"}), 400
    
    url = request.json.get('url')
    if not url:
        return jsonify({"error": "URLが送信されていません"}), 400

    try:
        # URLの検証
        if not validate_url(url):
            return jsonify({"error": "無効なURLです"}), 400
            
        # URLからテキストを取得
        article_text = scrape_article(url)
        if not article_text:
            return jsonify({"error": "記事の取得に失敗しました"}), 422
            
        # テキストを解析
        graph_data = analyze_text(article_text)
        if graph_data is None:
            return jsonify({"error": "分析に失敗しました。政治に関連する記事である必要があります"}), 422
            
        return jsonify(graph_data)
        
    except Exception as e:
        current_app.logger.error(f"Error processing URL: {str(e)}")
        return jsonify({"error": "記事の処理中にエラーが発生しました"}), 500