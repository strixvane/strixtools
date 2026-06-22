import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const {
    getSettings,
    generateOBSUrl
} = window;

const DEEP_MERGE = (target, source) => {
    const result = { ...target };
    for (const key in source) {
        if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
            result[key] = DEEP_MERGE(target[key], source[key]);
        } else {
            result[key] = source[key];
        }
    }
    return result;
};

const SETTINGS_DOM = `
    <div id="general" class="tab-content active">
        <input type="text" id="twitchChannel" value="">
        <input type="text" id="clientId" value="">
        <input type="password" id="accessToken" value="">
    </div>
    <div id="chat" class="tab-content">
        <select id="chatTheme"><option value="default">Modern Pillbox</option><option value="windows95">Windows 95</option><option value="powerline">Powerline</option></select>
        <input type="checkbox" id="showBadges" checked>
        <input type="checkbox" id="showProfilePics">
        <input type="number" id="profilePicSize" value="32">
        <input type="range" id="profilePicRadius" value="50">
        <input type="number" id="maxMessages" value="15">
        <input type="number" id="messageLifetime" value="20000">
        <input type="color" id="pillboxBgColor" value="#000000">
        <input type="range" id="pillboxOpacity" value="65">
        <input type="number" id="pillboxRadius" value="8">
        <input type="text" id="pillboxPadding" value="8px 12px">
        <input type="number" id="messageGap" value="8">
        <input type="text" id="userFontFamily" value="Arial">
        <input type="number" id="userFontSize" value="16">
        <select id="userFontWeight"><option value="800">800</option></select>
        <select id="userFontStyle"><option value="normal">Normal</option></select>
        <select id="userTextTransform"><option value="none">None</option></select>
        <input type="number" id="userLetterSpacing" value="0">
        <input type="color" id="userShadowColor" value="#000000">
        <input type="number" id="userShadowBlur" value="3">
        <input type="number" id="userShadowOffsetX" value="1">
        <input type="number" id="userShadowOffsetY" value="1">
        <input type="text" id="msgFontFamily" value="Arial">
        <input type="color" id="msgColor" value="#f8f8f8">
        <input type="number" id="msgFontSize" value="16">
        <select id="msgFontWeight"><option value="500">500</option></select>
        <select id="msgFontStyle"><option value="normal">Normal</option></select>
        <input type="number" id="msgLetterSpacing" value="0">
        <input type="color" id="msgShadowColor" value="#000000">
        <input type="number" id="msgShadowBlur" value="2">
        <input type="number" id="msgShadowOffsetX" value="1">
        <input type="number" id="msgShadowOffsetY" value="1">
        <input type="color" id="chatAccentColor" value="#000000">
        <input type="number" id="chatBorderWidth" value="0">
        <select id="chatBorderStyle"><option value="solid">Solid</option></select>
        <input type="color" id="chatBorderColor" value="#ffffff">
    </div>
    <div id="events" class="tab-content">
        <input type="text" id="eventFontFamily" value="Montserrat">
        <input type="number" id="eventFontSize" value="20">
        <select id="eventFontWeight"><option value="800">800</option></select>
        <select id="eventFontStyle"><option value="normal">Normal</option></select>
        <select id="eventTextDecoration"><option value="none">None</option></select>
        <select id="eventTextTransform"><option value="uppercase">UPPERCASE</option></select>
        <input type="number" id="eventKerning" value="1">
        <input type="color" id="eventTextColor" value="#ffffff">
        <input type="color" id="eventLabelColor" value="#ff9900">
        <input type="color" id="eventShadowColor" value="#000000">
        <input type="number" id="eventShadowX" value="2">
        <input type="number" id="eventShadowY" value="2">
        <input type="number" id="eventShadowBlur" value="4">
        <select id="eventLayout"><option value="vertical">Vertical</option></select>
        <input type="number" id="eventSpacing" value="12">
        <input type="text" id="eventPadding" value="5px 10px">
        <select id="eventOrientation"><option value="horizontal">Horizontal</option></select>
        <select id="eventLabelPosition"><option value="before">Before</option></select>
        <input type="color" id="eventBgColor" value="#000000">
        <input type="range" id="eventBgOpacity" value="0">
        <input type="number" id="eventBorderRadius" value="0">
        <input type="number" id="eventBorderWidth" value="0">
        <select id="eventBorderStyle"><option value="solid">Solid</option></select>
        <input type="color" id="eventBorderColor" value="#ffffff">
        <input type="color" id="eventHighlightColor" value="#00FF00">
        <input type="number" id="eventHighlightDuration" value="2000">
    </div>
    <input type="text" id="obsUrlOutput" readonly>
`;

