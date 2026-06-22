function buildChatCSS(settings) {
    const bg = window.hexToRgba(settings.pillboxBgColor, settings.pillboxOpacity);
    const border = settings.borderWidth > 0
        ? `${settings.borderWidth}px ${settings.borderStyle} ${settings.borderColor}`
        : 'none';
    const showPics = settings.showProfilePics;

    return `
.chat-message {
    background-color: ${bg};
    border-radius: ${settings.pillboxRadius}px;
    padding: ${settings.pillboxPadding};
    border: ${border};
    margin-bottom: 0;
    display: ${showPics ? 'flex' : 'block'};
    align-items: center;
    gap: 10px;
}
.profile-pic {
    width: ${settings.profilePicSize}px;
    height: ${settings.profilePicSize}px;
    border-radius: ${settings.profilePicRadius}%;
    flex-shrink: 0;
    object-fit: cover;
    display: ${showPics ? 'block' : 'none'};
}
.message-content {
    flex-grow: 1;
    word-break: break-word;
}
.username {
    font-family: ${settings.userFontFamily};
    font-size: ${settings.userFontSize}px;
    font-weight: ${settings.userFontWeight};
    font-style: ${settings.userFontStyle};
    text-transform: ${settings.userTextTransform};
    letter-spacing: ${settings.userLetterSpacing}px;
    text-shadow: ${settings.userShadowOffsetX || 1}px ${settings.userShadowOffsetY || 1}px ${settings.userShadowBlur}px ${settings.userShadowColor};
}
.message-text {
    font-family: ${settings.msgFontFamily};
    color: ${settings.msgColor};
    font-size: ${settings.msgFontSize}px;
    font-weight: ${settings.msgFontWeight};
    font-style: ${settings.msgFontStyle};
    letter-spacing: ${settings.msgLetterSpacing}px;
    text-shadow: ${settings.msgShadowOffsetX || 1}px ${settings.msgShadowOffsetY || 1}px ${settings.msgShadowBlur}px ${settings.msgShadowColor};
}
.chat-badge {
    display: inline-block;
    vertical-align: middle;
    height: 1em;
    width: 1em;
    margin-right: 0.2em;
    border-radius: 2px;
}
.chat-badge:last-child {
    margin-right: 0;
}
.badges-container {
    display: inline-flex;
    align-items: center;
    margin-right: 0.3em;
}
.fade-out {
    animation: fadeOut 0.5s forwards;
}
@keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
}
.chat-message.theme-windows95 {
    background-color: #c0c0c0 !important;
    border-radius: 0px !important;
    border: 2px solid !important;
    border-color: #ffffff #808080 #808080 #ffffff !important;
    padding: 2px !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 0px !important;
    box-shadow: none !important;
    margin-bottom: 0px;
}
.win95-titlebar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #000080;
    color: #ffffff;
    padding: 3px 4px;
    margin-bottom: 2px;
    user-select: none;
}
.win95-title {
    font-family: "MS Sans Serif", Tahoma, Geneva, sans-serif;
    font-size: 11px;
    font-weight: bold;
    color: #ffffff !important;
    text-shadow: none !important;
    text-transform: none !important;
    letter-spacing: 0px !important;
    display: flex;
    align-items: center;
    gap: 4px;
}
.win95-close-btn {
    font-family: "MS Sans Serif", Tahoma, Geneva, sans-serif;
    font-size: 9px;
    font-weight: bold;
    width: 16px;
    height: 14px;
    background-color: #c0c0c0;
    color: #000000;
    border: 1px solid;
    border-color: #ffffff #5a5a5a #5a5a5a #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    margin: 0;
    cursor: pointer;
}
.win95-close-btn:active {
    border-color: #5a5a5a #ffffff #ffffff #5a5a5a;
    padding: 1px 0 0 1px;
}
.win95-body {
    background-color: #ffffff;
    border: 2px solid;
    border-color: #808080 #ffffff #ffffff #808080;
    padding: 6px 8px;
    color: #000000;
    display: flex;
    align-items: center;
    gap: 8px;
}
.theme-windows95 .profile-pic {
    border-radius: 0px !important;
    border: 1px solid #808080 !important;
}
.theme-windows95 .message-text {
    font-family: "MS Sans Serif", Tahoma, Geneva, sans-serif !important;
    color: #000000 !important;
    text-shadow: none !important;
    font-size: 12px !important;
    font-weight: normal !important;
    font-style: normal !important;
    letter-spacing: 0px !important;
}
.chat-message.theme-powerline {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    background-color: transparent;
    border: none;
    border-radius: 0 !important;
    padding: 0;
    box-shadow: 0 0 8px ${settings.accentColor}, inset 0 0 2px rgba(0,0,0,0.4);
}
.theme-powerline .powerline-header {
    display: flex;
    align-items: stretch;
}
.theme-powerline .term-segment {
    position: relative;
    display: flex;
    align-items: center;
    height: 32px;
    padding: 4px 12px 4px 16px;
    flex-shrink: 0;
}
.theme-powerline .avatar-segment {
    background-color: ${settings.accentColor};
    padding-left: 8px;
    z-index: 3;
    gap: 4px;
}
.theme-powerline .avatar-segment::after {
    content: '';
    position: absolute;
    right: -16px;
    top: 0;
    width: 16px;
    height: 100%;
    background-color: ${settings.accentColor};
    clip-path: polygon(0 0, 100% 50%, 0 100%);
}
.theme-powerline .user-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    flex-shrink: 0;
    object-fit: cover;
}
.theme-powerline .term-icon {
    color: #ffffff;
    font-weight: bold;
    font-size: 16px;
    line-height: 1;
}
.theme-powerline .avatar-segment .badges-container {
    display: inline-flex;
    align-items: center;
    gap: 2px;
}
.theme-powerline .avatar-segment .chat-badge {
    height: 16px;
    width: 16px;
    border-radius: 2px;
    vertical-align: middle;
}
.theme-powerline .user-segment {
    background-color: #303030;
    padding-left: 24px;
    z-index: 2;
}
.theme-powerline .user-segment::after {
    content: '';
    position: absolute;
    right: -16px;
    top: 0;
    width: 16px;
    height: 100%;
    background-color: #303030;
    clip-path: polygon(0 0, 100% 0, 0 100%);
}
.theme-powerline .spacer-segment {
    background-color: rgba(48, 48, 48, 0.90);
    z-index: 1;
    flex: 1;
    min-width: 0;
}
.theme-powerline .username {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    text-transform: uppercase;
    text-shadow:
        0 0 4px rgba(0,0,0,0.9);
    letter-spacing: 1px;
}
.theme-powerline .path-tilde {
    color: ${settings.accentColor};
    font-weight: bold;
    font-size: 16px;
    margin-left: 6px;
}
.theme-powerline .message-text {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    color: #ffffff;
    background-color: rgba(48, 48, 48, 0.90);
    padding: 8px 12px;
    border-radius: 0 0 4px 4px;
    word-break: break-word;
}
.theme-powerline .cursor-blink {
    animation: terminalBlink 1s step-end infinite;
}
@keyframes terminalBlink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
}
`;
}

