// graph3d.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Node } from './node.js';
import { Edge } from './edge.js';
import { GridPlane } from './plane.js';

class Graph3D {
    constructor() {
        this.initScene();
        this.initRenderer();
        this.initCamera();
        this.initLights();
        this.initGrid();

        // データ構造の初期化
        this.nodes = new Map();
        this.edges = [];

        // レイキャスターの初期化
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        // イベントリスナーとコントロールの設定
        this.setupEventListeners();
        this.setupNodeControls();  // 個別のsetupメソッドを呼び出し
        this.setupViewModeControl();  // 個別のsetupメソッドを呼び出し
        this.setupEdgeControls();  // 個別のsetupメソッドを呼び出し
        
        // 初期データの読み込みとアニメーション開始
        this.loadTestData();
        this.animate();
    }

    // エッジコントロールの設定
    setupEdgeControls() {
        const edgeSizeSlider = document.getElementById('edge-size');
        const edgeLabelSizeSlider = document.getElementById('edge-label-size');

        if (edgeSizeSlider) {
            edgeSizeSlider.addEventListener('input', (e) => {
                const size = parseFloat(e.target.value) * 0.01;
                this.edges.forEach(edge => {
                    edge.arrowThickness = size;
                    edge.update();
                });
            });
        }

        if (edgeLabelSizeSlider) {
            edgeLabelSizeSlider.addEventListener('input', () => {
                this.edges.forEach(edge => {
                    if (edge.label) {
                        edge.update();
                    }
                });
            });
        }
    }

    // ノードコントロールの設定
    setupNodeControls() {
        const nodeSizeSlider = document.getElementById('node-size');
        const textSizeSlider = document.getElementById('text-size');

        if (nodeSizeSlider) {
            nodeSizeSlider.addEventListener('input', (e) => {
                const size = parseFloat(e.target.value);
                this.nodes.forEach(node => node.setSize(size));
            });
        }

        if (textSizeSlider) {
            textSizeSlider.addEventListener('input', (e) => {
                const size = parseFloat(e.target.value);
                this.nodes.forEach(node => node.setTextSize(size));
            });
        }
    }

    // viewモードコントロールの設定
    setupViewModeControl() {
        const viewModeSelect = document.getElementById('view-mode');
        if (viewModeSelect) {
            viewModeSelect.addEventListener('change', (e) => {
                if (e.target.value === '2d') {
                    this.set2DView();
                } else {
                    this.set3DView();
                }
            });
        }
    }

