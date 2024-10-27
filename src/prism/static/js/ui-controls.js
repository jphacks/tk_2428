class UIControls {
    constructor() {
        this.initializeSliders();
        this.applyInitialValues();
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
    applyInitialValues() {
        const textSizeSlider = document.getElementById('text-size');
        const nodeSizeSlider = document.getElementById('node-size');
        const edgeSizeSlider = document.getElementById('edge-size');
        const edgeLabelSizeSlider = document.getElementById('edge-label-size');

        if (textSizeSlider) {
            const event = new Event('input');
            textSizeSlider.dispatchEvent(event);
            this.applyValueChange(textSizeSlider);
        }

        // 他のスライダーも同様に初期化
        [nodeSizeSlider, edgeSizeSlider, edgeLabelSizeSlider].forEach(slider => {
            if (slider) {
                const event = new Event('input');
                slider.dispatchEvent(event);
                this.applyValueChange(slider);
            }
        });
    }

    updateValueDisplay(slider) {
        const valueDisplay = slider.closest('.control-item')
                                 .querySelector('label span');
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