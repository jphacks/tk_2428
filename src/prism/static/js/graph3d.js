// graph3d.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { Node } from './node.js';
import { Edge } from './edge.js';
import { GridPlane } from './plane.js';

class Graph3D {
    constructor() {
        // シーン、レンダラー、カメラの初期化
        this.initScene();
        this.initRenderer();
        this.initCamera();
        this.initLights();
        this.initGrid();
    
        // TransformControlsの初期化
        this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
        this.scene.add(this.transformControls);
    
        // データ構造の初期化
        this.nodes = new Map();
        this.edges = [];
    
        // 初期サイズの設定
        const textSize = document.getElementById('text-size').value;
        const nodeSize = document.getElementById('node-size').value;
        this.initialTextSize = parseInt(textSize);
        this.initialNodeSize = parseInt(nodeSize);
    
        // レイキャスターの初期化
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.isNodeClickEnabled = true;
    
        // クリックタイマーの初期化
        this.clickTimer = null;
        this.clickDelay = 300; // ダブルクリック判定の待ち時間（ミリ秒）
    
        // ノード移動の状態管理
        this.isMovingNodes = false;
    
        // イベントリスナーとコントロールの設定
        this.setupEventListeners();
        this.setupEdgeControls();
        this.setupTransformControls();
        this.setupNodeControls();
        this.setupViewModeControl();
    
        // ウィンドウリサイズへの対応
        window.addEventListener('resize', this.handleResize.bind(this));
    
        // アニメーションループの開始
        this.animate();
    
        // 初期データの読み込みとサイズ設定
        this.loadTestData().then(() => {
            this.nodes.forEach(node => {
                node.setLabelSize(this.initialTextSize);
                node.setSize(this.initialNodeSize);
            });
            
        // エッジの初期サイズを設定
        const edgeSize = document.getElementById('edge-size').value * 0.01;
        this.edges.forEach(edge => {
            edge.arrowThickness = edgeSize;
            edge.update();
        });
    }).catch(error => {
        console.error('Error loading initial data:', error);
    });
    
        // スライダーの初期値を表示に反映
        const sliders = document.querySelectorAll('input[type="range"]');
        sliders.forEach(slider => {
            const label = slider.closest('.control-item').querySelector('label');
            const span = label ? label.querySelector('span') : null;
            if (span) {
                span.textContent = `${slider.value}px`;
            }
    
            // 各スライダーの初期値を適用
            switch (slider.id) {
                case 'node-size':
                    this.nodes.forEach(node => node.setSize(slider.value));
                    break;
                case 'text-size':
                    this.nodes.forEach(node => node.setLabelSize(slider.value));
                    break;
                case 'edge-size':
                    this.edges.forEach(edge => {
                        edge.arrowThickness = slider.value * 0.01;
                        edge.update();
                    });
                    break;
                case 'edge-label-size':
                    this.edges.forEach(edge => {
                        if (edge.label) {
                            edge.update();
                        }
                    });
                    break;
            }
        });
    
        // アニメーションフレームの要求
        requestAnimationFrame(this.animate.bind(this));
    }

    setupTransformControls() {
        const toggleMoveNodeBtn = document.getElementById('toggle-move-node-btn');
        console.log("Button element:", toggleMoveNodeBtn);
        if (!toggleMoveNodeBtn) {
            console.error('toggleMoveNodeBtn not found');
            return;
        }

        toggleMoveNodeBtn.addEventListener('click', () => {
            console.log('ボタンがクリックされました');
            this.isMovingNodes = !this.isMovingNodes;
            this.isNodeClickEnabled = !this.isMovingNodes;
            if (this.isMovingNodes) {
                toggleMoveNodeBtn.textContent = 'ノード移動停止';
                this.enableNodeTransform();
            } else {
                toggleMoveNodeBtn.textContent = 'ノード移動開始';
                this.disableNodeTransform();
            }
        });

        // TransformControlsのマウスダウンイベント
        this.transformControls.addEventListener('mouseDown', (e) => {
            this.controls.enablePan = false;  // OrbitControlsを無効化
            this.controls.enableRotate = false;  // OrbitControlsを無効化
        });

        // TransformControlsのマウスアップイベント
        this.transformControls.addEventListener('mouseUp', (e) => {
            this.controls.enablePan = true;  // OrbitControlsを有効化
            this.controls.enableRotate = true;  // OrbitControlsを有効化
        });

        // ノードが移動された時のイベント
        this.transformControls.addEventListener('change', () => {
            this.renderer.render(this.scene, this.camera);
        });
    }

