
const STORAGE_KEY = 'strixTools_settings';
const TEST_NAMES = ["ChristheClown_", "Celest_VT_", "Popcorb_", "xxstargazorxx", "finojalapeno", "omnomagonvt", "SpecterJesterVT", "Onihiko_VT", "Neoeva122"];
const eventTimeouts = {};

const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
};

const THEME_ACCENT_COLORS = {
    default: '#000000',
    windows95: '#000080',
    powerline: '#e84364'
};

function syncAccentColor() {
    const themeEl = document.getElementById('chatTheme');
    const colorEl = document.getElementById('chatAccentColor');
    if (!themeEl || !colorEl) return;
    const color = THEME_ACCENT_COLORS[themeEl.value];
    if (color) {
        colorEl.value = color;
    }
}

const SETTINGS_FIELDS = {
    general: [
        { id: 'twitchChannel', key: 'twitchChannel' },
        { id: 'clientId', key: 'clientId' },
        { id: 'accessToken', key: 'accessToken' }
    ],
    chat: [
        { id: 'chatTheme', key: 'theme' },
        { id: 'showBadges', key: 'showBadges', type: 'bool' },
        { id: 'showProfilePics', key: 'showProfilePics', type: 'bool' },
        { id: 'profilePicSize', key: 'profilePicSize' },
        { id: 'profilePicRadius', key: 'profilePicRadius' },
        { id: 'maxMessages', key: 'maxMessages' },
        { id: 'messageLifetime', key: 'messageLifetimeMs' },
        { id: 'pillboxBgColor', key: 'pillboxBgColor' },
        { id: 'pillboxOpacity', key: 'pillboxOpacity' },
        { id: 'pillboxRadius', key: 'pillboxRadius' },
        { id: 'pillboxPadding', key: 'pillboxPadding' },
        { id: 'messageGap', key: 'messageGap' },
        { id: 'userFontFamily', key: 'userFontFamily' },
        { id: 'userFontSize', key: 'userFontSize' },
        { id: 'userFontWeight', key: 'userFontWeight', type: 'string' },
        { id: 'userFontStyle', key: 'userFontStyle' },
        { id: 'userTextTransform', key: 'userTextTransform' },
        { id: 'userLetterSpacing', key: 'userLetterSpacing' },
        { id: 'userShadowColor', key: 'userShadowColor' },
        { id: 'userShadowBlur', key: 'userShadowBlur' },
        { id: 'userShadowOffsetX', key: 'userShadowOffsetX' },
        { id: 'userShadowOffsetY', key: 'userShadowOffsetY' },
        { id: 'msgFontFamily', key: 'msgFontFamily' },
        { id: 'msgColor', key: 'msgColor' },
        { id: 'msgFontSize', key: 'msgFontSize' },
        { id: 'msgFontWeight', key: 'msgFontWeight' },
        { id: 'msgFontStyle', key: 'msgFontStyle' },
        { id: 'msgLetterSpacing', key: 'msgLetterSpacing' },
        { id: 'msgShadowColor', key: 'msgShadowColor' },
        { id: 'msgShadowBlur', key: 'msgShadowBlur' },
        { id: 'msgShadowOffsetX', key: 'msgShadowOffsetX' },
        { id: 'msgShadowOffsetY', key: 'msgShadowOffsetY' },
        { id: 'chatAccentColor', key: 'accentColor' },
        { id: 'chatBorderWidth', key: 'borderWidth' },
        { id: 'chatBorderStyle', key: 'borderStyle' },
        { id: 'chatBorderColor', key: 'borderColor' }
    ],
    events: [
        { id: 'eventFontFamily', key: 'fontFamily' },
        { id: 'eventFontSize', key: 'fontSize' },
        { id: 'eventFontWeight', key: 'fontWeight', type: 'string' },
        { id: 'eventFontStyle', key: 'fontStyle' },
        { id: 'eventTextTransform', key: 'textTransform' },
        { id: 'eventTextDecoration', key: 'textDecoration' },
        { id: 'eventKerning', key: 'kerning' },
        { id: 'eventTextColor', key: 'textColor' },
        { id: 'eventLabelColor', key: 'labelColor' },
        { id: 'eventShadowColor', key: 'shadowColor' },
        { id: 'eventShadowX', key: 'shadowX' },
        { id: 'eventShadowY', key: 'shadowY' },
        { id: 'eventShadowBlur', key: 'shadowBlur' },
        { id: 'eventLayout', key: 'layout' },
        { id: 'eventSpacing', key: 'spacing' },
        { id: 'eventPadding', key: 'padding' },
        { id: 'eventOrientation', key: 'orientation' },
        { id: 'eventLabelPosition', key: 'labelPosition' },
        { id: 'eventBgColor', key: 'bgColor' },
        { id: 'eventBgOpacity', key: 'bgOpacity' },
        { id: 'eventBorderRadius', key: 'borderRadius' },
        { id: 'eventBorderWidth', key: 'borderWidth' },
        { id: 'eventBorderStyle', key: 'borderStyle' },
        { id: 'eventBorderColor', key: 'borderColor' },
        { id: 'eventHighlightColor', key: 'highlightColor' },
        { id: 'eventHighlightDuration', key: 'highlightDurationMs' }
    ]
};

