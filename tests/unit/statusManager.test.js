import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { StatusManager } = window;

describe('StatusManager', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="test-status-bar"></div>';
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('shows a message with the given level', () => {
        const mgr = new StatusManager('test-status-bar');
        mgr.show('Loading...', 'loading');
        const el = document.getElementById('test-status-bar');
        expect(el.textContent).toBe('Loading...');
        expect(el.className).toBe('status-loading');
        expect(el.style.display).not.toBe('none');
    });

    it('hides the element on hide()', () => {
        const mgr = new StatusManager('test-status-bar');
        mgr.show('Hello');
        mgr.hide();
        const el = document.getElementById('test-status-bar');
        expect(el.style.display).toBe('none');
    });

    it('auto-hides after the given duration', async () => {
        vi.useFakeTimers();
        const mgr = new StatusManager('test-status-bar');
        mgr.show('Brief', 'success', 500);
        const el = document.getElementById('test-status-bar');
        expect(el.textContent).toBe('Brief');
        vi.advanceTimersByTime(500);
        expect(el.style.display).toBe('none');
        vi.useRealTimers();
    });

    it('does not auto-hide when duration is 0', async () => {
        vi.useFakeTimers();
        const mgr = new StatusManager('test-status-bar');
        mgr.show('Sticky', 'error', 0);
        const el = document.getElementById('test-status-bar');
        vi.advanceTimersByTime(10000);
        expect(el.textContent).toBe('Sticky');
        expect(el.style.display).not.toBe('none');
        vi.useRealTimers();
    });

    it('clears previous timer when show is called again', () => {
        vi.useFakeTimers();
        const mgr = new StatusManager('test-status-bar');
        mgr.show('First', 'warning', 500);
        mgr.show('Second', 'info');
        const el = document.getElementById('test-status-bar');
        expect(el.textContent).toBe('Second');
        vi.advanceTimersByTime(500);
        expect(el.style.display).not.toBe('none');
        vi.useRealTimers();
    });

    it('is a no-op when container element does not exist', () => {
        const mgr = new StatusManager('nonexistent');
        expect(() => mgr.show('test')).not.toThrow();
        expect(() => mgr.hide()).not.toThrow();
    });
});
