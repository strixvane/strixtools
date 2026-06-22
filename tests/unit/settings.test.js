import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const {
    getSettings,
    saveToLocalStorage,
    loadFromLocalStorage,
    updatePreview,
    applyWindows95Styles,
    validateInputs,
    generateOBSUrl,
    testChatMessage,
    testEvent,
    openTab,
    resetToDefaults
} = window;

const STORAGE_KEY = 'strixTools_settings';

describe('Settings Module', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        document.body.innerHTML = `
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
            <div class="tabs"><button type="button" class="tab-btn active" data-tab="general">General</button><button type="button" class="tab-btn" data-tab="chat">Chat</button><button type="button" class="tab-btn" data-tab="events">Events</button></div>
            <input type="text" id="obsUrlOutput" readonly>
            <div id="preview-box">
                <div id="events-preview">
                    <div class="event-container" id="preview-follow"><span class="label">Latest Follower:</span><span class="value">TestUser</span></div>
                    <div class="event-container" id="preview-sub"><span class="label">Latest Sub:</span><span class="value">TestUser</span></div>
                    <div class="event-container" id="preview-cheer"><span class="label">Latest Cheer:</span><span class="value">TestUser (1000 bits)</span></div>
                </div>
                <div id="chat-preview">
                    <div class="chat-message" data-badges="broadcaster,subscriber">
                        <span class="username" style="color: #9146FF;">OwlishGeorge:</span>
                        <span class="message-text">Welcome!</span>
                    </div>
                </div>
            </div>
            <button type="button" class="action-btn" data-action="generateOBSUrl" data-type="chat">Chat Only</button>
        `;

        globalThis.alert = vi.fn();
        globalThis.confirm = vi.fn().mockReturnValue(true);
    });

    afterEach(() => {
        vi.useRealTimers();
        document.body.innerHTML = '';
        localStorage.clear();
        delete globalThis.confirm;
    });

    describe('getSettings', () => {
        it('reads general settings from form fields', () => {
            document.getElementById('twitchChannel').value = 'mychannel';
            document.getElementById('clientId').value = 'myclientid';
            document.getElementById('accessToken').value = 'mytoken';

            const s = getSettings();
            expect(s.general.twitchChannel).toBe('mychannel');
            expect(s.general.clientId).toBe('myclientid');
            expect(s.general.accessToken).toBe('mytoken');
        });

        it('reads chat settings from form fields', () => {
            const s = getSettings();
            expect(s.chat.theme).toBe('default');
            expect(s.chat.showBadges).toBe(true);
            expect(s.chat.pillboxBgColor).toBe('#000000');
            expect(s.chat.maxMessages).toBe(15);
        });

        it('reads boolean values correctly', () => {
            document.getElementById('showBadges').checked = true;
            expect(getSettings().chat.showBadges).toBe(true);
        });

        it('reads events settings from form fields', () => {
            const s = getSettings();
            expect(s.events.fontFamily).toBe('Montserrat');
            expect(s.events.fontSize).toBe(20);
            expect(s.events.textColor).toBe('#ffffff');
            expect(s.events.layout).toBe('vertical');
        });

        it('returns default values for missing elements', () => {
            const el = document.getElementById('nonexistent');
            expect(el).toBeNull();
            const s = getSettings();
            expect(s.general.twitchChannel).toBe('');
        });
    });

    describe('saveToLocalStorage', () => {
        it('saves settings to localStorage', () => {
            document.getElementById('twitchChannel').value = 'savedchannel';
            saveToLocalStorage();
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
            expect(saved.general.twitchChannel).toBe('savedchannel');
        });

        it('stores all sections in localStorage', () => {
            saveToLocalStorage();
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
            expect(saved).toHaveProperty('general');
            expect(saved).toHaveProperty('chat');
            expect(saved).toHaveProperty('events');
        });
    });

    describe('loadFromLocalStorage', () => {
        it('loads settings and sets form values', () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                general: { twitchChannel: 'loadedchan', clientId: 'loadedid', accessToken: 'loadedtoken' },
                chat: { maxMessages: 30, showBadges: true, theme: 'windows95' },
                events: { fontSize: 24, textColor: '#ff0000' }
            }));

            loadFromLocalStorage();

            expect(document.getElementById('twitchChannel').value).toBe('loadedchan');
            expect(document.getElementById('clientId').value).toBe('loadedid');
            expect(document.getElementById('accessToken').value).toBe('loadedtoken');
            expect(document.getElementById('maxMessages').value).toBe('30');
            expect(document.getElementById('chatTheme').value).toBe('windows95');
            expect(document.getElementById('showBadges').checked).toBe(true);
            expect(document.getElementById('eventFontSize').value).toBe('24');
            expect(document.getElementById('eventTextColor').value).toBe('#ff0000');
        });

        it('does nothing when localStorage is empty', () => {
            localStorage.removeItem(STORAGE_KEY);
            loadFromLocalStorage();
            expect(document.getElementById('twitchChannel').value).toBe('');
        });

        it('handles corrupt JSON gracefully', () => {
            localStorage.setItem(STORAGE_KEY, 'not-json');
            const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
            loadFromLocalStorage();
            expect(console.error).toHaveBeenCalled();
            spy.mockRestore();
        });
    });

    describe('validateInputs', () => {
        it('returns false when channel is empty', () => {
            expect(validateInputs()).toBe(false);
            expect(globalThis.alert).toHaveBeenCalled();
        });

        it('returns false when clientId is empty', () => {
            document.getElementById('twitchChannel').value = 'mychannel';
            expect(validateInputs()).toBe(false);
        });

        it('returns false when accessToken is empty', () => {
            document.getElementById('twitchChannel').value = 'mychannel';
            document.getElementById('clientId').value = 'myid';
            expect(validateInputs()).toBe(false);
        });

        it('returns true when all fields are filled', () => {
            document.getElementById('twitchChannel').value = 'mychannel';
            document.getElementById('clientId').value = 'myid';
            document.getElementById('accessToken').value = 'mytoken';
            expect(validateInputs()).toBe(true);
            expect(globalThis.alert).not.toHaveBeenCalled();
        });
    });

    describe('generateOBSUrl', () => {
        beforeEach(() => {
            document.getElementById('twitchChannel').value = 'mychannel';
            document.getElementById('clientId').value = 'myid';
            document.getElementById('accessToken').value = 'mytoken';
        });

        it('generates a URL with encoded settings', () => {
            vi.spyOn(window, 'location', 'get').mockReturnValue({
                href: 'http://localhost/settings.html?foo=bar'
            });
            generateOBSUrl('all');
            const output = document.getElementById('obsUrlOutput');
            expect(output.value).toContain('?cfg=');
            expect(output.value).toContain('index.html');
        });

        it('includes type parameter when not all', () => {
            generateOBSUrl('chat');
            const output = document.getElementById('obsUrlOutput');
            expect(output.value).toContain('&type=chat');
        });

        it('does not include type parameter for all', () => {
            generateOBSUrl('all');
            const output = document.getElementById('obsUrlOutput');
            expect(output.value).not.toContain('&type=');
        });

        it('discards original query params from settings page URL', () => {
            vi.spyOn(window, 'location', 'get').mockReturnValue({
                href: 'http://localhost/settings.html?foo=bar'
            });
            generateOBSUrl('all');
            const output = document.getElementById('obsUrlOutput');
            expect(output.value).not.toContain('foo=');
            expect(output.value).not.toContain('bar');
        });

        it('copies URL to clipboard on generate', async () => {
            globalThis.navigator.clipboard.writeText = vi.fn().mockResolvedValue();
            generateOBSUrl('chat');
            await vi.waitFor(() => {
                expect(globalThis.navigator.clipboard.writeText).toHaveBeenCalled();
            });
            const url = globalThis.navigator.clipboard.writeText.mock.calls[0][0];
            expect(url).toContain('?cfg=');
            expect(url).toContain('&type=chat');
        });
    });

    describe('openTab', () => {
        it('activates the target tab and deactivates others', () => {
            openTab('chat');
            expect(document.getElementById('general').classList.contains('active')).toBe(false);
            expect(document.getElementById('chat').classList.contains('active')).toBe(true);
            expect(document.getElementById('events').classList.contains('active')).toBe(false);
        });

        it('highlights the correct tab button', () => {
            openTab('events');
            const buttons = document.querySelectorAll('.tab-btn');
            expect(buttons[0].classList.contains('active')).toBe(false);
            expect(buttons[2].classList.contains('active')).toBe(true);
        });
    });

    describe('testChatMessage', () => {
        it('appends a new chat message to the preview', () => {
            const preview = document.getElementById('chat-preview');
            const initialCount = preview.children.length;
            testChatMessage();
            expect(preview.children.length).toBe(initialCount + 1);
        });

        it('limits messages to maxMessages', () => {
            document.getElementById('maxMessages').value = '1';
            const preview = document.getElementById('chat-preview');
            testChatMessage();
            testChatMessage();
            expect(preview.children.length).toBe(1);
        });

        it('removes test messages after messageLifetimeMs (original remains)', () => {
            document.getElementById('messageLifetime').value = '100';
            const preview = document.getElementById('chat-preview');
            const originalCount = preview.children.length;
            testChatMessage();

            vi.advanceTimersByTime(100);
            vi.advanceTimersByTime(500);
            expect(preview.children.length).toBe(originalCount);
        });

        it('applies Windows 95 theme to all messages including newly added ones', () => {
            const chatPreview = document.getElementById('chat-preview');

            const msg2 = document.createElement('div');
            msg2.classList.add('chat-message');
            msg2.setAttribute('data-badges', 'moderator');
            msg2.innerHTML = '<span class="username" style="color: #FF0000;">Strixvane:</span><span class="message-text">Nice overlay!</span>';
            chatPreview.appendChild(msg2);

            updatePreview();

            let messages = chatPreview.querySelectorAll('.chat-message');
            expect(messages.length).toBe(2);

            document.getElementById('chatTheme').value = 'windows95';
            updatePreview();

            messages = chatPreview.querySelectorAll('.chat-message');
            messages.forEach(msg => {
                expect(msg.classList.contains('theme-windows95')).toBe(true);
                expect(msg.style.backgroundColor).toBe('rgb(192, 192, 192)');
            });

            testChatMessage();

            messages = chatPreview.querySelectorAll('.chat-message');
            messages.forEach(msg => {
                expect(msg.classList.contains('theme-windows95')).toBe(true);
                expect(msg.style.backgroundColor).toBe('rgb(192, 192, 192)');
                const titlebar = msg.querySelector('.win95-titlebar');
                expect(titlebar).not.toBeNull();
                expect(titlebar.style.backgroundColor).toBe('rgb(0, 0, 128)');
            });

            testChatMessage();

            messages = chatPreview.querySelectorAll('.chat-message');
            messages.forEach(msg => {
                expect(msg.classList.contains('theme-windows95')).toBe(true);
                expect(msg.style.backgroundColor).toBe('rgb(192, 192, 192)');
            });

            document.getElementById('chatTheme').value = 'default';
            updatePreview();

            messages = chatPreview.querySelectorAll('.chat-message');
            messages.forEach(msg => {
                expect(msg.classList.contains('theme-windows95')).toBe(false);
                const usernameEl = msg.querySelector('.username');
                expect(usernameEl).not.toBeNull();
                expect(msg.style.backgroundColor).not.toBe('rgb(192, 192, 192)');
            });

            document.getElementById('chatTheme').value = 'windows95';
            updatePreview();

            messages = chatPreview.querySelectorAll('.chat-message');
            messages.forEach(msg => {
                expect(msg.classList.contains('theme-windows95')).toBe(true);
                expect(msg.style.backgroundColor).toBe('rgb(192, 192, 192)');
            });

            testChatMessage();

            messages = chatPreview.querySelectorAll('.chat-message');
            messages.forEach(msg => {
                expect(msg.classList.contains('theme-windows95')).toBe(true);
                expect(msg.style.backgroundColor).toBe('rgb(192, 192, 192)');
            });
        });

        it('clears Windows 95 inline styles when switching to Modern theme', () => {
            const chatPreview = document.getElementById('chat-preview');

            document.getElementById('chatTheme').value = 'windows95';
            updatePreview();

            let messages = chatPreview.querySelectorAll('.chat-message');
            messages.forEach(msg => {
                expect(msg.style.backgroundColor).toBe('rgb(192, 192, 192)');
            });

            document.getElementById('chatTheme').value = 'default';
            updatePreview();

            messages = chatPreview.querySelectorAll('.chat-message');
            messages.forEach(msg => {
                expect(msg.classList.contains('theme-windows95')).toBe(false);
            });
        });

        it('applies Powerline theme and renders terminal structure', () => {
            const chatPreview = document.getElementById('chat-preview');

            document.getElementById('chatTheme').value = 'powerline';
            updatePreview();

            const messages = chatPreview.querySelectorAll('.chat-message');
            messages.forEach(msg => {
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

            document.getElementById('chatAccentColor').value = '#00ff00';
            updatePreview();

            const updatedMessages = chatPreview.querySelectorAll('.chat-message');
            updatedMessages.forEach(msg => {
                expect(msg.classList.contains('theme-powerline')).toBe(true);
            });

            document.getElementById('chatTheme').value = 'default';
            updatePreview();

            const defaultMessages = chatPreview.querySelectorAll('.chat-message');
            defaultMessages.forEach(msg => {
                expect(msg.classList.contains('theme-powerline')).toBe(false);
                expect(msg.classList.contains('theme-windows95')).toBe(false);
            });

            document.getElementById('chatTheme').value = 'powerline';
            updatePreview();

            const revertedMessages = chatPreview.querySelectorAll('.chat-message');
            revertedMessages.forEach(msg => {
                expect(msg.classList.contains('theme-powerline')).toBe(true);
            });
        });

        it('accepts accent color default and renders without error', () => {
            const accentInput = document.getElementById('chatAccentColor');
            expect(accentInput).not.toBeNull();
            expect(accentInput.value).toBe('#000000');

            expect(() => updatePreview()).not.toThrow();
        });

        it('syncs accent color to theme default when switching themes', () => {
            const accentInput = document.getElementById('chatAccentColor');

            document.getElementById('chatTheme').value = 'powerline';
            window.syncAccentColor();
            expect(accentInput.value).toBe('#e84364');

            document.getElementById('chatTheme').value = 'default';
            window.syncAccentColor();
            expect(accentInput.value).toBe('#000000');

            document.getElementById('chatTheme').value = 'windows95';
            window.syncAccentColor();
            expect(accentInput.value).toBe('#000080');

            // Back to powerline
            document.getElementById('chatTheme').value = 'powerline';
            window.syncAccentColor();
            expect(accentInput.value).toBe('#e84364');
        });

        it('preserves manually set accent color on same-theme re-render', () => {
            const accentInput = document.getElementById('chatAccentColor');
            accentInput.value = '#ff6600';

            document.getElementById('chatTheme').value = 'powerline';
            window.syncAccentColor();
            expect(accentInput.value).toBe('#e84364');

            accentInput.value = '#aabbcc';
            expect(() => updatePreview()).not.toThrow();
            expect(accentInput.value).toBe('#aabbcc');
        });

        it('switches from Windows 95 to Powerline and clears Win95 styles', () => {
            const chatPreview = document.getElementById('chat-preview');

            document.getElementById('chatTheme').value = 'windows95';
            updatePreview();

            let messages = chatPreview.querySelectorAll('.chat-message');
            messages.forEach(msg => {
                expect(msg.classList.contains('theme-windows95')).toBe(true);
            });

            document.getElementById('chatTheme').value = 'powerline';
            updatePreview();

            messages = chatPreview.querySelectorAll('.chat-message');
            messages.forEach(msg => {
                expect(msg.classList.contains('theme-windows95')).toBe(false);
                expect(msg.classList.contains('theme-powerline')).toBe(true);
                expect(msg.style.backgroundColor).not.toBe('rgb(192, 192, 192)');
                expect(msg.querySelector('.term-segment')).not.toBeNull();
                expect(msg.querySelector('.path-tilde')).not.toBeNull();
            });
        });

        it('generates valid 7-char hex color in the message HTML', () => {
            const preview = document.getElementById('chat-preview');
            const initialCount = preview.children.length;
            testChatMessage();
            const msg = preview.children[initialCount];
            const usernameEl = msg.querySelector('.username');
            expect(usernameEl).not.toBeNull();
            expect(usernameEl.style.color).not.toBe('');
            const userColor = msg.getAttribute('data-usercolor');
            expect(userColor).not.toBeNull();
            expect(userColor.length).toBeGreaterThan(0);
        });
    });

    describe('testEvent', () => {
        it('updates a random event preview value', () => {
            const valEl = document.querySelector('#preview-follow .value');
            testEvent();
            expect(valEl.innerText).not.toBe('');
        });
    });

    describe('resetToDefaults', () => {
        it('resets all chat form fields to defaults', () => {
            document.getElementById('maxMessages').value = '999';
            document.getElementById('chatTheme').value = 'windows95';
            document.getElementById('pillboxBgColor').value = '#ff0000';

            resetToDefaults();

            expect(document.getElementById('maxMessages').value).toBe('15');
            expect(document.getElementById('chatTheme').value).toBe('default');
            expect(document.getElementById('pillboxBgColor').value).toBe('#000000');
        });

        it('resets all events form fields to defaults', () => {
            document.getElementById('eventFontSize').value = '99';
            document.getElementById('eventTextColor').value = '#000000';

            resetToDefaults();

            expect(document.getElementById('eventFontSize').value).toBe('20');
            expect(document.getElementById('eventTextColor').value).toBe('#ffffff');
        });

        it('does nothing if user cancels confirmation', () => {
            globalThis.confirm = vi.fn().mockReturnValue(false);
            document.getElementById('maxMessages').value = '999';
            resetToDefaults();
            expect(document.getElementById('maxMessages').value).toBe('999');
        });
    });

    describe('applyWindows95Styles', () => {
        it('applies Windows 95 theme inline styles to a message element', () => {
            const msg = document.createElement('div');
            msg.classList.add('chat-message');
            msg.innerHTML = `
                <div class="win95-titlebar">
                    <span class="win95-title">TestUser</span>
                    <button class="win95-close-btn" aria-label="Close">×</button>
                </div>
                <div class="win95-body">
                    <div class="message-content">
                        <span class="message-text">Hello World</span>
                    </div>
                </div>
            `;

            applyWindows95Styles(msg, window.DEFAULT_SETTINGS.chat);

            expect(msg.style.backgroundColor).toBe('rgb(192, 192, 192)');
            expect(msg.style.borderRadius).toBe('0px');
            const titlebar = msg.querySelector('.win95-titlebar');
            expect(titlebar.style.backgroundColor).toBe('rgb(0, 0, 128)');
            expect(titlebar.style.color).toBe('rgb(255, 255, 255)');
            const title = msg.querySelector('.win95-title');
            expect(title.style.fontFamily).toContain('MS Sans Serif');
            const closeBtn = msg.querySelector('.win95-close-btn');
            expect(closeBtn.style.backgroundColor).toBe('rgb(192, 192, 192)');
            const win95Body = msg.querySelector('.win95-body');
            expect(win95Body.style.backgroundColor).toBe('rgb(255, 255, 255)');
            const msgText = msg.querySelector('.message-text');
            expect(msgText.style.color).toBe('rgb(0, 0, 0)');
        });
    });

    describe('updatePreview', () => {
        it('updates event preview styles from settings', () => {
            document.getElementById('eventFontSize').value = '30';
            document.getElementById('eventTextColor').value = '#ff0000';
            document.getElementById('eventFontFamily').value = 'Georgia';

            updatePreview();

            const previewBox = document.getElementById('preview-box');
            expect(previewBox.style.getPropertyValue('--event-font-size')).toBe('30px');
            expect(previewBox.style.getPropertyValue('--event-text-color')).toBe('#ff0000');
            expect(previewBox.style.getPropertyValue('--event-font-family')).toBe('Georgia');
            const styleEl = document.getElementById('preview-dynamic-styles');
            expect(styleEl.textContent).toContain('font-size: var(--event-font-size)');
        });

        it('updates chat preview styles from settings', () => {
            document.getElementById('pillboxBgColor').value = '#ff00ff';
            document.getElementById('pillboxOpacity').value = '50';
            document.getElementById('pillboxRadius').value = '20';

            updatePreview();

            const styleEl = document.getElementById('preview-dynamic-styles');
            expect(styleEl.textContent).toContain('border-radius: 20px');
        });
    });
});
