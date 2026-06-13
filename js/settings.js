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

    return {
        general: {
            twitchChannel: getValue('twitchChannel'),
            clientId: getValue('clientId'),
            accessToken: getValue('accessToken')
        },
        chat: {
            maxMessages: getInt('maxMessages', 15),
            messageLifetimeMs: getInt('messageLifetime', 20000),
            pillboxBgColor: getValue('pillboxBgColor', '#000000'),
            pillboxOpacity: getInt('pillboxOpacity', 65),
            pillboxRadius: getInt('pillboxRadius', 8),
            pillboxPadding: getValue('pillboxPadding', '8px 12px'),
            messageGap: getInt('messageGap', 8),
            userFontFamily: getValue('userFontFamily', "system-ui, -apple-system, 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"),
            userFontSize: getInt('userFontSize', 16),
            userFontWeight: getValue('userFontWeight', '800'),
            userFontStyle: getValue('userFontStyle', 'normal'),
            userTextTransform: getValue('userTextTransform', 'none'),
            userShadowColor: getValue('userShadowColor', '#000000'),
            userShadowBlur: getInt('userShadowBlur', 3),
            msgFontFamily: getValue('msgFontFamily', "system-ui, -apple-system, 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"),
            msgColor: getValue('msgColor', '#f8f8f8'),
            msgFontSize: getInt('msgFontSize', 16),
            msgFontWeight: getValue('msgFontWeight', '500'),
            msgShadowColor: getValue('msgShadowColor', '#000000'),
            msgShadowBlur: getInt('msgShadowBlur', 2),
            borderWidth: getInt('chatBorderWidth', 0),
            borderStyle: getValue('chatBorderStyle', 'solid'),
            borderColor: getValue('chatBorderColor', '#ffffff')
        },
        events: {
            fontFamily: getValue('eventFontFamily', "system-ui, -apple-system, 'Montserrat', 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"),
            fontSize: getInt('eventFontSize', 20),
            fontWeight: getValue('eventFontWeight', '800'),
            fontStyle: getValue('eventFontStyle', 'normal'),
            textDecoration: getValue('eventTextDecoration', 'none'),
            textTransform: getValue('eventTextTransform', 'uppercase'),
            textColor: getValue('eventTextColor', '#ffffff'),
            labelColor: getValue('eventLabelColor', '#ff9900'),
            layout: getValue('eventLayout', 'vertical'),
            spacing: getInt('eventSpacing', 12),
            orientation: getValue('eventOrientation', 'horizontal'),
            labelPosition: getValue('eventLabelPosition', 'before'),
            bgColor: getValue('eventBgColor', 'transparent'),
            bgOpacity: getInt('eventBgOpacity', 0),
            borderRadius: getInt('eventBorderRadius', 0),
            borderWidth: getInt('eventBorderWidth', 0),
            borderStyle: getValue('eventBorderStyle', 'solid'),
            borderColor: getValue('eventBorderColor', '#ffffff'),
            highlightColor: getValue('eventHighlightColor', '#00FF00'),
            highlightDurationMs: getInt('eventHighlightDuration', 2000)
        }
    };
};

