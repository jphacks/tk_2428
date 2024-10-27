//edge.js
import * as THREE from 'three';
export class Edge {
  constructor(scene, startNode, endNode, label, arrowThickness = 0.1) {
      this.scene = scene;
      this.startNode = startNode;
      this.endNode = endNode;
      this.label = label;  // ラベルを保持
      this.arrowThickness = arrowThickness;
      this.color = 0x9E9E9E; // グレー

      this.createArrow();
      if (this.label) {
          this.createLabel();  // ラベルがある場合は作成
      }
  }

  createArrow() {
      const startPos = this.startNode.getPosition();
      const endPos = this.endNode.getPosition();
      const direction = new THREE.Vector3().subVectors(endPos, startPos).normalize();
      const length = startPos.distanceTo(endPos);

      // 矢印の胴体
      const cylinderLength = length - 2;
      const cylinderGeometry = new THREE.CylinderGeometry(
          this.arrowThickness,
          this.arrowThickness,
          cylinderLength,
          12
      );
      const cylinderMaterial = new THREE.MeshPhongMaterial({
          color: this.color,
          transparent: true,
          opacity: 0.8
      });
      this.cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

      // 位置と向きを設定
      this.cylinder.position.copy(startPos).add(direction.clone().multiplyScalar(cylinderLength / 2));
      this.cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

      // 矢印の先端
      const coneGeometry = new THREE.ConeGeometry(this.arrowThickness * 2, 1, 12);
      const coneMaterial = new THREE.MeshPhongMaterial({
          color: this.color,
          transparent: true,
          opacity: 0.8
      });
      this.cone = new THREE.Mesh(coneGeometry, coneMaterial);

      // 先端の位置と向きを設定
      this.cone.position.copy(startPos).add(direction.clone().multiplyScalar(cylinderLength));
      this.cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

      this.scene.add(this.cylinder);
      this.scene.add(this.cone);
  }

  createLabel() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;

    // 背景は透明に
    context.clearRect(0, 0, canvas.width, canvas.height);

    // テキストのスタイル設定
    const fontSize = Math.min(document.getElementById('edge-label-size').value, 24);
    context.font = `${fontSize}px Arial`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    // テキストの背景を描画
    const textMetrics = context.measureText(this.label);
    const textWidth = textMetrics.width;
    const padding = 8;
    context.fillStyle = 'rgba(255, 255, 255, 0.7)'; // 透明度を0.7に変更
    context.fillRect(
        canvas.width/2 - textWidth/2 - padding,
        canvas.height/2 - fontSize/2 - padding/2,
        textWidth + padding * 2,
        fontSize + padding
    );

    // テキストを描画
    context.fillStyle = '#333333';
    context.fillText(this.label, canvas.width/2, canvas.height/2);

    // スプライトの作成
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true,
        sizeAttenuation: false,
        depthTest: false // これを追加して常に手前に表示
    });
    this.labelSprite = new THREE.Sprite(spriteMaterial);

    // ラベルの位置を矢印の中央に配置（オフセットなし）
    const startPos = this.startNode.getPosition();
    const endPos = this.endNode.getPosition();
    const midPoint = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5);
    
    this.labelSprite.position.copy(midPoint);
    
    // スケールを調整
    const scale = document.getElementById('edge-label-size').value * 0.015;
    this.labelSprite.scale.set(scale * 4, scale * 1, 1);

    this.scene.add(this.labelSprite);

    // カメラの向きに追従
    this.labelSprite.onBeforeRender = (renderer, scene, camera) => {
        this.labelSprite.quaternion.copy(camera.quaternion);
    };
}

update() {
    this.scene.remove(this.cylinder);
    this.scene.remove(this.cone);
    if (this.labelSprite) {
        this.scene.remove(this.labelSprite);
    }
    this.createArrow();
    if (this.label) {
        this.createLabel();
    }

    // ラベルの位置を更新
    if (this.labelSprite) {
        const startPos = this.startNode.getPosition();
        const endPos = this.endNode.getPosition();
        const midPoint = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5);
        const direction = new THREE.Vector3().subVectors(endPos, startPos).normalize();
        const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x).normalize();
        const offset = perpendicular.multiplyScalar(2);
        this.labelSprite.position.copy(midPoint).add(offset);
    }
}
}