import { vi, beforeEach } from 'vitest';

await import('../js/config.js');
await import('../js/status.js');
await import('../js/styles.js');
await import('../js/modules/twitch.js');
await import('../js/modules/chat.js');
await import('../js/modules/events.js');
await import('../js/settings.js');

class MockBroadcastChannel {
    constructor(name) {
        this.name = name;
        this.onmessage = null;
    }
    postMessage(data) {
        if (this.onmessage) {
            this.onmessage({ data });
        }
    }
    close() { }
}

globalThis.BroadcastChannel = MockBroadcastChannel;

const original = {
    localStorage: globalThis.localStorage,
    fetch: globalThis.fetch,
    WebSocket: globalThis.WebSocket,
    alert: globalThis.alert
};

beforeEach(() => {
    if (original.localStorage) {
        original.localStorage.clear();
    }

    globalThis.fetch = vi.fn().mockRejectedValue(new Error('fetch not mocked in this test'));

    globalThis.WebSocket = vi.fn().mockImplementation(() => {
        const ws = {
            onopen: null,
            onclose: null,
            onmessage: null,
            onerror: null,
            close: vi.fn(),
            send: vi.fn()
        };
        setTimeout(() => {
            if (ws.onopen) ws.onopen();
        }, 0);
        return ws;
    });

    globalThis.alert = vi.fn();

    globalThis.navigator.clipboard = {
        writeText: vi.fn().mockResolvedValue()
    };

    globalThis.tmi = {
        Client: vi.fn().mockImplementation(() => ({
            connect: vi.fn().mockResolvedValue(),
            on: vi.fn(),
            say: vi.fn()
        }))
    };

    globalThis.parseEmotes = vi.fn().mockResolvedValue({
        toHTML: () => 'parsed-emote-html'
    });

    document.body.innerHTML = '';
});
