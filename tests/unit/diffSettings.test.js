import { describe, it, expect } from 'vitest';

const { getDiffSettings } = window;

describe('getDiffSettings', () => {
    it('returns empty object when current equals defaults', () => {
        const defaults = { a: 1, b: 'hello', c: true };
        const current = { a: 1, b: 'hello', c: true };
        expect(getDiffSettings(current, defaults)).toEqual({});
    });

    it('returns diff for changed primitive values', () => {
        const defaults = { a: 1, b: 'hello', c: true };
        const current = { a: 2, b: 'world', c: false };
        expect(getDiffSettings(current, defaults)).toEqual({ a: 2, b: 'world', c: false });
    });

    it('returns nested diff for changed nested objects', () => {
        const defaults = { chat: { fontSize: 16, color: '#fff' }, events: { fontSize: 20 } };
        const current = { chat: { fontSize: 18, color: '#fff' }, events: { fontSize: 20 } };
        expect(getDiffSettings(current, defaults)).toEqual({ chat: { fontSize: 18 } });
    });

    it('returns empty nested diff when nested objects match', () => {
        const defaults = { chat: { fontSize: 16, color: '#fff' } };
        const current = { chat: { fontSize: 16, color: '#fff' } };
        expect(getDiffSettings(current, defaults)).toEqual({});
    });

    it('handles current having extra keys not in defaults', () => {
        const defaults = { a: 1 };
        const current = { a: 1, b: 2 };
        expect(getDiffSettings(current, defaults)).toEqual({ b: 2 });
    });

    it('returns full nested object when defaults key is missing', () => {
        const defaults = {};
        const current = { chat: { fontSize: 16 } };
        expect(getDiffSettings(current, defaults)).toEqual({ chat: { fontSize: 16 } });
    });

    it('handles null values', () => {
        const defaults = { a: null };
        const current = { a: null };
        expect(getDiffSettings(current, defaults)).toEqual({});
    });

    it('handles boolean changes', () => {
        const defaults = { showBadges: true };
        const current = { showBadges: false };
        expect(getDiffSettings(current, defaults)).toEqual({ showBadges: false });
    });

    it('handles number zero vs undefined', () => {
        const defaults = { borderWidth: 0 };
        const current = { borderWidth: 2 };
        expect(getDiffSettings(current, defaults)).toEqual({ borderWidth: 2 });
    });

    it('diff with FULL realistic settings object', () => {
        const defaults = {
            general: { twitchChannel: '', clientId: '', accessToken: '' },
            chat: { showBadges: true, maxMessages: 15, theme: 'default' },
            events: { fontSize: 20, layout: 'vertical' }
        };
        const current = {
            general: { twitchChannel: 'mychannel', clientId: '', accessToken: '' },
            chat: { showBadges: true, maxMessages: 30, theme: 'windows95' },
            events: { fontSize: 24, layout: 'vertical' }
        };
        expect(getDiffSettings(current, defaults)).toEqual({
            general: { twitchChannel: 'mychannel' },
            chat: { maxMessages: 30, theme: 'windows95' },
            events: { fontSize: 24 }
        });
    });
});
