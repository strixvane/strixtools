import { describe, it, expect, beforeEach } from 'vitest';

const defaultEventSettings = {
    fontFamily: 'Arial, sans-serif',
    fontSize: 20,
    fontWeight: 800,
    fontStyle: 'normal',
    textDecoration: 'none',
    textTransform: 'none',
    kerning: 1,
    textColor: '#ffffff',
    labelColor: '#ff9900',
    shadowColor: '#000000',
    shadowX: 2,
    shadowY: 2,
    shadowBlur: 4,
    layout: 'vertical',
    spacing: 12,
    padding: '5px 10px',
    orientation: 'horizontal',
    labelPosition: 'before',
    bgColor: '#000000',
    bgOpacity: 0,
    borderRadius: 0,
    borderWidth: 0,
    borderStyle: 'solid',
    borderColor: '#ffffff',
    highlightColor: '#00FF00'
};

describe('buildEventCSS', () => {
    it('uses default container selector when none provided', () => {
        const css = window.buildEventCSS(defaultEventSettings);
        expect(css).toContain('#events-container');
    });

    it('uses provided container selector', () => {
        const css = window.buildEventCSS(defaultEventSettings, '#my-custom-box');
        expect(css).toContain('#my-custom-box');
        expect(css).not.toContain('#events-container');
    });

    it('generates horizontal layout CSS', () => {
        const settings = { ...defaultEventSettings, layout: 'horizontal' };
        const css = window.buildEventCSS(settings);
        expect(css).toContain('flex-direction: row');
        expect(css).toContain(`gap: ${settings.spacing}px`);
    });

    it('generates vertical layout CSS by default', () => {
        const css = window.buildEventCSS(defaultEventSettings);
        expect(css).toContain('display: block');
        expect(css).toContain(`margin: ${defaultEventSettings.spacing}px 0`);
    });

    it('generates stacked orientation CSS', () => {
        const settings = { ...defaultEventSettings, orientation: 'stacked' };
        const css = window.buildEventCSS(settings);
        expect(css).toContain('flex-direction: column');
    });

    it('generates default row orientation CSS', () => {
        const css = window.buildEventCSS(defaultEventSettings);
        expect(css).toContain('flex-direction: row');
        expect(css).toContain('gap: 8px');
    });

    it('generates labelPosition after CSS', () => {
        const settings = { ...defaultEventSettings, labelPosition: 'after' };
        const css = window.buildEventCSS(settings);
        expect(css).toContain('row-reverse');
    });

    it('generates labelPosition after CSS with stacked orientation', () => {
        const settings = { ...defaultEventSettings, labelPosition: 'after', orientation: 'stacked' };
        const css = window.buildEventCSS(settings);
        expect(css).toContain('column-reverse');
    });

    it('does not emit extra flex-direction when labelPosition is before', () => {
        const css = window.buildEventCSS(defaultEventSettings);
        expect(css).not.toContain('row-reverse');
        expect(css).not.toContain('column-reverse');
    });
});

describe('setEventCSSVariables', () => {
    let root;

    beforeEach(() => {
        root = document.createElement('div');
    });

    it('sets all custom properties', () => {
        window.setEventCSSVariables(root, defaultEventSettings);
        expect(root.style.getPropertyValue('--event-font-family')).toBe('Arial, sans-serif');
        expect(root.style.getPropertyValue('--event-font-size')).toBe('20px');
        expect(root.style.getPropertyValue('--event-text-color')).toBe('#ffffff');
        expect(root.style.getPropertyValue('--event-label-color')).toBe('#ff9900');
        expect(root.style.getPropertyValue('--event-highlight-color')).toBe('#00FF00');
    });

    it('handles textTransform truthy value', () => {
        const settings = { ...defaultEventSettings, textTransform: 'uppercase' };
        window.setEventCSSVariables(root, settings);
        expect(root.style.getPropertyValue('--event-text-transform')).toBe('uppercase');
    });

    it('handles textTransform falsy value (fallback to none)', () => {
        const settings = { ...defaultEventSettings, textTransform: '' };
        window.setEventCSSVariables(root, settings);
        expect(root.style.getPropertyValue('--event-text-transform')).toBe('none');
    });

    it('handles numeric padding', () => {
        const settings = { ...defaultEventSettings, padding: 10 };
        window.setEventCSSVariables(root, settings);
        expect(root.style.getPropertyValue('--event-padding')).toBe('10px');
    });

    it('handles string padding', () => {
        const settings = { ...defaultEventSettings, padding: '8px 16px' };
        window.setEventCSSVariables(root, settings);
        expect(root.style.getPropertyValue('--event-padding')).toBe('8px 16px');
    });

    it('handles undefined padding (fallback)', () => {
        const settings = { ...defaultEventSettings, padding: undefined };
        window.setEventCSSVariables(root, settings);
        expect(root.style.getPropertyValue('--event-padding')).toBe('5px 10px');
    });

    it('sets border when borderWidth > 0', () => {
        const settings = {
            ...defaultEventSettings,
            borderWidth: 2,
            borderStyle: 'dotted',
            borderColor: '#ff0000'
        };
        window.setEventCSSVariables(root, settings);
        expect(root.style.getPropertyValue('--event-border')).toBe('2px dotted #ff0000');
    });

    it('sets border to none when borderWidth is 0', () => {
        window.setEventCSSVariables(root, defaultEventSettings);
        expect(root.style.getPropertyValue('--event-border')).toBe('none');
    });
});

describe('injectStyles', () => {
    beforeEach(() => {
        document.head.querySelector('#test-dynamic-styles')?.remove();
    });

    it('creates a style element with given id and CSS', () => {
        window.injectStyles('test-dynamic-styles', '.foo { color: red; }');
        const el = document.getElementById('test-dynamic-styles');
        expect(el).not.toBeNull();
        expect(el.tagName).toBe('STYLE');
        expect(el.textContent).toBe('.foo { color: red; }');
    });

    it('replaces existing style element with same id', () => {
        window.injectStyles('test-dynamic-styles', '.foo { color: red; }');
        window.injectStyles('test-dynamic-styles', '.foo { color: blue; }');
        const els = document.head.querySelectorAll('#test-dynamic-styles');
        expect(els.length).toBe(1);
        expect(els[0].textContent).toBe('.foo { color: blue; }');
    });
});
