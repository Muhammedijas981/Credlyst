class Toast {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'glass-toast-container';
            this.container.style.cssText = `
                position: fixed;
                top: 24px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 99999;
                display: flex;
                flex-direction: column;
                gap: 12px;
                pointer-events: none;
                width: max-content;
                max-width: calc(100vw - 32px);
            `;
            document.body.appendChild(this.container);
            
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideDownFade {
                    0% { transform: translateY(-20px) scale(0.95); opacity: 0; }
                    100% { transform: translateY(0) scale(1); opacity: 1; }
                }
                @keyframes fadeOutUp {
                    0% { transform: translateY(0) scale(1); opacity: 1; }
                    100% { transform: translateY(-20px) scale(0.95); opacity: 0; }
                }
                .glass-toast {
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.4);
                    box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.15);
                    color: #1f2937;
                    padding: 12px 16px;
                    border-radius: 16px;
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    font-size: 14.5px;
                    font-weight: 500;
                    line-height: 1.5;
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                    animation: slideDownFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    pointer-events: auto;
                    transition: all 0.3s ease;
                    word-break: break-word;
                }
                [data-theme="dark"] .glass-toast {
                    background: rgba(30, 30, 30, 0.85);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #f3f4f6;
                    box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
                }
                .glass-toast-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }
                .toast-success .glass-toast-icon { background: rgba(16, 185, 129, 0.15); color: #10b981; }
                .toast-error .glass-toast-icon { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
                .toast-info .glass-toast-icon { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
                .toast-warning .glass-toast-icon { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
            `;
            document.head.appendChild(style);
        }
    }

    show(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `glass-toast toast-${type}`;
        
        toast.innerHTML = `
            <div class="glass-toast-icon">${this.getIcon(type)}</div>
            <div>${message}</div>
        `;

        this.container.prepend(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOutUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    getIcon(type) {
        const icons = {
            success: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
            error: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
            info: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
            warning: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'
        };
        return icons[type] || icons.info;
    }

    success(message) { this.show(message, 'success'); }
    error(message) { this.show(message, 'error'); }
    info(message) { this.show(message, 'info'); }
    warning(message) { this.show(message, 'warning'); }
}

export default new Toast();
