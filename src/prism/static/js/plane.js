//src/prism/static/js/plane.js
import * as THREE from 'three';
export class GridPlane {
  constructor(scene, size = 1000, divisions = 50) {
    // グリッドヘルパーを作成（白色）
    this.grid = new THREE.GridHelper(size, divisions, 0xCCCCCC, 0xCCCCCC);
    this.grid.position.y = -50;
    this.grid.material.opacity = 0.2;
    this.grid.material.transparent = true;

    // 平面を作成（白色）
    const planeGeometry = new THREE.PlaneGeometry(size, size);
    const planeMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xFFFFFF, 
      side: THREE.DoubleSide 
    });
    this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
    this.plane.rotation.x = -Math.PI / 2;
    this.plane.position.y = -50;

    // シーンに追加
    scene.add(this.grid);
    scene.add(this.plane);
  }
}