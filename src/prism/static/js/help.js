class HelpModal {
    constructor() {
        this.modal = document.getElementById('help-modal');
        this.helpButton = document.querySelector('.help-button');
        this.closeButton = document.querySelector('.close-button');
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // ヘルプボタンのクリックイベント
        this.helpButton.addEventListener('click', () => {
            this.showModal();
        });

        // 閉じるボタンのクリックイベント
        this.closeButton.addEventListener('click', () => {
            this.hideModal();
        });

        // モーダル外クリックで閉じる
        window.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.hideModal();
            }
        });

        // ESCキーで閉じる
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.modal.style.display === 'block') {
                this.hideModal();
            }
        });
    }

    showModal() {
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // スクロール防止
    }

    hideModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // スクロール復帰
    }
}

// DOMロード時に初期化
document.addEventListener('DOMContentLoaded', () => {
    new HelpModal();
});