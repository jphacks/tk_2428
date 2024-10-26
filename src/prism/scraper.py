import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from flask import current_app

def validate_url(url : str) -> bool:
    """URLの検証

    Args:
        url (str): urlのテキスト

    Returns:
        bool: urlのschemeとnet locationがどちらもTrueならTrue
        bool: それ以外はFalse
    """
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except:
        return False
def scrape_article(url: str) -> str:
    if not validate_url(url):
        raise ValueError("無効なURLです")
    try:
        # Userとして接続
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')

        # メタデータは除外
        for tag in soup(['script', 'style', 'header', 'footer', 'nav']):
            tag.decompose()

        article_text = ""  # 本文

        # 一般的な記事本文のセレクタ
        content_selectors = [
            'article',
            'main',
            '[role="main"]',
            '.article-body',
            '.article-content',
            '#article-body',
            '#article-content'
        ]

        for selector in content_selectors:
            content = soup.select_one(selector)
            if content:
                article_text = content.get_text(strip=True)
                break
                
        if not article_text:
            # セレクタがだめなら本文っぽいのを抽出
            paragraphs = soup.find_all('p')
            article_text = ' '.join(p.get_text(strip=True) for p in paragraphs)

        return article_text.strip()
    except Exception as e:
        current_app.logger.error(f"Scraping error: {str(e)}")
        raise  # 元の例外を再送出