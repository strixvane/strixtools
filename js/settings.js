
function hexToRgba(hex, opacityPercentage) {
    if (!hex || hex === 'transparent') return 'transparent';
    if (hex.length < 7) return 'rgba(0,0,0,1)';
    let r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16),
        a = opacityPercentage / 100;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

const STORAGE_KEY = 'strixTools_settings';
const TEST_NAMES = ["ChristheClown_", "Celest_VT_", "Popcorb_", "xxstargazorxx", "finojalapeno", "omnomagonvt", "SpecterJesterVT", "Onihiko_VT", "Neoeva122"];
const eventTimeouts = {};

const getSettings = () => {
    const getValue = (id, defaultValue = '') => document.getElementById(id)?.value || defaultValue;
    const getInt = (id, defaultValue = 0) => {
        const val = parseInt(document.getElementById(id)?.value);
        return isNaN(val) ? defaultValue : val;
    };
    const getBool = (id, defaultValue = false) => {
        const el = document.getElementById(id);
        return el ? el.checked : defaultValue;
    };

    const defaults = window.DEFAULT_SETTINGS || { general: {}, chat: {}, events: {} };

    return {
        general: {
            twitchChannel: getValue('twitchChannel', defaults.general.twitchChannel),
            clientId: getValue('clientId', defaults.general.clientId),
            accessToken: getValue('accessToken', defaults.general.accessToken)
        },
        chat: {
            showBadges: getBool('showBadges', defaults.chat.showBadges),
            maxMessages: getInt('maxMessages', defaults.chat.maxMessages),
            messageLifetimeMs: getInt('messageLifetime', defaults.chat.messageLifetimeMs),
            pillboxBgColor: getValue('pillboxBgColor', defaults.chat.pillboxBgColor),
            pillboxOpacity: getInt('pillboxOpacity', defaults.chat.pillboxOpacity),
            pillboxRadius: getInt('pillboxRadius', defaults.chat.pillboxRadius),
            pillboxPadding: getValue('pillboxPadding', defaults.chat.pillboxPadding),
            messageGap: getInt('messageGap', defaults.chat.messageGap),
            userFontFamily: getValue('userFontFamily', defaults.chat.userFontFamily),
            userFontSize: getInt('userFontSize', defaults.chat.userFontSize),
            userFontWeight: getValue('userFontWeight', defaults.chat.userFontWeight),
            userFontStyle: getValue('userFontStyle', defaults.chat.userFontStyle),
            userTextTransform: getValue('userTextTransform', defaults.chat.userTextTransform),
            userLetterSpacing: getInt('userLetterSpacing', defaults.chat.userLetterSpacing),
            userShadowColor: getValue('userShadowColor', defaults.chat.userShadowColor),
            userShadowBlur: getInt('userShadowBlur', defaults.chat.userShadowBlur),
            userShadowOffsetX: getInt('userShadowOffsetX', defaults.chat.userShadowOffsetX),
            userShadowOffsetY: getInt('userShadowOffsetY', defaults.chat.userShadowOffsetY),
            msgFontFamily: getValue('msgFontFamily', defaults.chat.msgFontFamily),
            msgColor: getValue('msgColor', defaults.chat.msgColor),
            msgFontSize: getInt('msgFontSize', defaults.chat.msgFontSize),
            msgFontWeight: getValue('msgFontWeight', defaults.chat.msgFontWeight),
            msgFontStyle: getValue('msgFontStyle', defaults.chat.msgFontStyle),
            msgLetterSpacing: getInt('msgLetterSpacing', defaults.chat.msgLetterSpacing),
            msgShadowColor: getValue('msgShadowColor', defaults.chat.msgShadowColor),
            msgShadowBlur: getInt('msgShadowBlur', defaults.chat.msgShadowBlur),
            msgShadowOffsetX: getInt('msgShadowOffsetX', defaults.chat.msgShadowOffsetX),
            msgShadowOffsetY: getInt('msgShadowOffsetY', defaults.chat.msgShadowOffsetY),
            borderWidth: getInt('chatBorderWidth', defaults.chat.borderWidth),
            borderStyle: getValue('chatBorderStyle', defaults.chat.borderStyle),
            borderColor: getValue('chatBorderColor', defaults.chat.borderColor)
        },
        events: {
            fontFamily: getValue('eventFontFamily', defaults.events.fontFamily),
            fontSize: getInt('eventFontSize', defaults.events.fontSize),
            fontWeight: getValue('eventFontWeight', defaults.events.fontWeight),
            fontStyle: getValue('eventFontStyle', defaults.events.fontStyle),
            textDecoration: getValue('eventTextDecoration', defaults.events.textDecoration),
            textTransform: getValue('eventTextTransform', defaults.events.textTransform),
            kerning: getInt('eventKerning', defaults.events.kerning),
            textColor: getValue('eventTextColor', defaults.events.textColor),
            labelColor: getValue('eventLabelColor', defaults.events.labelColor),
            shadowColor: getValue('eventShadowColor', defaults.events.shadowColor),
            shadowX: getInt('eventShadowX', defaults.events.shadowX),
            shadowY: getInt('eventShadowY', defaults.events.shadowY),
            shadowBlur: getInt('eventShadowBlur', defaults.events.shadowBlur),
            layout: getValue('eventLayout', defaults.events.layout),
            spacing: getInt('eventSpacing', defaults.events.spacing),
            padding: getValue('eventPadding', defaults.events.padding),
            orientation: getValue('eventOrientation', defaults.events.orientation),
            labelPosition: getValue('eventLabelPosition', defaults.events.labelPosition),
            bgColor: getValue('eventBgColor', defaults.events.bgColor),
            bgOpacity: getInt('eventBgOpacity', defaults.events.bgOpacity),
            borderRadius: getInt('eventBorderRadius', defaults.events.borderRadius),
            borderWidth: getInt('eventBorderWidth', defaults.events.borderWidth),
            borderStyle: getValue('eventBorderStyle', defaults.events.borderStyle),
            borderColor: getValue('eventBorderColor', defaults.events.borderColor),
            highlightColor: getValue('eventHighlightColor', defaults.events.highlightColor),
            highlightDurationMs: getInt('eventHighlightDuration', defaults.events.highlightDurationMs)
        }
    };
};

