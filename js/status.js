class StatusManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.timer = null;
    }

    show(message, level = 'info', duration) {
        if (!this.container) return;
        this._clearTimer();
        this.container.textContent = message;
        this.container.className = `status-${level}`;
        this.container.style.display = '';
        if (duration && duration > 0) {
            this.timer = setTimeout(() => this.hide(), duration);
        }
    }

    hide() {
        if (!this.container) return;
        this._clearTimer();
        this.container.style.display = 'none';
    }

    _clearTimer() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }
}

window.StatusManager = StatusManager;
window.statusManager = new StatusManager('status-bar');