const applySettingsToDOM = (settings, defaults) => {
    Object.entries(SETTINGS_FIELDS).forEach(([section, fields]) => {
        const s = settings[section];
        const d = defaults[section];
        if (!s || !d) return;
        fields.forEach(({ id, key, type }) => {
            const el = document.getElementById(id);
            if (!el) return;
            const val = s[key] !== undefined ? s[key] : d[key];
            if (type === 'bool') el.checked = val;
            else el.value = val;
        });
    });
};

const getSettings = () => {
    const defaults = window.DEFAULT_SETTINGS || { general: {}, chat: {}, events: {} };
    const settings = {};
    Object.entries(SETTINGS_FIELDS).forEach(([section, fields]) => {
        settings[section] = {};
        fields.forEach(({ id, key, type }) => {
            const el = document.getElementById(id);
            const def = defaults[section]?.[key];
            if (!el) { settings[section][key] = def; return; }
            const t = type || (typeof def === 'boolean' ? 'bool' : typeof def === 'number' ? 'int' : 'string');
            if (t === 'bool') {
                settings[section][key] = el.checked;
            } else if (t === 'int') {
                const v = parseInt(el.value, 10);
                settings[section][key] = isNaN(v) ? def : v;
            } else {
                settings[section][key] = el.value || def || '';
            }
        });
    });
    return settings;
};

const syncChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('strixtools_sync') : null;

const saveToLocalStorage = () => {
    const settings = getSettings();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    if (syncChannel) {
        syncChannel.postMessage({ type: 'update', settings });
    }
};

const loadFromLocalStorage = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
        const settings = JSON.parse(saved);
        // migrate legacy theme names
        if (settings.chat?.theme === 'spacepunk') settings.chat.theme = 'powerline';
        applySettingsToDOM(settings, window.DEFAULT_SETTINGS);
    } catch (e) {
        console.error("Failed to load settings from localStorage", e);
    }
};