const syncChannel = new BroadcastChannel('strixtools_sync');

const saveToLocalStorage = () => {
    const settings = getSettings();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    syncChannel.postMessage({ type: 'update', settings });
};

const loadFromLocalStorage = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
        const settings = JSON.parse(saved);
        const defaults = window.DEFAULT_SETTINGS;

        const setVal = (id, val, defaultVal) => {
            const el = document.getElementById(id);
            if (el) el.value = (val !== undefined) ? val : defaultVal;
        };
        const setBool = (id, val, defaultVal) => {
            const el = document.getElementById(id);
            if (el) el.checked = (val !== undefined) ? val : defaultVal;
        };

        if (settings.general) {
            setVal('twitchChannel', settings.general.twitchChannel, defaults.general.twitchChannel);
            setVal('clientId', settings.general.clientId, defaults.general.clientId);
            setVal('accessToken', settings.general.accessToken, defaults.general.accessToken);
        }

        if (settings.chat) {
            const c = settings.chat;
            const d = defaults.chat;
            setBool('showBadges', c.showBadges, d.showBadges);
            setVal('maxMessages', c.maxMessages, d.maxMessages);
            setVal('messageLifetime', c.messageLifetimeMs, d.messageLifetimeMs);
            setVal('pillboxBgColor', c.pillboxBgColor, d.pillboxBgColor);
            setVal('pillboxOpacity', c.pillboxOpacity, d.pillboxOpacity);
            setVal('pillboxRadius', c.pillboxRadius, d.pillboxRadius);
            setVal('pillboxPadding', c.pillboxPadding, d.pillboxPadding);
            setVal('messageGap', c.messageGap, d.messageGap);
            setVal('userFontFamily', c.userFontFamily, d.userFontFamily);
            setVal('userFontSize', c.userFontSize, d.userFontSize);
            setVal('userFontWeight', c.userFontWeight, d.userFontWeight);
            setVal('userFontStyle', c.userFontStyle, d.userFontStyle);
            setVal('userTextTransform', c.userTextTransform, d.userTextTransform);
            setVal('userLetterSpacing', c.userLetterSpacing, d.userLetterSpacing);
            setVal('userShadowColor', c.userShadowColor, d.userShadowColor);
            setVal('userShadowBlur', c.userShadowBlur, d.userShadowBlur);
            setVal('userShadowOffsetX', c.userShadowOffsetX, d.userShadowOffsetX);
            setVal('userShadowOffsetY', c.userShadowOffsetY, d.userShadowOffsetY);
            setVal('msgFontFamily', c.msgFontFamily, d.msgFontFamily);
            setVal('msgColor', c.msgColor, d.msgColor);
            setVal('msgFontSize', c.msgFontSize, d.msgFontSize);
            setVal('msgFontWeight', c.msgFontWeight, d.msgFontWeight);
            setVal('msgFontStyle', c.msgFontStyle, d.msgFontStyle);
            setVal('msgLetterSpacing', c.msgLetterSpacing, d.msgLetterSpacing);
            setVal('msgShadowColor', c.msgShadowColor, d.msgShadowColor);
            setVal('msgShadowBlur', c.msgShadowBlur, d.msgShadowBlur);
            setVal('msgShadowOffsetX', c.msgShadowOffsetX, d.msgShadowOffsetX);
            setVal('msgShadowOffsetY', c.msgShadowOffsetY, d.msgShadowOffsetY);
            setVal('chatBorderWidth', c.borderWidth, d.borderWidth);
            setVal('chatBorderStyle', c.borderStyle, d.borderStyle);
            setVal('chatBorderColor', c.borderColor, d.borderColor);
        }

        if (settings.events) {
            const e = settings.events;
            const d = defaults.events;
            setVal('eventFontFamily', e.fontFamily, d.fontFamily);
            setVal('eventFontSize', e.fontSize, d.fontSize);
            setVal('eventFontWeight', e.fontWeight, d.fontWeight);
            setVal('eventFontStyle', e.fontStyle, d.fontStyle);
            setVal('eventTextTransform', e.textTransform, d.textTransform);
            setVal('eventKerning', e.kerning, d.kerning);
            setVal('eventTextColor', e.textColor, d.textColor);
            setVal('eventLabelColor', e.labelColor, d.labelColor);
            setVal('eventShadowColor', e.shadowColor, d.shadowColor);
            setVal('eventShadowX', e.shadowX, d.shadowX);
            setVal('eventShadowY', e.shadowY, d.shadowY);
            setVal('eventShadowBlur', e.shadowBlur, d.shadowBlur);
            setVal('eventLayout', e.layout, d.layout);
            setVal('eventSpacing', e.spacing, d.spacing);
            setVal('eventPadding', e.padding, d.padding);
            setVal('eventOrientation', e.orientation, d.orientation);
            setVal('eventLabelPosition', e.labelPosition, d.labelPosition);
            setVal('eventBgColor', e.bgColor, d.bgColor);
            setVal('eventBgOpacity', e.bgOpacity, d.bgOpacity);
            setVal('eventBorderRadius', e.borderRadius, d.borderRadius);
            setVal('eventBorderWidth', e.borderWidth, d.borderWidth);
            setVal('eventBorderStyle', e.borderStyle, d.borderStyle);
            setVal('eventBorderColor', e.borderColor, d.borderColor);
            setVal('eventHighlightColor', e.highlightColor, d.highlightColor);
            setVal('eventHighlightDuration', e.highlightDurationMs, d.highlightDurationMs);
        }
    } catch (e) {
        console.error("Failed to load settings from localStorage", e);
    }
};

