import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// ページの読み込みを待つ
window.addEventListener("DOMContentLoaded", init);

function init() {
    // サイズを指定
    const width = window.innerWidth;
    const height = window.innerHeight;

    const canvasElement = document.querySelector("#myCanvas");
    // レンダラーを作成
    const renderer = new THREE.WebGLRenderer({
        canvas: canvasElement,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff);
    document.body.appendChild(renderer.domElement);

    // シーンを作成し、グローバル変数に保存
    const scene = new THREE.Scene();
    window.scene = scene;  // グローバル変数としてシーンを保存

    // カメラを作成
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 100, 600);

    // カメラコントローラーを作成
    const controls = new OrbitControls(camera, canvasElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.2;

    tick();

    // 毎フレーム時に実行されるループイベントです
    function tick() {
        controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(tick);
    }
}