function buildEventCSS(settings, containerSelector) {
    const sel = containerSelector || '#events-container';
    const layoutCss = settings.layout === 'horizontal'
        ? `${sel} { display: flex; flex-direction: row; gap: ${settings.spacing}px; }`
        : `${sel} { display: block; } .event-container { margin: ${settings.spacing}px 0; }`;

    const orientationCss = settings.orientation === 'stacked'
        ? `.event-container { display: flex; flex-direction: column; align-items: flex-start; }`
        : `.event-container { display: flex; flex-direction: row; align-items: center; gap: 8px; }`;

    const labelPosCss = settings.labelPosition === 'after'
        ? `.event-container { flex-direction: ${settings.orientation === 'stacked' ? 'column-reverse' : 'row-reverse'}; }`
        : '';

    return `
${layoutCss}
${orientationCss}
${labelPosCss}
.event-container {
    padding: var(--event-padding);
    background-color: var(--event-bg-color);
    border: var(--event-border);
    border-radius: var(--event-border-radius);
    transition: color 0.3s ease;
}
.event-container .value, .event-container .label {
    font-family: var(--event-font-family);
    font-size: var(--event-font-size);
    font-weight: var(--event-font-weight);
    font-style: var(--event-font-style);
    text-decoration: var(--event-text-decoration);
    text-transform: var(--event-text-transform);
    letter-spacing: var(--event-kerning);
    text-shadow: var(--event-text-shadow);
}
.event-container .label { color: var(--event-label-color); }
.event-container .value { color: var(--event-text-color); }
.highlight-active .value {
    color: var(--event-highlight-color) !important;
}
`;
}

function setEventCSSVariables(root, settings) {
    const s = settings;
    const bgColor = window.hexToRgba(s.bgColor, s.bgOpacity);
    const border = s.borderWidth > 0 ? `${s.borderWidth}px ${s.borderStyle} ${s.borderColor}` : 'none';

    root.style.setProperty('--event-font-family', s.fontFamily);
    root.style.setProperty('--event-font-size', s.fontSize + 'px');
    root.style.setProperty('--event-font-weight', s.fontWeight);
    root.style.setProperty('--event-font-style', s.fontStyle);
    root.style.setProperty('--event-text-decoration', s.textDecoration);
    root.style.setProperty('--event-text-transform', s.textTransform || 'none');
    root.style.setProperty('--event-kerning', s.kerning + 'px');
    root.style.setProperty('--event-text-color', s.textColor);
    root.style.setProperty('--event-label-color', s.labelColor);
    root.style.setProperty('--event-text-shadow', `${s.shadowX}px ${s.shadowY}px ${s.shadowBlur}px ${s.shadowColor}`);
    root.style.setProperty('--event-padding', typeof s.padding === 'number' ? s.padding + 'px' : (s.padding || '5px 10px'));
    root.style.setProperty('--event-bg-color', bgColor);
    root.style.setProperty('--event-border', border);
    root.style.setProperty('--event-border-radius', s.borderRadius + 'px');
    root.style.setProperty('--event-highlight-color', s.highlightColor);
}

function injectStyles(id, css) {
    const existing = document.getElementById(id);
    if (existing) existing.remove();
    const style = document.createElement('style');
    style.id = id;
    style.textContent = css;
    document.head.appendChild(style);
}

window.buildChatCSS = buildChatCSS;
window.buildEventCSS = buildEventCSS;
window.setEventCSSVariables = setEventCSSVariables;
window.injectStyles = injectStyles;