const updatePreview = () => {
    const settings = getSettings();
    const previewBox = document.getElementById('preview-box');
    if (!previewBox) return;

    const eventsPreview = document.getElementById('events-preview');
    if (eventsPreview) {
        eventsPreview.style.fontFamily = settings.events.fontFamily;
        eventsPreview.style.fontSize = settings.events.fontSize + 'px';
        eventsPreview.style.fontWeight = settings.events.fontWeight;
        eventsPreview.style.fontStyle = settings.events.fontStyle;
        eventsPreview.style.color = settings.events.textColor;
        eventsPreview.style.textTransform = settings.events.textTransform;
        eventsPreview.style.textDecoration = settings.events.textDecoration;
        eventsPreview.style.letterSpacing = settings.events.kerning + 'px';
        eventsPreview.style.textShadow = `${settings.events.shadowX}px ${settings.events.shadowY}px ${settings.events.shadowBlur}px ${settings.events.shadowColor}`;

        const labels = eventsPreview.querySelectorAll('.label');
        labels.forEach(l => l.style.color = settings.events.labelColor);

        if (settings.events.layout === 'horizontal') {
            eventsPreview.style.display = 'flex';
            eventsPreview.style.gap = settings.events.spacing + 'px';
        } else {
            eventsPreview.style.display = 'block';
        }

        const eventContainers = eventsPreview.querySelectorAll('.event-container');
        const bgColor = hexToRgba(settings.events.bgColor, settings.events.bgOpacity);
        const border = settings.events.borderWidth > 0
            ? `${settings.events.borderWidth}px ${settings.events.borderStyle} ${settings.events.borderColor}`
            : 'none';

        eventContainers.forEach(c => {
            c.style.margin = settings.events.layout === 'vertical' ? `${settings.events.spacing}px 0` : '0';
            c.style.backgroundColor = bgColor;
            c.style.border = border;
            c.style.borderRadius = settings.events.borderRadius + 'px';
            c.style.padding = settings.events.padding;

            if (settings.events.orientation === 'stacked') {
                c.style.display = 'flex';
                c.style.flexDirection = 'column';
                c.style.alignItems = 'flex-start';
            } else {
                c.style.display = 'flex';
                c.style.flexDirection = 'row';
                c.style.alignItems = 'center';
                c.style.gap = '8px';
            }

            if (settings.events.labelPosition === 'after') {
                c.style.flexDirection = settings.events.orientation === 'stacked' ? 'column-reverse' : 'row-reverse';
            }
        });
    }

    const chatPreview = document.getElementById('chat-preview');
    if (chatPreview) {
        chatPreview.style.display = 'flex';
        chatPreview.style.flexDirection = 'column';
        chatPreview.style.justifyContent = 'flex-end';
        chatPreview.style.flexGrow = '1';
        chatPreview.style.gap = settings.chat.messageGap + 'px';

        const bgColorWithOpacity = hexToRgba(settings.chat.pillboxBgColor, settings.chat.pillboxOpacity);
        const border = settings.chat.borderWidth > 0
            ? `${settings.chat.borderWidth}px ${settings.chat.borderStyle} ${settings.chat.borderColor}`
            : 'none';

        const messages = chatPreview.querySelectorAll('.chat-message');
        messages.forEach(msg => {
            msg.style.backgroundColor = bgColorWithOpacity;
            msg.style.borderRadius = settings.chat.pillboxRadius + 'px';
            msg.style.padding = settings.chat.pillboxPadding;
            msg.style.border = border;

            const usernameEl = msg.querySelector('.username');
            if (usernameEl) {
                let badgesContainer = usernameEl.querySelector('.badges-container');
                if (!badgesContainer) {
                    badgesContainer = document.createElement('span');
                    badgesContainer.classList.add('badges-container');
                    usernameEl.prepend(badgesContainer);
                }

                if (settings.chat.showBadges) {
                    const badgesAttr = msg.getAttribute('data-badges');
                    if (badgesAttr) {
                        const badgeNames = badgesAttr.split(',');
                        let badgesHTML = '';
                        badgeNames.forEach(badgeName => {
                            const badge = window.MOCK_BADGES[badgeName];
                            if (badge) {
                                const version = Object.keys(badge)[0];
                                if (version && badge[version]) {
                                    badgesHTML += `<img class="chat-badge" src="${badge[version].image}" alt="${badgeName}" title="${badgeName}" />`;
                                }
                            }
                        });
                        badgesContainer.innerHTML = badgesHTML;
                        badgesContainer.style.display = '';
                    } else {
                        badgesContainer.innerHTML = '';
                        badgesContainer.style.display = 'none';
                    }
                } else {
                    badgesContainer.style.display = 'none';
                }
            }
        });

        const badges = chatPreview.querySelectorAll('.chat-badge');
        badges.forEach(b => {
            b.style.display = 'inline-block';
            b.style.verticalAlign = 'middle';
            b.style.height = '1em';
            b.style.width = '1em';
            b.style.marginRight = '0.2em';
            b.style.borderRadius = '2px';
        });

        const badgeContainers = chatPreview.querySelectorAll('.badges-container');
        badgeContainers.forEach(bc => {
            bc.style.display = settings.chat.showBadges ? 'inline-flex' : 'none';
            bc.style.alignItems = 'center';
            bc.style.marginRight = '0.3em';
        });

        const usernames = chatPreview.querySelectorAll('.username');
        usernames.forEach(u => {
            u.style.fontFamily = settings.chat.userFontFamily;
            u.style.fontSize = settings.chat.userFontSize + 'px';
            u.style.fontWeight = settings.chat.userFontWeight;
            u.style.fontStyle = settings.chat.userFontStyle;
            u.style.textTransform = settings.chat.userTextTransform;
            u.style.letterSpacing = settings.chat.userLetterSpacing + 'px';
            u.style.textShadow = `${settings.chat.userShadowOffsetX || 1}px ${settings.chat.userShadowOffsetY || 1}px ${settings.chat.userShadowBlur}px ${settings.chat.userShadowColor}`;
        });

        const msgTexts = chatPreview.querySelectorAll('.message-text');
        msgTexts.forEach(t => {
            t.style.fontFamily = settings.chat.msgFontFamily;
            t.style.color = settings.chat.msgColor;
            t.style.fontSize = settings.chat.msgFontSize + 'px';
            t.style.fontWeight = settings.chat.msgFontWeight;
            t.style.fontStyle = settings.chat.msgFontStyle;
            t.style.letterSpacing = settings.chat.msgLetterSpacing + 'px';
            t.style.textShadow = `${settings.chat.msgShadowOffsetX || 1}px ${settings.chat.msgShadowOffsetY || 1}px ${settings.chat.msgShadowBlur}px ${settings.chat.msgShadowColor}`;
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

        const currentPath = window.location.href;
        const targetPath = currentPath.replace('settings.html', 'index.html');
        let finalUrl = `${targetPath}?cfg=${encodedSettings}`;

        if (type !== 'all') {
            finalUrl += `&type=${type}`;
        }

        const outputNode = document.getElementById('obsUrlOutput');
        if (outputNode) {
            outputNode.value = finalUrl;
            outputNode.select();
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(finalUrl).then(() => {
                const btn = document.querySelector(`.action-btn[onclick*="'${type}'"]`);
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
    const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);

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

    if (s.messageLifetimeMs > 0) {
        setTimeout(() => {
            msgEl.style.transition = 'opacity 0.5s';
            msgEl.style.opacity = '0';
            setTimeout(() => msgEl.remove(), 500);
        }, s.messageLifetimeMs);
    }

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
    buttons.forEach(b => b.classList.remove('active'));

    const targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.classList.add('active');

    buttons.forEach(btn => {
        if (btn.getAttribute('onclick')?.includes(tabId)) {
            btn.classList.add('active');
        }
    });
};

const resetToDefaults = () => {
    if (!confirm("Are you sure you want to reset all stylistic settings? Your Twitch credentials will be preserved.")) return;

    const defaults = window.DEFAULT_SETTINGS;

    const c = defaults.chat;
    document.getElementById('showBadges').checked = c.showBadges;
    document.getElementById('maxMessages').value = c.maxMessages;
    document.getElementById('messageLifetime').value = c.messageLifetimeMs;
    document.getElementById('pillboxBgColor').value = c.pillboxBgColor;
    document.getElementById('pillboxOpacity').value = c.pillboxOpacity;
    document.getElementById('pillboxRadius').value = c.pillboxRadius;
    document.getElementById('pillboxPadding').value = c.pillboxPadding;
    document.getElementById('messageGap').value = c.messageGap;
    document.getElementById('userFontFamily').value = c.userFontFamily;
    document.getElementById('userFontSize').value = c.userFontSize;
    document.getElementById('userFontWeight').value = c.userFontWeight;
    document.getElementById('userFontStyle').value = c.userFontStyle;
    document.getElementById('userTextTransform').value = c.userTextTransform;
    document.getElementById('userLetterSpacing').value = c.userLetterSpacing;
    document.getElementById('userShadowColor').value = c.userShadowColor;
    document.getElementById('userShadowBlur').value = c.userShadowBlur;
    document.getElementById('userShadowOffsetX').value = c.userShadowOffsetX;
    document.getElementById('userShadowOffsetY').value = c.userShadowOffsetY;
    document.getElementById('msgFontFamily').value = c.msgFontFamily;
    document.getElementById('msgColor').value = c.msgColor;
    document.getElementById('msgFontSize').value = c.msgFontSize;
    document.getElementById('msgFontWeight').value = c.msgFontWeight;
    document.getElementById('msgFontStyle').value = c.msgFontStyle;
    document.getElementById('msgLetterSpacing').value = c.msgLetterSpacing;
    document.getElementById('msgShadowColor').value = c.msgShadowColor;
    document.getElementById('msgShadowBlur').value = c.msgShadowBlur;
    document.getElementById('msgShadowOffsetX').value = c.msgShadowOffsetX;
    document.getElementById('msgShadowOffsetY').value = c.msgShadowOffsetY;
    document.getElementById('chatBorderWidth').value = c.borderWidth;
    document.getElementById('chatBorderStyle').value = c.borderStyle;
    document.getElementById('chatBorderColor').value = c.borderColor;

    const e = defaults.events;
    document.getElementById('eventFontFamily').value = e.fontFamily;
    document.getElementById('eventFontSize').value = e.fontSize;
    document.getElementById('eventFontWeight').value = e.fontWeight;
    document.getElementById('eventFontStyle').value = e.fontStyle;
    document.getElementById('eventTextTransform').value = e.textTransform;
    document.getElementById('eventTextDecoration').value = e.textDecoration;
    document.getElementById('eventKerning').value = e.kerning;
    document.getElementById('eventTextColor').value = e.textColor;
    document.getElementById('eventLabelColor').value = e.labelColor;
    document.getElementById('eventShadowColor').value = e.shadowColor;
    document.getElementById('eventShadowX').value = e.shadowX;
    document.getElementById('eventShadowY').value = e.shadowY;
    document.getElementById('eventShadowBlur').value = e.shadowBlur;
    document.getElementById('eventLayout').value = e.layout;
    document.getElementById('eventSpacing').value = e.spacing;
    document.getElementById('eventOrientation').value = e.orientation;
    document.getElementById('eventLabelPosition').value = e.labelPosition;
    document.getElementById('eventBgColor').value = e.bgColor;
    document.getElementById('eventBgOpacity').value = e.bgOpacity;
    document.getElementById('eventBorderRadius').value = e.borderRadius;
    document.getElementById('eventBorderWidth').value = e.borderWidth;
    document.getElementById('eventBorderStyle').value = e.borderStyle;
    document.getElementById('eventBorderColor').value = e.borderColor;
    document.getElementById('eventHighlightColor').value = e.highlightColor;
    document.getElementById('eventHighlightDuration').value = e.highlightDurationMs;

    updatePreview();
    saveToLocalStorage();
};

window.openTab = openTab;
window.generateOBSUrl = generateOBSUrl;
window.testChatMessage = testChatMessage;
window.testEvent = testEvent;
window.resetToDefaults = resetToDefaults;

const initSettings = () => {
    loadFromLocalStorage();
    document.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('input', () => {
            updatePreview();
            saveToLocalStorage();
        });
        el.addEventListener('change', () => {
            updatePreview();
            saveToLocalStorage();
        });
    });
    updatePreview();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSettings);
} else {
    initSettings();
}