const updatePreview = () => {
    const settings = getSettings();
    const previewBox = document.getElementById('preview-box');
    if (!previewBox) return;

    window.setEventCSSVariables(previewBox, settings.events);
    const eventCss = window.buildEventCSS(settings.events, '#events-preview');
    const chatCss = window.buildChatCSS(settings.chat);
    const previewCss = `#chat-preview { display: flex; flex-direction: column; justify-content: flex-end; flex-grow: 1; gap: ${settings.chat.messageGap}px; }`;
    window.injectStyles('preview-dynamic-styles', eventCss + '\n' + chatCss + '\n' + previewCss);

    const eventsPreview = document.getElementById('events-preview');
    if (eventsPreview) {
        const eventContainers = eventsPreview.querySelectorAll('.event-container');
        eventContainers.forEach(c => {
            c.style.margin = settings.events.layout === 'vertical' ? `${settings.events.spacing}px 0` : '0';
        });
    }

    const chatPreview = document.getElementById('chat-preview');
    if (chatPreview) {
        const messages = chatPreview.querySelectorAll('.chat-message');
        messages.forEach(msg => {
            let username = msg.getAttribute('data-username');
            let messageText = msg.getAttribute('data-messagetext');
            let userColor = msg.getAttribute('data-usercolor');
            const badgesAttr = msg.getAttribute('data-badges');

            if (!username) {
                const usernameEl = msg.querySelector('.username');
                if (usernameEl) {
                    username = usernameEl.textContent.trim().replace(/:$/, '');
                    msg.setAttribute('data-username', username);
                    userColor = usernameEl.style.color || '#9146FF';
                    msg.setAttribute('data-usercolor', userColor);
                } else {
                    const titleEl = msg.querySelector('.win95-title');
                    if (titleEl) {
                        username = titleEl.textContent.trim();
                        msg.setAttribute('data-username', username);
                    }
                }
            }
            if (!messageText) {
                const textEl = msg.querySelector('.message-text');
                if (textEl) {
                    messageText = textEl.innerHTML;
                    msg.setAttribute('data-messagetext', messageText);
                }
            }

            msg.innerHTML = '';
            msg.style.cssText = '';

            let badgesHTML = '';
            if (settings.chat.showBadges && badgesAttr) {
                const badgeNames = badgesAttr.split(',');
                badgeNames.forEach(badgeName => {
                    const badge = window.MOCK_BADGES[badgeName];
                    if (badge) {
                        const version = Object.keys(badge)[0];
                        if (version && badge[version]) {
                            badgesHTML += `<img class="chat-badge" src="${badge[version].image}" alt="${badgeName}" title="${badgeName}" />`;
                        }
                    }
                });
                if (badgesHTML) {
                    badgesHTML = `<span class="badges-container">${badgesHTML}</span>`;
                }
            }

            const fallbackUrl = 'assets/default-avatar.svg';
            const profilePicHTML = settings.chat.showProfilePics
                ? `<img class="profile-pic" src="${fallbackUrl}" alt="${username}" />`
                : '';

            if (settings.chat.theme === 'windows95') {
                msg.classList.add('theme-windows95');
                msg.classList.remove('theme-powerline');
                msg.innerHTML = `
                    <div class="win95-titlebar">
                        <span class="win95-title">${badgesHTML}${username}</span>
                        <button class="win95-close-btn" aria-label="Close">×</button>
                    </div>
                    <div class="win95-body">
                        ${profilePicHTML}
                        <div class="message-content">
                            <span class="message-text">${messageText}</span>
                        </div>
                    </div>
                `;

                window.applyWindows95Styles(msg, settings);
            } else if (settings.chat.theme === 'powerline') {
                msg.classList.remove('theme-windows95');
                msg.classList.add('theme-powerline');

                const avatarContent = settings.chat.showProfilePics
                    ? `<img class="user-avatar" src="${fallbackUrl}" alt="${username}" />`
                    : '<span class="term-icon">&gt;</span>';

                msg.innerHTML = `
                    <div class="powerline-header">
                        <div class="term-segment avatar-segment">
                            ${avatarContent}${badgesHTML}
                        </div>
                        <div class="term-segment user-segment">
                            <span class="username"><span class="username-text">${username}</span></span>
                            <span class="path-tilde">~</span>
                        </div>
                        <div class="term-segment spacer-segment"></div>
                    </div>
                    <span class="message-text">${messageText}<span class="cursor-blink">_</span></span>
                `;

                const usernameEl = msg.querySelector('.username');
                if (usernameEl && userColor) {
                    usernameEl.style.color = userColor;
                }
                const nameEl = msg.querySelector('.username-text');
                if (nameEl) {
                    nameEl.setAttribute('aria-label', username);
                }
            } else {
                msg.classList.remove('theme-windows95');
                msg.classList.remove('theme-powerline');
                msg.innerHTML = `
                    <img class="profile-pic" src="${fallbackUrl}" alt="${username}" />
                    <div class="message-content">
                        <span class="username">${badgesHTML}${username}:</span>
                        <span class="message-text">${messageText}</span>
                    </div>
                `;

                const usernameEl = msg.querySelector('.username');
                if (usernameEl && userColor) {
                    usernameEl.style.color = userColor;
                }
            }
        });
    }
};