const OVERLAY_DOM = `
    <div id="chat-container"></div>
    <div id="events-container">
        <div id="latest-follow"><span class="label">Latest Follower:</span><span class="value"></span></div>
        <div id="latest-subscribe"><span class="label">Latest Sub:</span><span class="value"></span></div>
        <div id="latest-cheer"><span class="label">Latest Cheer:</span><span class="value"></span></div>
    </div>
`;

function encodeSettings(settings) {
    const diff = getDiff(settings, window.DEFAULT_SETTINGS);
    diff.general = {
        twitchChannel: settings.general.twitchChannel,
        clientId: settings.general.clientId,
        accessToken: settings.general.accessToken
    };
    return btoa(unescape(encodeURIComponent(JSON.stringify(diff))));
}

function getDiff(current, defaults) {
    const diff = {};
    for (const key in current) {
        if (typeof current[key] === 'object' && current[key] !== null) {
            const nestedDiff = getDiff(current[key], defaults[key] || {});
            if (Object.keys(nestedDiff).length > 0) {
                diff[key] = nestedDiff;
            }
        } else if (current[key] !== defaults[key]) {
            diff[key] = current[key];
        }
    }
    return diff;
}

describe('Overlay Pipeline', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        document.body.innerHTML = SETTINGS_DOM;
        globalThis.alert = vi.fn();
    });

    afterEach(() => {
        vi.useRealTimers();
        document.body.innerHTML = '';
        delete globalThis.alert;
    });

    describe('Settings encode / overlay decode round-trip', () => {
        it('encodes settings to URL and decodes them back faithfully', () => {
            document.getElementById('twitchChannel').value = 'testchannel';
            document.getElementById('clientId').value = 'testclient';
            document.getElementById('accessToken').value = 'testtoken';
            document.getElementById('chatTheme').value = 'windows95';
            document.getElementById('showBadges').checked = false;
            document.getElementById('maxMessages').value = '50';
            document.getElementById('messageLifetime').value = '0';
            document.getElementById('pillboxBgColor').value = '#ff00ff';
            document.getElementById('eventFontSize').value = '30';
            document.getElementById('eventTextColor').value = '#ff0000';

            const settings = getSettings();
            const encoded = encodeSettings(settings);
            const decodedString = decodeURIComponent(atob(encoded));
            const customSettings = JSON.parse(decodedString);
            const merged = DEEP_MERGE({ ...window.DEFAULT_SETTINGS }, customSettings);

            expect(merged.general.twitchChannel).toBe('testchannel');
            expect(merged.general.clientId).toBe('testclient');
            expect(merged.general.accessToken).toBe('testtoken');
            expect(merged.chat.theme).toBe('windows95');
            expect(merged.chat.showBadges).toBe(false);
            expect(merged.chat.maxMessages).toBe(50);
            expect(merged.chat.messageLifetimeMs).toBe(0);
            expect(merged.chat.pillboxBgColor).toBe('#ff00ff');
            expect(merged.events.fontSize).toBe(30);
            expect(merged.events.textColor).toBe('#ff0000');
        });

        it('only encodes non-default values', () => {
            document.getElementById('twitchChannel').value = 'mychannel';
            document.getElementById('clientId').value = 'myid';
            document.getElementById('accessToken').value = 'mytoken';

            const settings = getSettings();
            const encoded = encodeSettings(settings);
            const decodedString = decodeURIComponent(atob(encoded));
            const customSettings = JSON.parse(decodedString);

            expect(customSettings.chat.theme).toBeUndefined();
            expect(customSettings.chat.showBadges).toBeUndefined();
            expect(customSettings.chat.maxMessages).toBeUndefined();
        });

        it('full pipeline: generateOBSUrl output is decodable by the overlay', () => {
            document.getElementById('twitchChannel').value = 'mychannel';
            document.getElementById('clientId').value = 'myid';
            document.getElementById('accessToken').value = 'mytoken';
            document.getElementById('chatTheme').value = 'windows95';

            const originalHref = window.location.href;
            Object.defineProperty(window, 'location', {
                value: { href: 'http://localhost/settings.html' },
                writable: true
            });

            generateOBSUrl('all');
            const url = document.getElementById('obsUrlOutput').value;
            const parsedUrl = new URL(url);
            const encodedConfig = parsedUrl.searchParams.get('cfg');
            expect(encodedConfig).toBeTruthy();

            const decodedString = decodeURIComponent(atob(encodedConfig));
            const customSettings = JSON.parse(decodedString);
            const merged = DEEP_MERGE({ ...window.DEFAULT_SETTINGS }, customSettings);

            expect(merged.general.twitchChannel).toBe('mychannel');
            expect(merged.chat.theme).toBe('windows95');

            Object.defineProperty(window, 'location', {
                value: { href: originalHref },
                writable: true
            });
        });
    });

    describe('Overlay render with decoded settings', () => {
        it('renders chat messages with correct theme', async () => {
            document.body.innerHTML += OVERLAY_DOM;

            const settings = DEEP_MERGE({ ...window.DEFAULT_SETTINGS }, {
                general: { twitchChannel: 'testchannel', clientId: 'testid', accessToken: 'testtoken' },
                chat: { theme: 'windows95', showBadges: false, showProfilePics: false, maxMessages: 10, messageLifetimeMs: 0 }
            });

            const chatModule = new window.ChatModule(
                { ...settings.chat, twitchChannel: settings.general.twitchChannel },
                null
            );
            chatModule.init('chat-container');

            await chatModule.handleMessage(null, {
                'display-name': 'TestUser',
                username: 'testuser',
                color: '#FF0000',
                'user-id': '123',
                badges: null,
                emotes: null
            }, 'Hello from overlay!', null);

            const container = document.getElementById('chat-container');
            expect(container.children.length).toBe(1);

            const msg = container.querySelector('.chat-message');
            expect(msg).not.toBeNull();
            expect(msg.classList.contains('theme-windows95')).toBe(true);

            const winBg = window.getComputedStyle(msg).backgroundColor;
            expect(winBg).toBe('rgb(192, 192, 192)');

            const titlebar = msg.querySelector('.win95-titlebar');
            expect(titlebar).not.toBeNull();

            const title = msg.querySelector('.win95-title');
            expect(title).not.toBeNull();
        });

        it('renders default theme from decoded settings', async () => {
            document.body.innerHTML += OVERLAY_DOM;

            const settings = DEEP_MERGE({ ...window.DEFAULT_SETTINGS }, {
                general: { twitchChannel: 'testchannel', clientId: 'testid', accessToken: 'testtoken' },
                chat: { theme: 'default', showBadges: false, showProfilePics: false, maxMessages: 10, messageLifetimeMs: 0 }
            });

            const chatModule = new window.ChatModule(
                { ...settings.chat, twitchChannel: settings.general.twitchChannel },
                null
            );
            chatModule.init('chat-container');

            await chatModule.handleMessage(null, {
                'display-name': 'DefaultUser',
                username: 'defaultuser',
                color: '#00FF00',
                'user-id': '456',
                badges: null,
                emotes: null
            }, 'Default theme message', null);

            const container = document.getElementById('chat-container');
            const msg = container.querySelector('.chat-message');
            expect(msg).not.toBeNull();
            expect(msg.classList.contains('theme-windows95')).toBe(false);

            const usernameEl = msg.querySelector('.username');
            expect(usernameEl).not.toBeNull();
        });

        it('applies styles from decoded settings to the chat container', () => {
            document.body.innerHTML += OVERLAY_DOM;

            const settings = DEEP_MERGE({ ...window.DEFAULT_SETTINGS }, {
                general: { twitchChannel: 'testchannel', clientId: 'testid', accessToken: 'testtoken' },
                chat: { messageGap: 16, pillboxBgColor: '#ff00ff', pillboxRadius: 20 }
            });

            const chatModule = new window.ChatModule(
                { ...settings.chat, twitchChannel: settings.general.twitchChannel },
                null
            );
            chatModule.init('chat-container');

            const styleEl = document.getElementById('chat-dynamic-styles');
            expect(styleEl).not.toBeNull();
            expect(styleEl.textContent).toContain('gap: 16px');
        });

        it('encodes and decodes powerline theme with accent color', () => {
            document.getElementById('twitchChannel').value = 'spacechannel';
            document.getElementById('clientId').value = 'spaceid';
            document.getElementById('accessToken').value = 'spacetoken';
            document.getElementById('chatTheme').value = 'powerline';
            document.getElementById('chatAccentColor').value = '#ff6600';

            const settings = getSettings();
            const encoded = encodeSettings(settings);
            const decodedString = decodeURIComponent(atob(encoded));
            const customSettings = JSON.parse(decodedString);
            const merged = DEEP_MERGE({ ...window.DEFAULT_SETTINGS }, customSettings);

            expect(merged.chat.theme).toBe('powerline');
            expect(merged.chat.accentColor).toBe('#ff6600');
        });

        it('renders powerline theme with default accent color from decoded settings', async () => {
            document.body.innerHTML += OVERLAY_DOM;

            const settings = DEEP_MERGE({ ...window.DEFAULT_SETTINGS }, {
                general: { twitchChannel: 'spacetest', clientId: 'spaceid', accessToken: 'spacetoken' },
                chat: { theme: 'powerline', showBadges: false, showProfilePics: false, maxMessages: 10, messageLifetimeMs: 0 }
            });

            const chatModule = new window.ChatModule(
                { ...settings.chat, twitchChannel: settings.general.twitchChannel },
                null
            );
            chatModule.init('chat-container');

            await chatModule.handleMessage(null, {
                'display-name': 'SpaceUser',
                username: 'spaceuser',
                color: '#00FF00',
                'user-id': '42',
                badges: null,
                emotes: null
            }, 'To infinity and beyond!', null);

            const container = document.getElementById('chat-container');
            const msg = container.querySelector('.chat-message');
            expect(msg).not.toBeNull();
            expect(msg.classList.contains('theme-powerline')).toBe(true);
            expect(msg.classList.contains('theme-windows95')).toBe(false);

            expect(msg.querySelector('.powerline-header')).not.toBeNull();
            const segments = msg.querySelectorAll('.term-segment');
            expect(segments.length).toBe(3);
            expect(msg.querySelector('.avatar-segment')).not.toBeNull();
            expect(msg.querySelector('.user-segment')).not.toBeNull();
            expect(msg.querySelector('.spacer-segment')).not.toBeNull();
            expect(msg.querySelector('.path-tilde')).not.toBeNull();
            expect(msg.querySelector('.cursor-blink')).not.toBeNull();
            expect(msg.querySelector('.username')).not.toBeNull();
            expect(msg.querySelector('.message-text')).not.toBeNull();
            expect(msg.querySelector('.term-icon')).not.toBeNull();
        });
    });
});
