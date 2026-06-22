import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MockTwitchClient as TwitchClient } from '../helpers/mockTwitchClient.js';

const { EventsModule } = window;

describe('EventsModule', () => {
    let eventsModule;
    let twitchClient;

    const defaultConfig = {
        fontFamily: "system-ui, -apple-system, 'Montserrat', 'Inter', sans-serif",
        fontSize: 20,
        fontWeight: 800,
        fontStyle: 'normal',
        textDecoration: 'none',
        textTransform: 'uppercase',
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
        highlightColor: '#00FF00',
        highlightDurationMs: 2000
    };

    beforeEach(() => {
        vi.useFakeTimers();
        twitchClient = new TwitchClient({
            clientId: 'test-client-id',
            accessToken: 'test-token',
            twitchChannel: 'testchannel'
        });

        eventsModule = new EventsModule({ ...defaultConfig }, twitchClient);

        // Set up DOM for events
        document.body.innerHTML = `
            <div id="events-container">
                <div class="event-container" id="latest-follow">
                    <span class="label">Latest Follower:</span>
                    <span class="value">-</span>
                </div>
                <div class="event-container" id="latest-subscribe">
                    <span class="label">Latest Sub:</span>
                    <span class="value">-</span>
                </div>
                <div class="event-container" id="latest-cheer">
                    <span class="label">Latest Cheer:</span>
                    <span class="value">-</span>
                </div>
            </div>
        `;
    });

    afterEach(() => {
        vi.useRealTimers();
        document.body.innerHTML = '';
        document.head.querySelector('#events-dynamic-styles')?.remove();
    });

    describe('constructor', () => {
        it('stores config and twitchClient', () => {
            expect(eventsModule.config).toEqual(expect.objectContaining({ fontFamily: expect.any(String) }));
            expect(eventsModule.twitchClient).toBe(twitchClient);
            expect(eventsModule.userId).toBeNull();
            expect(eventsModule.ws).toBeNull();
            expect(eventsModule.reconnectAttempts).toBe(0);
            expect(eventsModule.highlights.size).toBe(0);
        });

        it('registers beforeunload handler that calls unsubscribeAll', () => {
            const spy = vi.spyOn(eventsModule, 'unsubscribeAll').mockImplementation(() => {});
            window.dispatchEvent(new Event('beforeunload'));
            expect(spy).toHaveBeenCalled();
            spy.mockRestore();
        });
    });

    describe('applyStyles', () => {
        it('sets CSS custom properties on root element', () => {
            eventsModule.applyStyles();
            const root = document.documentElement;
            expect(root.style.getPropertyValue('--event-font-family')).toBe(defaultConfig.fontFamily);
            expect(root.style.getPropertyValue('--event-font-size')).toBe('20px');
            expect(root.style.getPropertyValue('--event-text-color')).toBe('#ffffff');
            expect(root.style.getPropertyValue('--event-highlight-color')).toBe('#00FF00');
        });

        it('creates style element with id events-dynamic-styles', () => {
            eventsModule.applyStyles();
            const style = document.getElementById('events-dynamic-styles');
            expect(style).not.toBeNull();
            expect(style.tagName).toBe('STYLE');
        });

        it('replaces existing style element on re-apply', () => {
            eventsModule.applyStyles();
            eventsModule.applyStyles();
            const styles = document.querySelectorAll('#events-dynamic-styles');
            expect(styles.length).toBe(1);
        });

        it('generates vertical layout CSS by default', () => {
            eventsModule.applyStyles();
            const style = document.getElementById('events-dynamic-styles');
            expect(style.innerHTML).toContain('#events-container { display: block; }');
        });

        it('generates horizontal layout CSS when configured', () => {
            eventsModule.config.layout = 'horizontal';
            eventsModule.applyStyles();
            const style = document.getElementById('events-dynamic-styles');
            expect(style.innerHTML).toContain('flex-direction: row');
        });

        it('sets --event-bg-color to rgba(0,0,0,0) for #000000 at 0% opacity', () => {
            eventsModule.applyStyles();
            const root = document.documentElement;
            expect(root.style.getPropertyValue('--event-bg-color')).toBe('rgba(0, 0, 0, 0)');
        });

        it('sets --event-border to none when borderWidth is 0', () => {
            eventsModule.applyStyles();
            const root = document.documentElement;
            expect(root.style.getPropertyValue('--event-border')).toBe('none');
        });

        it('sets --event-border when borderWidth > 0', () => {
            eventsModule.config.borderWidth = 3;
            eventsModule.config.borderStyle = 'dotted';
            eventsModule.config.borderColor = '#ff0000';
            eventsModule.applyStyles();
            const root = document.documentElement;
            expect(root.style.getPropertyValue('--event-border')).toBe('3px dotted #ff0000');
        });
    });

    describe('connect', () => {
        it('creates a new WebSocket connection', () => {
            eventsModule.connect();
            expect(eventsModule.ws).not.toBeNull();
            expect(globalThis.WebSocket).toHaveBeenCalledWith('wss://eventsub.wss.twitch.tv/ws');
        });

        it('resets reconnectAttempts on open', () => {
            eventsModule.reconnectAttempts = 5;
            eventsModule.connect();
            expect(eventsModule.ws.onopen).toBeDefined();
            eventsModule.ws.onopen();
            expect(eventsModule.reconnectAttempts).toBe(0);
        });

        it('calls handleReconnect on close', () => {
            eventsModule.connect();
            const spy = vi.spyOn(eventsModule, 'handleReconnect');
            eventsModule.ws.onclose();
            expect(spy).toHaveBeenCalled();
        });

        it('calls ws.close on error', () => {
            eventsModule.connect();
            eventsModule.ws.onerror(new Event('error'));
            expect(eventsModule.ws.close).toHaveBeenCalled();
        });

        it('does not create duplicate WebSocket if already connected', () => {
            eventsModule.connect();
            const firstWs = eventsModule.ws;
            Object.defineProperty(firstWs, 'readyState', { value: WebSocket.OPEN });

            eventsModule.connect();
            expect(eventsModule.ws).toBe(firstWs);
        });

        it('handles malformed JSON in onmessage gracefully', () => {
            eventsModule.connect();
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            eventsModule.ws.onmessage({ data: 'not-json' });
            expect(consoleSpy).toHaveBeenCalledWith('Failed to parse WebSocket message:', expect.any(SyntaxError));
            consoleSpy.mockRestore();
        });

        it('handles session_reconnect message by calling connect with reconnect URL', () => {
            eventsModule.connect();
            const connectSpy = vi.spyOn(eventsModule, 'connect');
            const oldWs = eventsModule.ws;

            eventsModule.ws.onmessage({ data: JSON.stringify({
                metadata: { message_type: 'session_reconnect' },
                payload: { session: { reconnect_url: 'wss://reconnect.example/ws' } }
            })});

            expect(oldWs.close).toHaveBeenCalled();
            expect(connectSpy).toHaveBeenCalledWith('wss://reconnect.example/ws');
            connectSpy.mockRestore();
        });

        it('handles session_keepalive message without error', () => {
            eventsModule.connect();

            expect(() => {
                eventsModule.ws.onmessage({ data: JSON.stringify({
                    metadata: { message_type: 'session_keepalive' },
                    payload: {}
                })});
            }).not.toThrow();
        });

        it('handles session_welcome by subscribing to events', async () => {
            eventsModule.userId = 'broadcaster-123';
            eventsModule.connect();
            const subscribeSpy = vi.spyOn(eventsModule, 'subscribeToEvents');
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ data: [{ id: 'sub-456' }] })
            });

            await eventsModule.ws.onmessage({ data: JSON.stringify({
                metadata: { message_type: 'session_welcome' },
                payload: { session: { id: 'session-abc' } }
            })});

            expect(subscribeSpy).toHaveBeenCalledWith('session-abc');
            subscribeSpy.mockRestore();
        });

        it('routes notification messages through onmessage to handleNotification', async () => {
            eventsModule.connect();
            const handleSpy = vi.spyOn(eventsModule, 'handleNotification');

            await eventsModule.ws.onmessage({ data: JSON.stringify({
                metadata: { message_type: 'notification' },
                payload: {
                    subscription: { type: 'channel.follow' },
                    event: { user_name: 'RouteTest', user_id: '999' }
                }
            })});

            expect(handleSpy).toHaveBeenCalledWith({
                subscription: { type: 'channel.follow' },
                event: { user_name: 'RouteTest', user_id: '999' }
            });
            handleSpy.mockRestore();
        });
    });

    describe('handleReconnect', () => {
        it('reconnects after exponential backoff delay', () => {
            eventsModule.reconnectAttempts = 0;
            const connectSpy = vi.spyOn(eventsModule, 'connect');

            eventsModule.handleReconnect();
            expect(connectSpy).not.toHaveBeenCalled();

            vi.advanceTimersByTime(1000);
            expect(connectSpy).toHaveBeenCalled();
            expect(eventsModule.reconnectAttempts).toBe(1);
        });

        it('caps delay at maxReconnectDelay (30s)', () => {
            eventsModule.reconnectAttempts = 9;
            const connectSpy = vi.spyOn(eventsModule, 'connect');

            eventsModule.handleReconnect();
            vi.advanceTimersByTime(30000);
            expect(connectSpy).toHaveBeenCalled();
        });

        it('increments reconnectAttempts after each attempt', () => {
            eventsModule.reconnectAttempts = 2;
            eventsModule.handleReconnect();
            vi.advanceTimersByTime(4000);
            expect(eventsModule.reconnectAttempts).toBe(3);
        });

        it('stops reconnecting after maxReconnectAttempts', () => {
            eventsModule.reconnectAttempts = 10;
            const connectSpy = vi.spyOn(eventsModule, 'connect');

            eventsModule.handleReconnect();
            vi.advanceTimersByTime(60000);
            expect(connectSpy).not.toHaveBeenCalled();
            expect(eventsModule.reconnectAttempts).toBe(10);
        });
    });

    describe('unsubscribeAll', () => {
        it('sends DELETE requests for each tracked subscription', async () => {
            eventsModule.subscriptionIds = ['id-1', 'id-2'];
            globalThis.fetch = vi.fn().mockResolvedValue({ ok: true });

            await eventsModule.unsubscribeAll();

            expect(globalThis.fetch).toHaveBeenCalledTimes(2);
            expect(globalThis.fetch).toHaveBeenCalledWith(
                expect.stringContaining('id-1'),
                expect.objectContaining({ method: 'DELETE' })
            );
            expect(globalThis.fetch).toHaveBeenCalledWith(
                expect.stringContaining('id-2'),
                expect.objectContaining({ method: 'DELETE' })
            );
        });

        it('clears subscriptionIds after deletion', async () => {
            eventsModule.subscriptionIds = ['id-1', 'id-2'];
            globalThis.fetch = vi.fn().mockResolvedValue({ ok: true });

            await eventsModule.unsubscribeAll();

            expect(eventsModule.subscriptionIds).toEqual([]);
        });

        it('does nothing when subscriptionIds is empty', async () => {
            globalThis.fetch = vi.fn();
            await eventsModule.unsubscribeAll();
            expect(globalThis.fetch).not.toHaveBeenCalled();
        });

        it('handles delete failure gracefully', async () => {
            eventsModule.subscriptionIds = ['bad-id'];
            globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

            await expect(eventsModule.unsubscribeAll()).resolves.toBeUndefined();
            expect(eventsModule.subscriptionIds).toEqual([]);
        });
    });

    describe('subscribeToEvents', () => {
        beforeEach(() => {
            eventsModule.subscriptionIds = [];
        });

        it('sends POST requests for all 3 event types', async () => {
            eventsModule.userId = 'broadcaster-123';
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ data: [{ id: 'sub-123' }] })
            });

            await eventsModule.subscribeToEvents('session-abc');
            expect(globalThis.fetch).toHaveBeenCalledTimes(3);

            const calls = globalThis.fetch.mock.calls;
            expect(calls[0][0]).toBe('https://api.twitch.tv/helix/eventsub/subscriptions');
            expect(calls[0][1].method).toBe('POST');
            expect(JSON.parse(calls[0][1].body).type).toBe('channel.follow');
            expect(JSON.parse(calls[1][1].body).type).toBe('channel.subscribe');
            expect(JSON.parse(calls[2][1].body).type).toBe('channel.cheer');
        });

        it('captures subscription IDs from successful responses', async () => {
            eventsModule.userId = 'broadcaster-123';
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ data: [{ id: 'sub-123' }] })
            });

            await eventsModule.subscribeToEvents('session-abc');
            expect(eventsModule.subscriptionIds).toEqual(['sub-123', 'sub-123', 'sub-123']);
        });

        it('handles subscription failure gracefully', async () => {
            eventsModule.userId = 'broadcaster-123';
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: false,
                json: () => Promise.resolve({ message: 'error' })
            });

            await eventsModule.subscribeToEvents('session-abc');
            expect(globalThis.fetch).toHaveBeenCalledTimes(3);
            expect(eventsModule.subscriptionIds).toEqual([]);
        });

        it('cleans up old subscriptions before subscribing', async () => {
            eventsModule.userId = 'broadcaster-123';
            eventsModule.subscriptionIds = ['old-id-1', 'old-id-2'];

            let callCount = 0;
            globalThis.fetch = vi.fn().mockImplementation(() => {
                callCount++;
                if (callCount <= 2) {
                    // First 2 calls are DELETE from unsubscribeAll
                    return Promise.resolve({ ok: true });
                }
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ data: [{ id: 'new-id' }] })
                });
            });

            await eventsModule.subscribeToEvents('session-new');

            expect(globalThis.fetch).toHaveBeenCalledTimes(5);

            const calls = globalThis.fetch.mock.calls;
            expect(calls[0][0]).toContain('old-id-1');
            expect(calls[0][1].method).toBe('DELETE');
            expect(calls[1][0]).toContain('old-id-2');
            expect(calls[1][1].method).toBe('DELETE');

            expect(calls[2][1].method).toBe('POST');
            expect(calls[3][1].method).toBe('POST');
            expect(calls[4][1].method).toBe('POST');

            expect(eventsModule.subscriptionIds).toEqual(['new-id', 'new-id', 'new-id']);
        });
    });

    describe('handleNotification', () => {
        it('handles channel.follow notification', () => {
            const spy = vi.spyOn(eventsModule, 'updateDOM');
            const payload = {
                subscription: { type: 'channel.follow' },
                event: { user_name: 'NewFollower', user_id: '999' }
            };
            eventsModule.handleNotification(payload);
            expect(spy).toHaveBeenCalledWith('latest-follow', 'NewFollower', true);
        });

        it('handles channel.subscribe notification', () => {
            const spy = vi.spyOn(eventsModule, 'updateDOM');
            const payload = {
                subscription: { type: 'channel.subscribe' },
                event: { user_name: 'NewSub', user_id: '888' }
            };
            eventsModule.handleNotification(payload);
            expect(spy).toHaveBeenCalledWith('latest-subscribe', 'NewSub', true);
        });

        it('handles channel.cheer notification with bits', () => {
            const spy = vi.spyOn(eventsModule, 'updateDOM');
            const payload = {
                subscription: { type: 'channel.cheer' },
                event: { user_name: 'BigSpender', bits: '1000' }
            };
            eventsModule.handleNotification(payload);
            expect(spy).toHaveBeenCalledWith('latest-cheer', 'BigSpender (1000 bits)', true);
        });
    });

    describe('updateDOM', () => {
        it('updates the value element text', () => {
            eventsModule.updateDOM('latest-follow', 'TestFollower', false);
            const valEl = document.querySelector('#latest-follow .value');
            expect(valEl.innerText).toBe('TestFollower');
        });

        it('adds highlight-active class when highlight is true', () => {
            eventsModule.updateDOM('latest-subscribe', 'TestSub', true);
            const container = document.getElementById('latest-subscribe');
            expect(container.classList.contains('highlight-active')).toBe(true);
        });

        it('removes highlight-active class after highlightDurationMs', () => {
            eventsModule.updateDOM('latest-cheer', 'TestCheer', true);
            const container = document.getElementById('latest-cheer');
            expect(container.classList.contains('highlight-active')).toBe(true);

            vi.advanceTimersByTime(2000);
            expect(container.classList.contains('highlight-active')).toBe(false);
        });

        it('does not add highlight class when highlight is false', () => {
            eventsModule.updateDOM('latest-follow', 'NoHighlight', false);
            const container = document.getElementById('latest-follow');
            expect(container.classList.contains('highlight-active')).toBe(false);
        });

        it('does nothing if element does not exist', () => {
            const result = eventsModule.updateDOM('nonexistent', 'test', true);
            expect(result).toBeUndefined();
        });

        it('clears previous highlight timeout on new highlight', () => {
            eventsModule.updateDOM('latest-follow', 'First', true);
            const container = document.getElementById('latest-follow');
            eventsModule.updateDOM('latest-follow', 'Second', true);

            vi.advanceTimersByTime(2000);
            expect(container.classList.contains('highlight-active')).toBe(false);
        });
    });

    describe('fetchInitialData', () => {
        it('fetches followers and updates DOM', async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    data: [{ user_name: 'FirstFollower', user_id: '111' }]
                })
            });

            const spy = vi.spyOn(eventsModule, 'updateDOM');
            eventsModule.userId = 'broadcaster-123';
            await eventsModule.fetchInitialData();

            expect(globalThis.fetch).toHaveBeenCalledWith(
                expect.stringContaining('channels/followers'),
                expect.any(Object)
            );
            expect(spy).toHaveBeenCalledWith('latest-follow', 'FirstFollower', false);
        });

        it('fetches subscriptions and updates DOM', async () => {
            let callCount = 0;
            globalThis.fetch = vi.fn().mockImplementation(() => {
                callCount++;
                if (callCount === 1) {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ data: [{ user_name: 'FirstFollower' }] })
                    });
                }
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        data: [{ user_id: '999', user_name: 'LatestSub' }]
                    })
                });
            });

            const spy = vi.spyOn(eventsModule, 'updateDOM');
            eventsModule.userId = 'broadcaster-123';
            await eventsModule.fetchInitialData();

            expect(spy).toHaveBeenCalledWith('latest-follow', 'FirstFollower', false);
            expect(spy).toHaveBeenCalledWith('latest-subscribe', 'LatestSub', false);
        });

        it('handles follower API failure gracefully', async () => {
            let callCount = 0;
            globalThis.fetch = vi.fn().mockImplementation(() => {
                callCount++;
                if (callCount === 1) {
                    return Promise.resolve({
                        ok: false,
                        json: () => Promise.resolve({ message: 'Forbidden' })
                    });
                }
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ data: [{ user_name: 'LatestSub', user_id: '999' }] })
                });
            });

            const spy = vi.spyOn(eventsModule, 'updateDOM');
            eventsModule.userId = 'broadcaster-123';
            await eventsModule.fetchInitialData();

            expect(spy).toHaveBeenCalledWith('latest-subscribe', 'LatestSub', false);
            expect(spy).not.toHaveBeenCalledWith('latest-follow', expect.any(String), false);
        });

        it('skips sub update when data is empty', async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ data: [] })
            });

            const spy = vi.spyOn(eventsModule, 'updateDOM');
            eventsModule.userId = 'broadcaster-123';
            await eventsModule.fetchInitialData();

            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('init', () => {
        it('calls applyStyles, validateAuth, fetchInitialData, and connect', async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ data: [] })
            });

            const applySpy = vi.spyOn(eventsModule, 'applyStyles');
            const fetchSpy = vi.spyOn(eventsModule, 'fetchInitialData');
            const connectSpy = vi.spyOn(eventsModule, 'connect');

            await eventsModule.init();

            expect(applySpy).toHaveBeenCalled();
            expect(eventsModule.userId).toBe('broadcaster-123');
            expect(fetchSpy).toHaveBeenCalled();
            expect(connectSpy).toHaveBeenCalled();
        });

        it('handles auth failure gracefully', async () => {
            twitchClient.validateAuth = vi.fn().mockRejectedValue(new Error('Auth failed'));

            const connectSpy = vi.spyOn(eventsModule, 'connect');
            await eventsModule.init();

            expect(connectSpy).not.toHaveBeenCalled();
        });
    });
});
