//node.js
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
    const geometry = new THREE.PlaneGeometry(this.size * 2, this.size * 2);
    const material = new THREE.MeshPhongMaterial({
      color: color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    this.plane = new THREE.Mesh(geometry, material);

    // ノードデータをuserData
    this.plane.userData.nodeData = data;

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
  }

  createText() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;

    // 背景を透明に
    context.fillStyle = 'rgba(255, 255, 255, 0)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // テキストを描画
    context.fillStyle = '#000000';
    context.font = 'bold 24px Arial';
    context.textAlign = 'center';
    context.fillText(this.data.name, canvas.width/2, canvas.height/2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMaterial = new THREE.SpriteMaterial({ 
      map: texture,
      transparent: true
    });
    this.textSprite = new THREE.Sprite(spriteMaterial);
    this.textSprite.scale.set(5, 2.5, 1);
    
    this.scene.add(this.textSprite);
  }

  setPosition(x, y, z) {
    this.plane.position.set(x, y, z);
    this.outline.position.set(x, y, z);
    if (this.textSprite) {
      this.textSprite.position.set(x, y, z);
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
    newSize /= 5.0;
    this.size = newSize;
    this.plane.scale.set(newSize, newSize, 1);
    this.outline.scale.set(newSize, newSize, 1);
    // this.setLabelSize(newSize);
    // ノードのサイズ変更に伴ってテキストのサイズを変更するときはコメントアウトを外す
  }

  getPosition() {
    return this.plane.position;
  }

  // カメラに向けてノードを回転
  update(camera) {
    this.plane.quaternion.copy(camera.quaternion);
    this.outline.quaternion.copy(camera.quaternion);
  }
}