const validateInputs = () => {
    const s = getSettings().general;
    if (!s.twitchChannel || !s.clientId || !s.accessToken) {
        alert("Please fill in the Twitch Channel, Client ID, and Access Token in the General tab before generating a URL.");
        return false;
    }
    return true;
};

const getDiffSettings = (current, defaults) => {
    const diff = {};
    for (const key in current) {
        if (typeof current[key] === 'object' && current[key] !== null) {
            const nestedDiff = getDiffSettings(current[key], defaults[key] || {});
            if (Object.keys(nestedDiff).length > 0) {
                diff[key] = nestedDiff;
            }
        } else if (current[key] !== defaults[key]) {
            diff[key] = current[key];
        }
    }
    return diff;
};

const generateOBSUrl = (type = 'all') => {
    if (!validateInputs()) return;

    try {
        const settings = getSettings();
        const diffSettings = getDiffSettings(settings, window.DEFAULT_SETTINGS);

        diffSettings.general = {
            twitchChannel: settings.general.twitchChannel,
            clientId: settings.general.clientId,
            accessToken: settings.general.accessToken
        };

        const jsonString = JSON.stringify(diffSettings);
        const encodedSettings = btoa(unescape(encodeURIComponent(jsonString)));

        const url = new URL(window.location.href);
        url.pathname = url.pathname.replace('settings.html', 'index.html');
        url.search = '';
        url.searchParams.set('cfg', encodedSettings);
        if (type !== 'all') {
            url.searchParams.set('type', type);
        }
        const finalUrl = url.toString();

        const outputNode = document.getElementById('obsUrlOutput');
        if (outputNode) {
            outputNode.value = finalUrl;
            outputNode.select();
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(finalUrl).then(() => {
                const btn = document.querySelector(`.action-btn[data-action="generateOBSUrl"][data-type="${type}"]`);
                if (btn) {
                    const originalText = btn.innerText;
                    btn.innerText = "Copied to Clipboard!";
                    btn.style.backgroundColor = "#00FF00";
                    btn.style.color = "#000";

                    setTimeout(() => {
                        btn.innerText = originalText;
                        btn.style.backgroundColor = "#ff9900";
                        btn.style.color = "#FFF";
                    }, 2000);
                }
            }).catch(err => {
                console.error('Failed to copy to clipboard', err);
            });
        }
    } catch (e) {
        console.error("Error generating URL:", e);
    }
};

const testChatMessage = () => {
    const chatPreview = document.getElementById('chat-preview');
    if (!chatPreview) return;

    const s = getSettings().chat;
    const testMsgs = ['PogChamp!', 'This overlay is fire!', 'How do I get this?', 'STRIX TOOLS FTW', 'Love the style!'];
    const randomName = TEST_NAMES[Math.floor(Math.random() * TEST_NAMES.length)];
    const randomMsg = testMsgs[Math.floor(Math.random() * testMsgs.length)];
    const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

    const possibleBadges = ['subscriber', 'moderator', 'vip', 'broadcaster'];
    const numBadges = Math.floor(Math.random() * 3);
    const selectedBadges = [];
    for (let i = 0; i < numBadges; i++) {
        const badge = possibleBadges[Math.floor(Math.random() * possibleBadges.length)];
        if (!selectedBadges.includes(badge)) {
            selectedBadges.push(badge);
        }
    }

    const msgEl = document.createElement('div');
    msgEl.classList.add('chat-message');
    if (selectedBadges.length > 0) {
        msgEl.setAttribute('data-badges', selectedBadges.join(','));
    }
    msgEl.innerHTML = `
        <span class="username" style="color: ${randomColor};">${randomName}:</span>
        <span class="message-text">${randomMsg}</span>
    `;

    chatPreview.appendChild(msgEl);
    updatePreview();

    window.scheduleFadeOut(msgEl, s.messageLifetimeMs);

    while (chatPreview.children.length > s.maxMessages) {
        chatPreview.removeChild(chatPreview.firstChild);
    }
};

