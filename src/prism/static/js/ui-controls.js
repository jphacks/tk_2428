class UIControls {
    constructor() {
        this.initializeSliders();
    }

    initializeSliders() {
        // すべてのスライダーコントロールを取得
        const sliders = document.querySelectorAll('.control-item input[type="range"]');
        
        sliders.forEach(slider => {
            // 初期値を表示
            this.updateValueDisplay(slider);
            
            // スライダーの値が変更されたときのイベントリスナー
            slider.addEventListener('input', (e) => {
                this.updateValueDisplay(e.target);
                this.applyValueChange(e.target);
            });
        });
    }

    updateValueDisplay(slider) {
        // 値表示要素を取得
        const valueDisplay = slider.closest('.control-item')
                                 .querySelector('.control-value');
        if (valueDisplay) {
            valueDisplay.textContent = `${slider.value}px`;
        }
    }

    applyValueChange(slider) {
        const value = slider.value;
        
        switch (slider.id) {
            case 'text-size':
                // ノードのテキストサイズを更新
                document.documentElement.style.setProperty('--node-text-size', `${value}px`);
                break;
                
            case 'node-size':
                // ノードのサイズを更新
                document.documentElement.style.setProperty('--node-size', `${value}px`);
                break;
                
            case 'edge-label-size':
                // エッジラベルのサイズを更新
                document.documentElement.style.setProperty('--edge-label-size', `${value}px`);
                break;
                
            case 'edge-size':
                // エッジの太さを更新
                document.documentElement.style.setProperty('--edge-size', `${value}px`);
                break;
        }
    }
}

// DOMロード時にUIControlsを初期化
document.addEventListener('DOMContentLoaded', () => {
    window.uiControls = new UIControls();
});

export default UIControls;