    // ノード移動を有効にするメソッド
    enableNodeTransform() {
        window.addEventListener('click', this.onNodeSelect.bind(this));
    }

    // ノード移動を停止するメソッド
    disableNodeTransform() {
        this.transformControls.detach();  // ノードからTransformControlsを外す
        window.removeEventListener('click', this.onNodeSelect.bind(this));  // イベントリスナーを解除
    }

    // ノードをクリックしてTransformControlsを適用
    onNodeSelect(event) {
        if (!this.isMovingNodes) return;

        this.updateMousePosition(event);
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(Array.from(this.nodes.values()).map(node => node.plane));

        if (intersects.length > 0) {
            const selectedNode = intersects[0].object.userData.nodeData;
            const node = this.nodes.get(selectedNode.id);
            if (node) {
                this.transformControls.attach(node.plane);
                this.transformControls.addEventListener('change', () => {
                    const position = node.plane.position;
                    node.setPosition(position.x, position.y, position.z);
                });
            }
        }
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

        // 視点モードの設定
        this.setupViewModeControl();

        // ノードの制御
        this.setupNodeControls();

        // クリック処理の統合
        const container = document.getElementById('graph-container');
        container.addEventListener('click', (event) => {
            if (this.clickTimer === null) {
                this.clickTimer = setTimeout(() => {
                    this.onNodeClick(event);
                    this.clickTimer = null;
                }, this.clickDelay);
            }
        });

        container.addEventListener('dblclick', (event) => {
            if (this.clickTimer !== null) {
                clearTimeout(this.clickTimer);
                this.clickTimer = null;
            }
            this.onNodeDoubleClick(event);
        });
    }

    // スライダーのイベントリスナー設定
    setupSliderListeners() {
        const sliders = document.querySelectorAll('input[type="range"]');
        sliders.forEach(slider => {
            // 値表示要素を探す
            const label = slider.closest('.control-item').querySelector('label');
            const span = label ? label.querySelector('span') : null;

            // 初期値を設定
            if (span) {
                span.textContent = `${slider.value}px`;
            }

            // 値変更時のイベントリスナー
            slider.addEventListener('input', (event) => {
                if (span) {
                    span.textContent = `${event.target.value}px`;
                }

                // スライダーの種類に応じた処理
                switch (event.target.id) {
                    case 'node-size':
                        this.nodes.forEach(node => node.setSize(event.target.value));
                        break;
                    case 'text-size':
                        this.nodes.forEach(node => node.setLabelSize(event.target.value));
                        break;
                    case 'edge-size':
                        this.edges.forEach(edge => {
                            edge.arrowThickness = event.target.value * 0.01;
                            edge.update();
                        });
                        break;
                    case 'edge-label-size':
                        this.edges.forEach(edge => edge.update());
                        break;
                }
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
    onNodeDoubleClick(event) {
        event.preventDefault(); // デフォルトのダブルクリック動作を防止

        this.updateMousePosition(event);
        this.raycaster.setFromCamera(this.mouse, this.camera);

        const intersects = this.raycaster.intersectObjects(
            Array.from(this.nodes.values()).map(node => node.plane)
        );

        if (intersects.length > 0) {
            const intersectedNode = this.nodes.get(intersects[0].object.userData.nodeData.id);
            this.moveCameraToNode(intersectedNode);
        }
    }

    // ノードクリックイベント
    onNodeClick(event) {
        if (!this.isNodeClickEnabled) return;
        this.updateMousePosition(event);
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(
            Array.from(this.nodes.values()).map(node => node.plane)
        );

        if (intersects.length > 0) {
            const nodeData = intersects[0].object.userData.nodeData;
            if (nodeData && nodeData.description) {
                // descriptionとnameを組み合わせて表示
                const message = `${nodeData.name}\n\n${nodeData.description}`;
                alert(message);
            }
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
        this.edges.forEach(edge => edge.update(this.camera));
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
            node.plane.userData = { nodeData: nodeData };// ノードのplaneにユーザーデータを追加
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