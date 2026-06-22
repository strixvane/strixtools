import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MockTwitchClient as TwitchClient } from '../helpers/mockTwitchClient.js';

const { ChatModule } = window;

describe('ChatModule', () => {
    let chatModule;
    let twitchClient;
    let container;

    const defaultConfig = {
        twitchChannel: 'testchannel',
        showBadges: true,
        showProfilePics: false,
        theme: 'default',
        profilePicSize: 32,
        profilePicRadius: 50,
        maxMessages: 15,
        messageLifetimeMs: 20000,
        pillboxBgColor: '#000000',
        pillboxOpacity: 65,
        pillboxRadius: 8,
        pillboxPadding: '8px 12px',
        messageGap: 8,
        userFontFamily: 'Arial, sans-serif',
        userFontSize: 16,
        userFontWeight: 800,
        userFontStyle: 'normal',
        userTextTransform: 'none',
        userLetterSpacing: 0,
        userShadowColor: '#000000',
        userShadowBlur: 3,
        userShadowOffsetX: 1,
        userShadowOffsetY: 1,
        msgFontFamily: 'Arial, sans-serif',
        msgColor: '#f8f8f8',
        msgFontSize: 16,
        msgFontWeight: 500,
        msgFontStyle: 'normal',
        msgLetterSpacing: 0,
        msgShadowColor: '#000000',
        msgShadowBlur: 2,
        msgShadowOffsetX: 1,
        msgShadowOffsetY: 1,
        borderWidth: 0,
        borderStyle: 'solid',
        borderColor: '#ffffff'
    };

    beforeEach(() => {
        vi.useFakeTimers();
        container = document.createElement('div');
        container.id = 'chat-container';
        document.body.appendChild(container);

        twitchClient = new TwitchClient({
            clientId: 'test-client-id',
            accessToken: 'test-token',
            twitchChannel: 'testchannel'
        });

        chatModule = new ChatModule({ ...defaultConfig }, twitchClient);
    });

    afterEach(() => {
        vi.useRealTimers();
        document.body.innerHTML = '';
        globalThis.parseEmotes = vi.fn().mockResolvedValue({
            toHTML: () => 'parsed-emote-html'
        });
    });

    describe('constructor', () => {
        it('stores config and twitchClient', () => {
            expect(chatModule.config).toEqual(expect.objectContaining({ twitchChannel: 'testchannel' }));
            expect(chatModule.twitchClient).toBe(twitchClient);
            expect(chatModule.container).toBeNull();
            expect(chatModule.client).toBeNull();
            expect(chatModule.badgesMap).toEqual({});
        });
    });

    describe('init', () => {
        it('sets container and applies styles', () => {
            chatModule.init('chat-container');
            expect(chatModule.container).toBe(container);
            expect(document.getElementById('chat-dynamic-styles')).not.toBeNull();
        });

        it('returns early if container not found', () => {
            const result = chatModule.init('nonexistent');
            expect(result).toBeUndefined();
            expect(chatModule.container).toBeNull();
        });

        it('creates tmi client when channel is set', () => {
            chatModule.init('chat-container');
            expect(chatModule.client).not.toBeNull();
            expect(chatModule.client.connect).toHaveBeenCalled();
            expect(chatModule.client.on).toHaveBeenCalledWith('message', expect.any(Function));
        });

        it('does not create tmi client when channel is empty', () => {
            const noChannel = new ChatModule({ ...defaultConfig, twitchChannel: '' }, twitchClient);
            noChannel.init('chat-container');
            expect(noChannel.client).toBeNull();
        });
    });

    describe('getBadgeUrl', () => {
        it('returns exact badge version when available', () => {
            chatModule.badgesMap = {
                broadcaster: { '1': { image: 'url-broadcaster-1', title: 'Broadcaster' } }
            };
            expect(chatModule.getBadgeUrl('broadcaster', '1')).toBe('url-broadcaster-1');
        });

        it('falls back to version 0 when requested version missing', () => {
            chatModule.badgesMap = {
                subscriber: { '0': { image: 'url-sub-0', title: 'Subscriber' } }
            };
            expect(chatModule.getBadgeUrl('subscriber', '1')).toBe('url-sub-0');
        });

        it('falls back to version 1 when version 0 missing', () => {
            chatModule.badgesMap = {
                vip: { '1': { image: 'url-vip-1', title: 'VIP' } }
            };
            expect(chatModule.getBadgeUrl('vip', '0')).toBe('url-vip-1');
        });

        it('falls back to first available version when neither 0 nor 1', () => {
            chatModule.badgesMap = {
                custom: { '2': { image: 'url-custom-2', title: 'Custom' } }
            };
            expect(chatModule.getBadgeUrl('custom', '1')).toBe('url-custom-2');
        });

        it('returns null for unknown badge set', () => {
            expect(chatModule.getBadgeUrl('nonexistent', '1')).toBeNull();
        });

        it('returns null for empty badge set', () => {
            chatModule.badgesMap = { empty: {} };
            expect(chatModule.getBadgeUrl('empty', '1')).toBeNull();
        });
    });

    describe('parseBadges', () => {
        it('merges badge sets into badgesMap', () => {
            const badgeSets = [
                {
                    set_id: 'vip',
                    versions: [
                        { id: '0', image_url_1x: 'vip-0', title: 'VIP' },
                        { id: '1', image_url_1x: 'vip-1', title: 'VIP' }
                    ]
                }
            ];

            chatModule.parseBadges(badgeSets);
            expect(chatModule.badgesMap.vip['0'].image).toBe('vip-0');
            expect(chatModule.badgesMap.vip['1'].image).toBe('vip-1');
        });

        it('preserves existing badge sets when merging', () => {
            chatModule.badgesMap = {
                broadcaster: { '1': { image: 'old', title: 'Broadcaster' } }
            };

            const badgeSets = [
                {
                    set_id: 'subscriber',
                    versions: [{ id: '0', image_url_1x: 'sub', title: 'Sub' }]
                }
            ];

            chatModule.parseBadges(badgeSets);
            expect(chatModule.badgesMap.broadcaster).toBeDefined();
            expect(chatModule.badgesMap.subscriber).toBeDefined();
        });
    });

    describe('loadBadges', () => {
        it('clears badgesMap when showBadges is false', async () => {
            chatModule.config.showBadges = false;
            chatModule.badgesMap = { existing: {} };
            await chatModule.loadBadges();
            expect(chatModule.badgesMap).toEqual({});
        });

        it('loads MOCK_BADGES when showBadges is true', async () => {
            await chatModule.loadBadges();
            expect(chatModule.badgesMap.broadcaster).toBeDefined();
            expect(chatModule.badgesMap.subscriber).toBeDefined();
        });

        it('returns early when no channel name', async () => {
            const noChannel = new ChatModule({ ...defaultConfig, twitchChannel: '' }, twitchClient);
            await noChannel.loadBadges();
            expect(noChannel.badgesMap.broadcaster).toBeDefined();
        });
    });

    describe('applyStyles', () => {
        it('creates style element with id chat-dynamic-styles', () => {
            chatModule.applyStyles();
            const style = document.getElementById('chat-dynamic-styles');
            expect(style).not.toBeNull();
            expect(style.tagName).toBe('STYLE');
        });

        it('replaces existing style element on re-apply', () => {
            chatModule.applyStyles();
            chatModule.applyStyles();
            const styles = document.querySelectorAll('#chat-dynamic-styles');
            expect(styles.length).toBe(1);
        });

        it('generates CSS with correct background color and opacity', () => {
            chatModule.applyStyles();
            const style = document.getElementById('chat-dynamic-styles');
            expect(style.innerHTML).toContain('rgba(0, 0, 0, 0.65)');
        });

        it('generates CSS with border none when borderWidth is 0', () => {
            chatModule.applyStyles();
            const style = document.getElementById('chat-dynamic-styles');
            expect(style.innerHTML).toContain('border: none');
        });

        it('generates CSS with border when borderWidth > 0', () => {
            chatModule.config.borderWidth = 2;
            chatModule.config.borderStyle = 'dashed';
            chatModule.config.borderColor = '#ff0000';
            chatModule.applyStyles();
            const style = document.getElementById('chat-dynamic-styles');
            expect(style.innerHTML).toContain('2px dashed #ff0000');
        });

        it('includes Windows 95 CSS classes', () => {
            chatModule.applyStyles();
            const style = document.getElementById('chat-dynamic-styles');
            expect(style.innerHTML).toContain('theme-windows95');
            expect(style.innerHTML).toContain('win95-titlebar');
            expect(style.innerHTML).toContain('win95-body');
        });
    });

    describe('handleMessage', () => {
        const baseTags = {
            'display-name': 'TestUser',
            'username': 'testuser',
            'color': '#FF0000',
            'user-id': '98765',
            'badges': { moderator: '1', subscriber: '0' },
            'emotes': null,
            'room-id': '12345'
        };

        it('appends a message to the container', async () => {
            chatModule.init('chat-container');
            await chatModule.handleMessage('#testchannel', baseTags, 'Hello world!', false);
            expect(container.children.length).toBe(1);
            expect(container.children[0].classList.contains('chat-message')).toBe(true);
        });

        it('renders the display name and message text', async () => {
            chatModule.init('chat-container');
            await chatModule.handleMessage('#testchannel', baseTags, 'Hello world!', false);
            expect(container.textContent).toContain('TestUser');
            expect(container.innerHTML).toContain('parsed-emote-html');
        });

        it('respects maxMessages limit', async () => {
            globalThis.parseEmotes = vi.fn().mockImplementation((msg) => Promise.resolve({ toHTML: () => msg }));
            chatModule.config.maxMessages = 2;
            chatModule.init('chat-container');
            await chatModule.handleMessage('#testchannel', baseTags, 'msg1', false);
            await chatModule.handleMessage('#testchannel', baseTags, 'msg2', false);
            await chatModule.handleMessage('#testchannel', baseTags, 'msg3', false);
            expect(container.children.length).toBe(2);
            expect(container.children[0].textContent.replace(/\s+/g, ' ')).toContain('msg2');
            expect(container.children[1].textContent.replace(/\s+/g, ' ')).toContain('msg3');
        });

        it('renders badges HTML when showBadges is true', async () => {
            chatModule.init('chat-container');
            await chatModule.handleMessage('#testchannel', baseTags, 'test', false);
            expect(container.innerHTML).toContain('chat-badge');
            expect(container.innerHTML).toContain('badges-container');
        });

        it('does not render badges when showBadges is false', async () => {
            chatModule.config.showBadges = false;
            chatModule.init('chat-container');
            await chatModule.handleMessage('#testchannel', baseTags, 'test', false);
            expect(container.innerHTML).not.toContain('chat-badge');
        });

        it('uses default color when user has no color', async () => {
            chatModule.init('chat-container');
            const tagsNoColor = { ...baseTags, color: undefined };
            await chatModule.handleMessage('#testchannel', tagsNoColor, 'test', false);
            const usernameEl = container.querySelector('.username');
            expect(usernameEl.style.color).toBe('rgb(145, 70, 255)');
        });

        it('renders Windows 95 theme when configured', async () => {
            chatModule.config.theme = 'windows95';
            chatModule.init('chat-container');
            await chatModule.handleMessage('#testchannel', baseTags, 'test', false);
            expect(container.innerHTML).toContain('theme-windows95');
            expect(container.innerHTML).toContain('win95-titlebar');
            expect(container.innerHTML).toContain('win95-close-btn');
        });

        it('renders Powerline theme when configured', async () => {
            chatModule.config.theme = 'powerline';
            chatModule.init('chat-container');
            await chatModule.handleMessage('#testchannel', baseTags, 'test', false);
            expect(container.innerHTML).toContain('theme-powerline');
            expect(container.innerHTML).not.toContain('theme-windows95');
            expect(container.innerHTML).toContain('powerline-header');
            expect(container.innerHTML).toContain('term-segment');
            expect(container.innerHTML).toContain('term-icon');
            expect(container.innerHTML).toContain('path-tilde');
            expect(container.innerHTML).toContain('cursor-blink');
            expect(container.innerHTML).toContain('class="username"');
            expect(container.innerHTML).toContain('class="message-text"');
        });

        it('sets aria-label on username-text for Powerline theme', async () => {
            chatModule.config.theme = 'powerline';
            chatModule.init('chat-container');
            await chatModule.handleMessage('#testchannel', baseTags, 'test', false);
            const nameEl = container.querySelector('.username-text');
            expect(nameEl.getAttribute('aria-label')).toBe('TestUser');
        });

        it('does not set aria-label for default theme', async () => {
            chatModule.config.theme = 'default';
            chatModule.init('chat-container');
            await chatModule.handleMessage('#testchannel', baseTags, 'test', false);
            const nameEl = container.querySelector('.username-text');
            expect(nameEl.hasAttribute('aria-label')).toBe(false);
        });

        it('applies fade-out class after messageLifetimeMs', async () => {
            chatModule.init('chat-container');
            await chatModule.handleMessage('#testchannel', baseTags, 'test', false);
            const msg = container.children[0];

            expect(msg.classList.contains('fade-out')).toBe(false);

            vi.advanceTimersByTime(20000);
            expect(msg.classList.contains('fade-out')).toBe(true);
        });

        it('does not set fade-out when messageLifetimeMs is 0', async () => {
            chatModule.config.messageLifetimeMs = 0;
            chatModule.init('chat-container');
            await chatModule.handleMessage('#testchannel', baseTags, 'test', false);
            const msg = container.children[0];

            vi.advanceTimersByTime(100000);
            expect(msg.classList.contains('fade-out')).toBe(false);
        });

        it('triggers animationend to remove message after fade-out', async () => {
            chatModule.config.messageLifetimeMs = 100;
            chatModule.init('chat-container');
            await chatModule.handleMessage('#testchannel', baseTags, 'test', false);
            const msg = container.children[0];

            expect(container.children.length).toBe(1);

            vi.advanceTimersByTime(100);

            expect(msg.classList.contains('fade-out')).toBe(true);

            msg.dispatchEvent(new Event('animationend'));

            expect(container.children.length).toBe(0);
        });

        it('parses emotes when window.parseEmotes is available', async () => {
            chatModule.init('chat-container');
            await chatModule.handleMessage('#testchannel', baseTags, 'PogChamp', false);
            expect(container.innerHTML).toContain('parsed-emote-html');
        });

        it('handles self messages without issues', async () => {
            chatModule.init('chat-container');
            await chatModule.handleMessage('#testchannel', baseTags, 'test', true);
            expect(container.children.length).toBe(1);
        });
    });

    describe('fetchUserProfilePic (batching)', () => {
        it('caches previously fetched profile pictures', async () => {
            chatModule.twitchClient = twitchClient;
            chatModule.profilePicsCache = { 'user1': 'https://example.com/pic.jpg' };
            const result = await chatModule.fetchUserProfilePic('user1');
            expect(result).toBe('https://example.com/pic.jpg');
        });

        it('queues multiple users and resolves with profile data', async () => {
            chatModule.twitchClient = twitchClient;
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    data: [
                        { id: 'user1', profile_image_url: 'https://example.com/user1.jpg' },
                        { id: 'user2', profile_image_url: 'https://example.com/user2.jpg' }
                    ]
                })
            });

            const p1 = chatModule.fetchUserProfilePic('user1');
            const p2 = chatModule.fetchUserProfilePic('user2');

            vi.advanceTimersByTime(50);

            const [r1, r2] = await Promise.all([p1, p2]);
            expect(r1).toBe('https://example.com/user1.jpg');
            expect(r2).toBe('https://example.com/user2.jpg');
        });

        it('falls back to default avatar when user not found in API response', async () => {
            chatModule.twitchClient = twitchClient;
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ data: [] })
            });

            const p = chatModule.fetchUserProfilePic('unknown-user');
            vi.advanceTimersByTime(50);
            const result = await p;
            expect(result).toBe('assets/default-avatar.svg');
        });

        it('falls back to default avatar on fetch error', async () => {
            chatModule.twitchClient = twitchClient;
            globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

            const p = chatModule.fetchUserProfilePic('user1');
            vi.advanceTimersByTime(50);
            const result = await p;
            expect(result).toBe('assets/default-avatar.svg');
        });

        it('batches requests: processes all queued users in one fetch', async () => {
            chatModule.twitchClient = twitchClient;
            const fetchMock = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    data: [
                        { id: 'user1', profile_image_url: 'https://example.com/u1.jpg' },
                        { id: 'user2', profile_image_url: 'https://example.com/u2.jpg' }
                    ]
                })
            });
            globalThis.fetch = fetchMock;

            chatModule.fetchUserProfilePic('user1');
            chatModule.fetchUserProfilePic('user2');
            vi.advanceTimersByTime(50);

            await Promise.all([
                chatModule.fetchUserProfilePic('user1'),
                chatModule.fetchUserProfilePic('user2')
            ]);

            expect(fetchMock).toHaveBeenCalledTimes(1);
        });

        it('chunks requests by 100 users', async () => {
            chatModule.twitchClient = twitchClient;
            const fetchMock = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ data: [] })
            });
            globalThis.fetch = fetchMock;

            for (let i = 0; i < 150; i++) {
                chatModule.fetchUserProfilePic(`user${i}`);
            }
            vi.advanceTimersByTime(50);

            await vi.waitFor(() => {
                expect(fetchMock).toHaveBeenCalledTimes(2);
            });

            const firstCall = fetchMock.mock.calls[0][0];
            expect(firstCall).toContain('user0');
            expect(firstCall).toContain('user99');
            expect(firstCall).not.toContain('user100');

            const secondCall = fetchMock.mock.calls[1][0];
            expect(secondCall).toContain('user100');
            expect(secondCall).toContain('user149');
        });
    });
});