const saveToLocalStorage = () => {
    const settings = getSettings();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

const loadFromLocalStorage = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
        const settings = JSON.parse(saved);
        
        if (settings.general) {
            document.getElementById('twitchChannel').value = settings.general.twitchChannel || '';
            document.getElementById('clientId').value = settings.general.clientId || '';
            document.getElementById('accessToken').value = settings.general.accessToken || '';
        }

        if (settings.chat) {
            const c = settings.chat;
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
            document.getElementById('userTextTransform').value = c.userTextTransform || 'none';
            document.getElementById('userShadowColor').value = c.userShadowColor;
            document.getElementById('userShadowBlur').value = c.userShadowBlur;
            document.getElementById('msgFontFamily').value = c.msgFontFamily;
            document.getElementById('msgColor').value = c.msgColor;
            document.getElementById('msgFontSize').value = c.msgFontSize;
            document.getElementById('msgFontWeight').value = c.msgFontWeight;
            document.getElementById('msgShadowColor').value = c.msgShadowColor;
            document.getElementById('msgShadowBlur').value = c.msgShadowBlur;
            document.getElementById('chatBorderWidth').value = c.borderWidth || 0;
            document.getElementById('chatBorderStyle').value = c.borderStyle || 'solid';
            document.getElementById('chatBorderColor').value = c.borderColor || '#ffffff';
        }

        if (settings.events) {
            const e = settings.events;
            document.getElementById('eventFontFamily').value = e.fontFamily;
            document.getElementById('eventFontSize').value = e.fontSize;
            document.getElementById('eventFontWeight').value = e.fontWeight;
            document.getElementById('eventFontStyle').value = e.fontStyle;
            document.getElementById('eventTextTransform').value = e.textTransform || 'none';
            document.getElementById('eventTextColor').value = e.textColor;
            document.getElementById('eventLabelColor').value = e.labelColor;
            document.getElementById('eventLayout').value = e.layout;
            document.getElementById('eventSpacing').value = e.spacing;
            document.getElementById('eventOrientation').value = e.orientation;
            document.getElementById('eventLabelPosition').value = e.labelPosition;
            document.getElementById('eventBgColor').value = e.bgColor || 'transparent';
            document.getElementById('eventBgOpacity').value = e.bgOpacity || 0;
            document.getElementById('eventBorderRadius').value = e.borderRadius || 0;
            document.getElementById('eventBorderWidth').value = e.borderWidth || 0;
            document.getElementById('eventBorderStyle').value = e.borderStyle || 'solid';
            document.getElementById('eventBorderColor').value = e.borderColor || '#ffffff';
            document.getElementById('eventHighlightColor').value = e.highlightColor || '#00FF00';
            document.getElementById('eventHighlightDuration').value = e.highlightDurationMs || 2000;
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
        });

        const usernames = chatPreview.querySelectorAll('.username');
        usernames.forEach(u => {
            u.style.fontFamily = settings.chat.userFontFamily;
            u.style.fontSize = settings.chat.userFontSize + 'px';
            u.style.fontWeight = settings.chat.userFontWeight;
            u.style.fontStyle = settings.chat.userFontStyle;
            u.style.textTransform = settings.chat.userTextTransform;
            u.style.textShadow = `1px 1px ${settings.chat.userShadowBlur}px ${settings.chat.userShadowColor}`;
        });

        const msgTexts = chatPreview.querySelectorAll('.message-text');
        msgTexts.forEach(t => {
            t.style.fontFamily = settings.chat.msgFontFamily;
            t.style.color = settings.chat.msgColor;
            t.style.fontSize = settings.chat.msgFontSize + 'px';
            t.style.fontWeight = settings.chat.msgFontWeight;
            t.style.textShadow = `1px 1px ${settings.chat.msgShadowBlur}px ${settings.chat.msgShadowColor}`;
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

const generateOBSUrl = (type = 'all') => {
    if (!validateInputs()) return;

    try {
        const settings = getSettings();
        const jsonString = JSON.stringify(settings);
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
                const btn = document.querySelector('.action-btn');
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
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);

    const msgEl = document.createElement('div');
    msgEl.classList.add('chat-message');
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
            valEl.style.color = s.textColor;
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
    
    // Reset Chat Inputs
    const c = defaults.chat;
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
    document.getElementById('userShadowColor').value = c.userShadowColor;
    document.getElementById('userShadowBlur').value = c.userShadowBlur;
    document.getElementById('msgFontFamily').value = c.msgFontFamily;
    document.getElementById('msgColor').value = c.msgColor;
    document.getElementById('msgFontSize').value = c.msgFontSize;
    document.getElementById('msgFontWeight').value = c.msgFontWeight;
    document.getElementById('msgShadowColor').value = c.msgShadowColor;
    document.getElementById('msgShadowBlur').value = c.msgShadowBlur;
    document.getElementById('chatBorderWidth').value = c.borderWidth;
    document.getElementById('chatBorderStyle').value = c.borderStyle;
    document.getElementById('chatBorderColor').value = c.borderColor;

    // Reset Event Inputs
    const e = defaults.events;
    document.getElementById('eventFontFamily').value = e.fontFamily;
    document.getElementById('eventFontSize').value = e.fontSize;
    document.getElementById('eventFontWeight').value = e.fontWeight;
    document.getElementById('eventFontStyle').value = e.fontStyle;
    document.getElementById('eventTextTransform').value = e.textTransform;
    document.getElementById('eventTextColor').value = e.textColor;
    document.getElementById('eventLabelColor').value = e.labelColor;
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
    });
    updatePreview();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSettings);
} else {
    initSettings();
}
