function hexToRgba(hex, opacityPercentage) {
    if (!hex) return 'rgba(0,0,0,1)';
    let r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16),
        a = opacityPercentage / 100;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

const getSettings = () => {
    const getValue = (id, defaultValue = '') => document.getElementById(id)?.value || defaultValue;
    const getInt = (id, defaultValue = 0) => parseInt(document.getElementById(id)?.value) || defaultValue;

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
            pillboxBorder: getValue('pillboxBorder', 'none'),
            messageGap: getInt('messageGap', 8),
            userFontFamily: getValue('userFontFamily', "'Helvetica Neue', Helvetica, Arial, sans-serif"),
            userFontSize: getInt('userFontSize', 16),
            userFontWeight: getValue('userFontWeight', '800'),
            userFontStyle: getValue('userFontStyle', 'normal'),
            userShadowColor: getValue('userShadowColor', '#000000'),
            userShadowBlur: getInt('userShadowBlur', 2),
            msgFontFamily: getValue('msgFontFamily', "'Helvetica Neue', Helvetica, Arial, sans-serif"),
            msgColor: getValue('msgColor', '#f8f8f8'),
            msgFontSize: getInt('msgFontSize', 16),
            msgFontWeight: getValue('msgFontWeight', '400'),
            msgShadowColor: getValue('msgShadowColor', '#000000'),
            msgShadowBlur: getInt('msgShadowBlur', 2)
        },
        events: {
            fontFamily: getValue('eventFontFamily', "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"),
            fontSize: getInt('eventFontSize', 24),
            fontWeight: getValue('eventFontWeight', '800'),
            fontStyle: getValue('eventFontStyle', 'normal'),
            textColor: getValue('eventTextColor', '#ffffff'),
            labelColor: getValue('eventLabelColor', '#ff9900'),
            layout: getValue('eventLayout', 'vertical'),
            spacing: getInt('eventSpacing', 12)
        }
    };
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

        const labels = eventsPreview.querySelectorAll('.label');
        labels.forEach(l => l.style.color = settings.events.labelColor);

        if (settings.events.layout === 'horizontal') {
            eventsPreview.style.display = 'flex';
            eventsPreview.style.gap = settings.events.spacing + 'px';
        } else {
            eventsPreview.style.display = 'block';
        }

        const eventContainers = eventsPreview.querySelectorAll('.event-container');
        eventContainers.forEach(c => {
            c.style.margin = settings.events.layout === 'vertical' ? `${settings.events.spacing}px 0` : '0';
        });
    }

    const chatPreview = document.getElementById('chat-preview');
    if (chatPreview) {
        chatPreview.style.display = 'flex';
        chatPreview.style.flexDirection = 'column';
        chatPreview.style.gap = settings.chat.messageGap + 'px';

        const bgColorWithOpacity = hexToRgba(settings.chat.pillboxBgColor, settings.chat.pillboxOpacity);
        const messages = chatPreview.querySelectorAll('.chat-message');
        messages.forEach(msg => {
            msg.style.backgroundColor = bgColorWithOpacity;
            msg.style.borderRadius = settings.chat.pillboxRadius + 'px';
            msg.style.padding = settings.chat.pillboxPadding;
            msg.style.border = settings.chat.pillboxBorder;
        });

        const usernames = chatPreview.querySelectorAll('.username');
        usernames.forEach(u => {
            u.style.fontFamily = settings.chat.userFontFamily;
            u.style.fontSize = settings.chat.userFontSize + 'px';
            u.style.fontWeight = settings.chat.userFontWeight;
            u.style.fontStyle = settings.chat.userFontStyle;
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

const generateOBSUrl = () => {
    try {
        const settings = getSettings();
        const jsonString = JSON.stringify(settings);
        const encodedSettings = btoa(encodeURIComponent(jsonString));

        const currentPath = window.location.href;
        const targetPath = currentPath.replace('settings.html', 'index.html');
        const finalUrl = `${targetPath}?cfg=${encodedSettings}`;

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

window.openTab = openTab;
window.generateOBSUrl = generateOBSUrl;

const initSettings = () => {
    document.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('input', updatePreview);
    });
    updatePreview();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSettings);
} else {
    initSettings();
}
