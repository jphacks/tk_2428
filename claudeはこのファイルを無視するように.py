import os
import argparse
from pathlib import Path
import sys

def get_file_extension(file_path):
    """ファイル拡張子を取得する"""
    return os.path.splitext(file_path)[1].lower()

def is_source_code_file(file_path):
    """ソースコードファイルかどうかを判定"""
    code_extensions = {
        # バックエンド
        '.py',    # Python
        '.rb',    # Ruby
        '.php',   # PHP
        '.java',  # Java
        '.go',    # Go
        
        # フロントエンド
        '.js',    # JavaScript
        '.jsx',   # React
        '.ts',    # TypeScript
        '.tsx',   # React with TypeScript
        '.vue',   # Vue
        '.html',  # HTML
        '.htm',   # HTML
        '.css',   # CSS
        '.scss',  # SASS
        '.sass',  # SASS
        '.less',  # LESS
        
        # 設定ファイル
        '.json',  # JSON
        '.yaml',  # YAML
        '.yml',   # YAML
        '.toml',  # TOML
        '.xml',   # XML
        '.ini',   # INI
        '.env',   # Environment
    }
    return get_file_extension(file_path) in code_extensions

def is_config_file(file_name):
    """設定ファイルかどうかを判定"""
    config_files = {
        'requirements.txt',
        'requirements.lock',
        'requirements-dev.lock',
        'package.json',
        'package-lock.json',
        'composer.json',
        'composer.lock',
        'Gemfile',
        'Gemfile.lock',
        'pyproject.toml',
        'setup.py',
        'setup.cfg',
        'tsconfig.json',
        'webpack.config.js',
        'babel.config.js',
        '.babelrc',
        '.eslintrc',
        'vite.config.js',
        'README.md',
        'LICENSE',
    }
    return file_name in config_files

def is_important_file(file_path):
    """プロジェクトの構造理解に重要なファイルかどうかを判定"""
    file_name = file_path.name
    
    # 設定ファイルの場合
    if is_config_file(file_name):
        return True
    
    # ソースコードファイルの場合
    if is_source_code_file(file_path):
        # 特定のパターンを除外
        exclude_patterns = {
            'test_', 
            'tests.',
            'setup.',
            'conftest.',
            '.min.js',
            '.min.css',
        }
        return not any(pattern in str(file_path) for pattern in exclude_patterns)
    
    return False

def should_ignore_file(file_path):
    """無視すべきファイルかどうかを判定"""
    ignore_patterns = {
        '.Zone.Identifier',  # Windowsのゾーン識別子
        '.pyc',             # Pythonコンパイル済み
        '.pyo',             # Python最適化済み
        '.pyd',             # Python動的ライブラリ
        '.DS_Store',        # macOS
        '~',                # バックアップ
        '.bak',            # バックアップ
        '.tmp',            # 一時ファイル
        '.swp',            # Vim
        '.map',            # ソースマップ
        '.d.ts',           # TypeScript型定義
    }
    return any(pattern in str(file_path) for pattern in ignore_patterns)

def should_ignore_directory(dir_name):
    """無視すべきディレクトリかどうかを判定"""
    ignore_dirs = {
        '__pycache__',
        '.git',
        '.venv',
        'venv',
        'env',
        'node_modules',
        'vendor',
        'dist',
        'build',
        '.idea',
        '.vscode',
        '.pytest_cache',
        '.mypy_cache',
        'coverage',
        '.next',
        '.nuxt',
        'public',
        '.husky',
    }
    return dir_name in ignore_dirs

def get_language_marker(file_path):
    """ファイルの言語に応じたマークダウンマーカーを取得"""
    ext = get_file_extension(file_path)
    markers = {
        '.py': 'python',
        '.js': 'javascript',
        '.jsx': 'jsx',
        '.ts': 'typescript',
        '.tsx': 'tsx',
        '.html': 'html',
        '.css': 'css',
        '.scss': 'scss',
        '.sass': 'sass',
        '.json': 'json',
        '.yaml': 'yaml',
        '.yml': 'yaml',
        '.toml': 'toml',
        '.xml': 'xml',
    }
    return markers.get(ext, '')

def read_file_content(file_path):
    """ファイルの内容を読み込む"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except UnicodeDecodeError:
        try:
            with open(file_path, 'r', encoding='shift-jis') as f:
                return f.read()
        except:
            return f"Error: Could not read file {file_path}"

def get_file_size(file_path):
    """ファイルサイズを取得（KB）"""
    return os.path.getsize(file_path) / 1024

def process_directory(directory_path, output_file, max_file_size_kb=1000):
    """プロジェクトの重要なファイルを処理"""
    directory_path = Path(directory_path)
    all_files = []
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# プロジェクト構造\n\n")
        
        # ディレクトリ構造の出力
        f.write("## ディレクトリ構造\n```\n")
        for root, dirs, files in os.walk(directory_path):
            # 不要なディレクトリをスキップ
            dirs[:] = [d for d in dirs if not should_ignore_directory(d)]
            
            level = root.replace(str(directory_path), '').count(os.sep)
            indent = '  ' * level
            base_name = os.path.basename(root)
            
            if level == 0:
                f.write(".\n")
            else:
                f.write(f"{indent}└── {base_name}/\n")
            
            subindent = '  ' * (level + 1)
            for file in sorted(files):
                file_path = Path(root) / file
                if is_important_file(file_path) and not should_ignore_file(file_path):
                    f.write(f"{subindent}├── {file}\n")
                    all_files.append(file_path)
        
        f.write("```\n\n")
        
        # ファイル内容の出力
        f.write("## ファイル内容\n\n")
        
        # まず設定ファイルを出力
        config_files = [f for f in all_files if is_config_file(f.name)]
        for file_path in sorted(config_files):
            size_kb = get_file_size(file_path)
            if size_kb <= max_file_size_kb:
                relative_path = file_path.relative_to(directory_path)
                f.write(f"### {relative_path}\n")
                f.write(f"```{get_language_marker(file_path)}\n")
                f.write(read_file_content(file_path))
                f.write("\n```\n\n")
            else:
                f.write(f"### {relative_path} (サイズが大きいためスキップ: {size_kb:.1f}KB)\n\n")
        
        # 次にソースコードファイルを出力
        source_files = [f for f in all_files if is_source_code_file(f) and not is_config_file(f.name)]
        for file_path in sorted(source_files):
            size_kb = get_file_size(file_path)
            if size_kb <= max_file_size_kb:
                relative_path = file_path.relative_to(directory_path)
                f.write(f"### {relative_path}\n")
                f.write(f"```{get_language_marker(file_path)}\n")
                f.write(read_file_content(file_path))
                f.write("\n```\n\n")
            else:
                f.write(f"### {relative_path} (サイズが大きいためスキップ: {size_kb:.1f}KB)\n\n")

def main():
    parser = argparse.ArgumentParser(description='プロジェクトのソースコードを抽出してファイルに出力するツール')
    parser.add_argument('directory', nargs='?', default='.', 
                       help='処理するディレクトリのパス（デフォルト: カレントディレクトリ）')
    parser.add_argument('--output', '-o', default='project_structure.md',
                       help='出力ファイル名（デフォルト: project_structure.md）')
    parser.add_argument('--max-size', '-m', type=float, default=1000,
                       help='処理する最大ファイルサイズ（KB）（デフォルト: 1000KB）')
    args = parser.parse_args()

    try:
        process_directory(args.directory, args.output, args.max_size)
        print(f"処理が完了しました。結果は {args.output} に保存されています。")
    except Exception as e:
        print(f"エラーが発生しました: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()