    // シーンの初期化
    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xffffff);
    }

    // レンダラーの初期化
    initRenderer() {
        const container = document.getElementById('graph-container');
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(this.renderer.domElement);
    }

    // カメラの初期化
    initCamera() {
        const container = document.getElementById('graph-container');
        const aspect = container.clientWidth / container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        this.camera.position.set(50, 50, 50);
        this.camera.lookAt(0, 0, 0);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.setupCameraControls();
    }

    // カメラコントロールの詳細設定
    setupCameraControls() {
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 30;
        this.controls.maxDistance = 200;
        this.controls.minPolarAngle = Math.PI / 6;
        this.controls.maxPolarAngle = Math.PI * 5 / 6;
    }

    // ライティングの初期化
    initLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
        directionalLight.position.set(1, 1, 1);

        this.scene.add(ambientLight);
        this.scene.add(directionalLight);
    }

    // グリッドの初期化
    initGrid() {
        this.grid = new GridPlane(this.scene);
    }

    // イベントリスナーの設定
    setupEventListeners() {
        // ウィンドウリサイズ対応
        window.addEventListener('resize', this.handleResize.bind(this));

        // スライダーの値表示更新
        this.setupSliderListeners();

        // アップロードボタンの処理
        this.setupUploadListener();

        window.addEventListener('click', this.onNodeClick.bind(this));
        window.addEventListener('dblclick', this.onMouseDoubleClick.bind(this));
    }

    // スライダーのイベントリスナー設定
    setupSliderListeners() {
        const sliders = document.querySelectorAll('input[type="range"]');
        sliders.forEach(slider => {
            const label = slider.previousElementSibling;
            const span = label.querySelector('span');
            slider.addEventListener('input', () => {
                span.textContent = slider.value;
            });
        });
    }

    // マウス位置の更新
    updateMousePosition(event) {
        const container = document.getElementById('graph-container');
        const bounds = container.getBoundingClientRect();
        this.mouse.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
        this.mouse.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    }

    // ノードダブルクリックイベント
    onMouseDoubleClick(event) {
        this.updateMousePosition(event);
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(Array.from(this.nodes.values()).map(node => node.plane));

        if (intersects.length > 0) {
            const nodeData = intersects[0].object.userData.nodeData;
            alert(nodeData.description);  // descriptionを表示
        }

    }

    // ノードクリックイベント
    onNodeClick(event) {
        this.updateMousePosition(event);
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(Array.from(this.nodes.values()).map(node => node.plane));

        if (intersects.length > 0) {
            const intersectedNode = this.nodes.get(intersects[0].object.userData.nodeData.id);
            this.moveCameraToNode(intersectedNode);  // ノードにカメラを移動
        }
    }

    // カメラを指定ノードに移動
    moveCameraToNode(node) {
        const targetPos = node.getPosition(); // ノードの位置を取得
        console.log('Target Position:', targetPos); // デバッグ用ログ

        // カメラの位置をノードの位置に設定（少し上から見下ろすように調整）
        this.camera.position.set(targetPos.x, targetPos.y + 10, targetPos.z + 10);
        this.controls.target.copy(targetPos); // カメラの注視点をノードの位置に設定
        this.controls.update(); // コントロールを更新
    }

    // アップロードボタンのイベントリスナー設定
    setupUploadListener() {
        const uploadBtn = document.getElementById('upload-btn');
        uploadBtn.addEventListener('click', this.handleUpload.bind(this));
    }

    // ウィンドウリサイズハンドラ
    handleResize() {
        const container = document.getElementById('graph-container');
        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }

    // アップロード処理
    async handleUpload() {
        const input = document.getElementById('text-input').value;
        if (!input) return;
    
        const button = document.getElementById('upload-btn');
        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = '解析中...';
    
        try {
            // URLかテキストかを判断
            const isUrl = input.startsWith('http://') || input.startsWith('https://');
            const endpoint = isUrl ? '/api/analyze-url' : '/api/analyze';
            const payload = isUrl ? { url: input } : { text: input };
    
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || '解析に失敗しました');
            }
    
            const data = await response.json();
            this.clearGraph();
            this.renderGraph(data);
        } catch (error) {
            console.error('Error analyzing content:', error);
            alert(error.message);
        } finally {
            button.disabled = false;
            button.textContent = originalText;
        }
    }

    // ノードコントロールの設定
    setupNodeControls() {
        document.getElementById('node-size').addEventListener('input', (e) => {
            const size = parseFloat(e.target.value);
            this.nodes.forEach(node => node.setSize(size));
        });

        document.getElementById('text-size').addEventListener('input', (e) => {
            const size = parseFloat(e.target.value);
            this.nodes.forEach(node => node.setLabelSize(size));
        });
    }

    // 表示モード切り替えの設定
    setupViewModeControl() {
        document.getElementById('view-mode').addEventListener('change', (e) => {
            if (e.target.value === '2d') {
                this.set2DView();
            } else {
                this.set3DView();
            }
        });
    }

    // 2Dビューの設定
    set2DView() {
        this.camera.position.set(0, 80, 0);
        this.camera.lookAt(0, 0, 0);
        this.controls.enableRotate = false;
    }

    // 3Dビューの設定
    set3DView() {
        this.camera.position.set(50, 50, 50);
        this.camera.lookAt(0, 0, 0);
        this.controls.enableRotate = true;
    }

    // グラフのクリア
    clearGraph() {
        this.nodes.forEach(node => {
            this.scene.remove(node.plane);
            this.scene.remove(node.outline);
            if (node.textSprite) this.scene.remove(node.textSprite);
        });

        this.edges.forEach(edge => {
            this.scene.remove(edge.cylinder);
            this.scene.remove(edge.cone);
            if (edge.labelSprite) this.scene.remove(edge.labelSprite);
        });

        this.nodes.clear();
        this.edges = [];
    }

    // アニメーションループ
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.controls.update();
        this.nodes.forEach(node => node.update(this.camera));
        this.renderer.render(this.scene, this.camera);
    }

    // テストデータの読み込み
    async loadTestData() {
        try {
            const response = await fetch('/api/test-graph');
            const data = await response.json();
            this.renderGraph(data);
        } catch (error) {
            console.error('Error loading test data:', error);
        }
    }

    renderGraph(data) {
        // ノードの作成
        data.nodes.forEach(nodeData => {
            const node = new Node(this.scene, this.camera, nodeData);
            node.setPosition(nodeData.position.x, nodeData.position.y, nodeData.position.z);
            this.nodes.set(nodeData.id, node);
        });

        // エッジの作成
        data.edges.forEach(edgeData => {
            const startNode = this.nodes.get(edgeData.source);
            const endNode = this.nodes.get(edgeData.target);
            if (startNode && endNode) {
                // エッジ作成時にラベルと太さを渡す
                const edge = new Edge(
                    this.scene,
                    startNode,
                    endNode,
                    edgeData.label,  // ラベルを渡す
                    document.getElementById('edge-size').value * 0.01  // 矢印の太さ
                );
                this.edges.push(edge);
            }
        });
    }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    try {
        new Graph3D();
    } catch (error) {
        console.error('Failed to initialize Graph3D:', error);
    }
});

export default Graph3D;