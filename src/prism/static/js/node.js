import * as THREE from 'three';

export class Node {
  constructor(scene, camera, data, size = 1) {
    this.scene = scene;
    this.camera = camera;
    this.size = size;
    this.data = data;

    // ノードの色を設定（政策：緑、人物：青）
    const color = data.type === 'policy' ? 0x4CAF50 : 0x2196F3;

    // 四角形のジオメトリとマテリアルを作成
    const geometry = data.type === 'policy' 
      ? new THREE.PlaneGeometry(this.size * 2, this.size * 2)
      : new THREE.CircleGeometry(this.size * 2, 32);
    const material = new THREE.MeshPhongMaterial({
      color: color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    this.plane = new THREE.Mesh(geometry, material);

    // 枠線の追加
    const edges = new THREE.EdgesGeometry(geometry);
    this.outline = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0x000000 })
    );

    // テキストを作成
    this.createText();

    // シーンに追加
    this.scene.add(this.plane);
    this.scene.add(this.outline);

    // グラフのデータが存在する場合はグラフを作成
    if ('graph-labels' in this.data && 'graph-values' in this.data) {
      this.createChart();
    }
  }
  createText() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;

    // スライダーから初期値を取得
    const fontSize = document.getElementById('text-size').value;
    
    // 背景を透明に
    context.fillStyle = 'rgba(255, 255, 255, 0)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // テキストを描画（スライダーの値を使用）
    context.fillStyle = '#000000';
    context.font = `${fontSize}px Arial`;
    context.textAlign = 'center';
    context.fillText(this.data.name, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true
    });
    this.textSprite = new THREE.Sprite(spriteMaterial);
    
    // スケールを fontSize に基づいて調整
    const scale = fontSize / 24;  // 24pxを基準とした比率
    this.textSprite.scale.set(5 * scale, 2.5 * scale, 1);

    this.scene.add(this.textSprite);
}
  createChart() {
    // Canvas要素を作成し、Chart.jsで円グラフを描画
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Chart.jsで円グラフを描画
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: this.data['graph-labels'], // ラベル
        datasets: [{
          data: this.data['graph-value'], // データ
          backgroundColor: this.data['graph-labels'].map(() =>
            `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.5)`
          ),
          borderWidth: 1
        }]
      },
      options: {
        responsive: false // サイズ固定のためにレスポンシブ無効
      }
    });

    // Chart.jsで描画したCanvasをテクスチャとしてTHREE.jsに渡す
    const texture = new THREE.CanvasTexture(canvas);
    const chartGeometry = new THREE.PlaneGeometry(this.size * 2, this.size * 2);
    const chartMaterial = new THREE.MeshBasicMaterial({ map: texture });

    // グラフ用のMeshを作成し、保存
    this.graph = new THREE.Mesh(chartGeometry, chartMaterial);
    this.graph.position.set(this.plane.positoin.x + 2, this.plane.position.y, this.plane.position.z);
  }

  setPosition(x, y, z) {
    this.plane.position.set(x, y, z); 
    this.outline.position.set(x, y, z);
    if (this.textSprite) {
      this.textSprite.position.set(x, y, z);
    }
    if (this.graph) {
      this.graph.position.set(x + 2, y, z); // グラフはノードの横に配置
    }
  }

  // ラベルのサイズ変更
  setLabelSize(newSize) {
    newSize /= 5.0;
    if (this.textSprite) {
      this.textSprite.scale.set(newSize * 5, newSize * 2.5, 1);
    }
  }

  // ノードのサイズ変更
  setSize(newSize) {
    const scaledSize = newSize / 5.0;  // スケーリング係数を適用
    this.size = scaledSize;
    this.plane.scale.set(scaledSize, scaledSize, 1);
    this.outline.scale.set(scaledSize, scaledSize, 1);
    if (this.graph) {
      this.graph.scale.set(scaledSize, scaledSize, 1);
    }
  }

  getPosition() {
    return this.plane.position;
  }

  // カメラに向けてノードを回転
  update(camera) {
    this.plane.quaternion.copy(camera.quaternion);
    this.outline.quaternion.copy(camera.quaternion);
    if (this.graph) {
      this.graph.quaternion.copy(camera.quaternion);
    }
  }
}