const testEvent = () => {
    const events = ['follow', 'sub', 'cheer'];
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    const randomName = TEST_NAMES[Math.floor(Math.random() * TEST_NAMES.length)];

    const container = document.getElementById(`preview-${randomEvent}`);
    const valEl = container ? container.querySelector('.value') : null;
    if (!valEl) return;

    const s = getSettings().events;
    valEl.innerText = randomEvent === 'cheer' ? `${randomName} (500 bits)` : randomName;

    if (s.highlightDurationMs > 0) {
        if (eventTimeouts[randomEvent]) {
            clearTimeout(eventTimeouts[randomEvent]);
        }

        valEl.style.transition = 'color 0.3s';
        valEl.style.color = s.highlightColor;

        eventTimeouts[randomEvent] = setTimeout(() => {
            valEl.style.color = '';
            delete eventTimeouts[randomEvent];
        }, s.highlightDurationMs);
    }
};

const openTab = (tabId) => {
    const contents = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-btn');

    contents.forEach(c => c.classList.remove('active'));
    buttons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
        b.setAttribute('tabindex', '-1');
    });

    const targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.classList.add('active');

    buttons.forEach(btn => {
        if (btn.dataset.tab === tabId) {
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            btn.setAttribute('tabindex', '0');
        }
    });
};

const resetToDefaults = () => {
    if (!confirm("Are you sure you want to reset all stylistic settings? Your Twitch credentials will be preserved.")) return;

    applySettingsToDOM(window.DEFAULT_SETTINGS, window.DEFAULT_SETTINGS);
    updatePreview();
    saveToLocalStorage();
};

const initSettings = () => {
    loadFromLocalStorage();
    const onInput = debounce(() => {
        updatePreview();
        saveToLocalStorage();
    }, 100);
    document.querySelectorAll('input, select').forEach(el => {
        if (el.id === 'chatTheme') return;
        el.addEventListener('input', onInput);
    });
    const chatThemeEl = document.getElementById('chatTheme');
    if (chatThemeEl) {
        chatThemeEl.addEventListener('input', function() {
            syncAccentColor();
            updatePreview();
            saveToLocalStorage();
        });
    }

    const tablist = document.querySelector('.tabs');
    if (tablist) {
        tablist.addEventListener('keydown', (e) => {
            if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
            e.preventDefault();
            const buttons = Array.from(tablist.querySelectorAll('.tab-btn'));
            const currentIndex = buttons.findIndex(b => b.getAttribute('aria-selected') === 'true');
            const dir = e.key === 'ArrowRight' ? 1 : -1;
            const nextIndex = (currentIndex + dir + buttons.length) % buttons.length;
            openTab(buttons[nextIndex].dataset.tab);
            buttons[nextIndex].focus();
        });
    }
    document.querySelectorAll('[data-tab]').forEach(btn => {
        btn.addEventListener('click', () => openTab(btn.dataset.tab));
    });
    document.querySelectorAll('[data-action]').forEach(btn => {
        const action = btn.dataset.action;
        const type = btn.dataset.type;
        if (action === 'generateOBSUrl') {
            btn.addEventListener('click', () => generateOBSUrl(type));
        } else if (action === 'testChatMessage') {
            btn.addEventListener('click', testChatMessage);
        } else if (action === 'testEvent') {
            btn.addEventListener('click', testEvent);
        } else if (action === 'resetToDefaults') {
            btn.addEventListener('click', resetToDefaults);
        }
    });

    syncAccentColor();
    updatePreview();
};

window.getSettings = getSettings;
window.syncAccentColor = syncAccentColor;
window.saveToLocalStorage = saveToLocalStorage;
window.loadFromLocalStorage = loadFromLocalStorage;
window.updatePreview = updatePreview;
window.validateInputs = validateInputs;
window.getDiffSettings = getDiffSettings;
window.generateOBSUrl = generateOBSUrl;
window.testChatMessage = testChatMessage;
window.testEvent = testEvent;
window.openTab = openTab;
window.resetToDefaults = resetToDefaults;
window.initSettings = initSettings;

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSettings);
    } else {
        initSettings();
    }
}
