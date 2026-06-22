import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const { hexToRgba, scheduleFadeOut } = window;

describe('hexToRgba (canonical)', () => {
    it('converts valid hex with 65% opacity', () => {
        expect(hexToRgba('#ff9900', 65)).toBe('rgba(255, 153, 0, 0.65)');
    });

    it('converts valid hex with 0% opacity', () => {
        expect(hexToRgba('#000000', 0)).toBe('rgba(0, 0, 0, 0)');
    });

    it('converts valid hex with 100% opacity', () => {
        expect(hexToRgba('#ffffff', 100)).toBe('rgba(255, 255, 255, 1)');
    });

    it('returns transparent for null', () => {
        expect(hexToRgba(null, 50)).toBe('transparent');
    });

    it('returns transparent for undefined', () => {
        expect(hexToRgba(undefined, 50)).toBe('transparent');
    });

    it('returns transparent for "transparent" string (regression: was producing NaN in chat.js)', () => {
        expect(hexToRgba('transparent', 50)).toBe('transparent');
    });

    it('returns fallback for short hex (< 7 chars)', () => {
        expect(hexToRgba('#fff', 50)).toBe('rgba(0,0,0,1)');
    });

    it('converts edge color #000000 with 50% opacity', () => {
        expect(hexToRgba('#000000', 50)).toBe('rgba(0, 0, 0, 0.5)');
    });

    it('converts #ff0000 with 75% opacity', () => {
        expect(hexToRgba('#ff0000', 75)).toBe('rgba(255, 0, 0, 0.75)');
    });

    it('registers the same function on window.hexToRgba', () => {
        expect(window.hexToRgba).toBe(hexToRgba);
    });

    it('window.hexToRgba produces correct output', () => {
        expect(window.hexToRgba('#ff9900', 65)).toBe('rgba(255, 153, 0, 0.65)');
        expect(window.hexToRgba(null, 50)).toBe('transparent');
        expect(window.hexToRgba('transparent', 50)).toBe('transparent');
    });
});

describe('scheduleFadeOut', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('sets opacity to 0 after lifetimeMs', () => {
        const el = document.createElement('div');
        scheduleFadeOut(el, 5000);
        expect(el.style.opacity).toBe('');
        vi.advanceTimersByTime(4999);
        expect(el.style.opacity).toBe('');
        vi.advanceTimersByTime(1);
        expect(el.style.opacity).toBe('0');
        expect(el.style.transition).toBe('opacity 0.5s');
    });

    it('removes element after additional 500ms', () => {
        const el = document.createElement('div');
        document.body.appendChild(el);
        scheduleFadeOut(el, 1000);
        vi.advanceTimersByTime(1000);
        expect(el.style.opacity).toBe('0');
        expect(document.body.contains(el)).toBe(true);
        vi.advanceTimersByTime(500);
        expect(document.body.contains(el)).toBe(false);
    });

    it('does nothing when lifetimeMs is <= 0', () => {
        const el = document.createElement('div');
        scheduleFadeOut(el, 0);
        vi.advanceTimersByTime(1000);
        expect(el.style.opacity).toBe('');
    });

    it('registers the same function on window.scheduleFadeOut', () => {
        expect(window.scheduleFadeOut).toBe(scheduleFadeOut);
    });
});
