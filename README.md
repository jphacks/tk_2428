# PRISM
<img src="https://github.com/user-attachments/assets/9a59a741-2543-4c2b-951d-8005968c97e5" width="200">

## 製品概要
### 背景(製品開発のきっかけ、課題等）
18歳になり政治に参加する上で、どの候補者がどのような政策を掲げ、世の中がどう進行しているか理解をしたい。<br>
しかし、政治に関する情報収集において、信頼性の高い情報源の記事は確実性が高い一方で、専門的な表現が多く含まれるため、若者が進んで読むことを妨げている。

<img src="https://github.com/user-attachments/assets/567155f8-104d-413c-951b-82d4960f9b71" width="700">
</br>
引用 : https://news.yahoo.co.jp/articles/311583b7a0a7fcdc9a8a6b54d4608f153f1dbb37

難解な情報を理解するには、相関図を用いてビジュアライズすればよいのではないかと考えた。

### 製品説明（具体的な製品の説明）
PRISMは、政治に関する記事を視覚的に理解するためのツールです。記事の本文やURLを入力するだけで、記事内の政策、人物、およびその関係性を3Dグラフとして表示する。


<img src="https://github.com/user-attachments/assets/6aa6c155-65ed-48d7-9b4d-e15d0f745050" width="700">


|機能||
|------------|-----------|
|①テキストを相関図に変換|・テキストを取り込んでclaudeのanthropic apiによってjsonファイルを生成し、相関図を生成できる<br>・URLはbeautiful soup4によってスクレイピングすることで相関図を生成できる|
|②マウスや画面タッチによる操作|・GUIによる操作で直感的に相関図を移動できる|
|③3Dと2D表示の切り替えが可能|・相関図の3Dと2Dの切り替えができる<br>・3D画面では今後追加する時系列機能で時間による関係の変化を確認できる|

### 特長
#### 1. 特長1 操作が簡単！
基本的な操作はマウス操作のみで行えるうえ、自分の読み込ませたい政治の記事のURLか本文をコピーして貼り付けるだけなので、非常に操作が簡単である。
#### 2. 特長2 グラフベースで理解しやすい！
記事の中から読み取れる事実が相関図として生成されるため、政治的な記事のおおまかな内容をすぐに読み取れる。<br>
各ノードはマウス操作で位置を動かせるため、利用者の理解しやすいようにノード同士を再配置することも可能。
#### 3. 特長3 様々なタイプの政治記事に対応！
政治家などの人物だけでなく、法令もノードとして表すことが出来る。<br>
人同士の関係に加え、法令に対する意見や思想も相関図として出力される。

### 解決出来ること
若者の政治に対する関心の低さ、記事の難解さによる初学者の挫折を記事のビジュアライズによって緩和することができる。<br>
また、複雑で難しいものという政治全体に対するネガティブイメージを払拭する。

PRISMの使い方
アプリケーションについて
PRISMは、政治に関する記事を視覚的に理解するためのツールです。記事の本文やURLを入力するだけで、記事内の政策、人物、およびその関係性を3Dグラフとして表示します。


### 基本操作
#### データの入力
①画面下部の入力欄に記事の本文またはURLを貼り付けます  
②「解析開始」ボタンをクリックして解析を開始します
#### 表示の操作
マウスドラッグ：視点の回転  
スクロール：ズームイン/アウト  
右クリックドラッグ：画面のパン（平行移動）  
ノードのクリック：詳細情報の表示  
ノードのダブルクリック：ダブルクリックしたノードにカメラが近づきます  
#### 表示のカスタマイズ
右上の表示切替  
3D/2D：3次元表示と2次元表示の切り替えができます  
左サイドバーの設定項目  
ノード設定  
・文字サイズ：ノードのラベルテキストの大きさを調整  
・ノードサイズ：ノード自体の大きさを調整
エッジ設定  
・ラベルサイズ：関係を示すテキストの大きさを調整  
・矢印サイズ：ノード間を結ぶ矢印の太さを調整
ノード移動機能  
・「ノードを移動」ボタンをクリックすると、ノードの位置を自由に動かせるようになります  
・もう一度クリックすると移動モードが解除されます  

グラフの見方
四角形のノード：政策や法案を表します  
丸形のノード：人物を表します  
ノード間の矢印：関係性を表します  
矢印上のテキスト：関係性の種類を示します  

データの共有(実装予定)  
右上の「共有」ボタンから、作成したグラフを他のユーザーと共有することができます。

Tips  
ノードをクリックすると、そのノードの詳細情報が表示されます  
関係性が複雑な場合は、ノードを移動して見やすい位置に調整できます  
2D表示に切り替えると、全体の関係性を把握しやすくなります  


### 今後の展望
・政治の記事はまだ関係図のみだと十分な理解ができないため、グラフを追加し、割合のようなデータも視覚化する  
・時系列を含む記事は時間を１つの軸とし、変化を確認できるようにする  
・内容の単語をクリックすると単語の説明をポップアップ表示できるようにする  
・自然言語を入力することで、相関図の移動ができるようにする  
・製作した相関図を共有できるようにする  

### 注力したこと（こだわり等）
* 利用者ができる限りインタラクティブなデザインにするために、ノードやエッジ、ラベルなどの大きさを操作できるようにし、<br>
ノードは位置も動かせるようにした。
* 視覚的な情報で理解を助けるという事を意識し、法令は四角、人物は丸で表し、各ノードには枠線を作り、<br>
各オブジェクト同士の位置関係を把握を助ける平面を作った。

## 開発技術
### 活用した技術
<p style="display: inline">
  <!-- フロントエンドの言語一覧 -->
  <img src="https://img.shields.io/badge/-javascript-eacb32.svg?logo=javascript&style=for-the-badge">
  
  <!-- バックエンドの言語一覧 -->
  <img src="https://img.shields.io/badge/-Python-F2C63C.svg?logo=python&style=for-the-badge">

  <!-- インフラ一覧 -->
  <img src="https://img.shields.io/badge/-heroku-430098.svg?logo=heroku&style=for-the-badge">
  
</p>

#### API・データ
<p style="display: inline">
  <img src="https://img.shields.io/badge/-anthropic-191919.svg?logo=anthropic&style=for-the-badge">
</p>

####  
<p syele="display: inline">
<!-- フロントエンドのフレームワーク一覧 -->
  <img src="https://img.shields.io/badge/-threedotjs-000000.svg?logo=threedotjs&style=for-the-badge">
  <img src="https://img.shields.io/badge/-chartdotjs-000000.svg?logo=chartdotjs&style=for-the-badge">

<!-- バックエンドのフレームワーク一覧 -->
  <img src="https://img.shields.io/badge/-flask-000000.svg?logo=flask&style=for-the-badge">
<img src="https://img.shields.io/badge/-rye-000000.svg?logo=rye&style=for-the-badge">
</p>

#### 対応ブラウザ
<img src="https://img.shields.io/badge/-googlechrome-000000.svg?logo=googlechrome&style=for-the-badge">
<img src="https://img.shields.io/badge/-safari-000000.svg?logo=safari&style=for-the-badge">

※Android, iOSはresponsible design非対応


### 独自技術
#### ハッカソンで開発した独自機能・技術
* なし
#### 特に力を入れた部分
* https://github.com/jphacks/tk_2428/pull/5/commits/3cf34934b05cecbcd2b21f3dee02946643c530b3
* https://github.com/jphacks/tk_2428/pull/7/commits/c93df6ff7d99a4e63087358a01d8cd997f267d4d
