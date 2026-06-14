const DEFAULT_SETTINGS = {
    general: {
        twitchChannel: '',
        clientId: '',
        accessToken: ''
    },
    chat: {
        showBadges: true,
        maxMessages: 15,
        messageLifetimeMs: 20000,
        pillboxBgColor: '#000000',
        pillboxOpacity: 65,
        pillboxRadius: 8,
        pillboxPadding: '8px 12px',
        messageGap: 8,
        userFontFamily: "system-ui, -apple-system, 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        userFontSize: 16,
        userFontWeight: 800,
        userFontStyle: 'normal',
        userTextTransform: 'none',
        userLetterSpacing: 0,
        userShadowColor: '#000000',
        userShadowBlur: 3,
        userShadowOffsetX: 1,
        userShadowOffsetY: 1,
        msgFontFamily: "system-ui, -apple-system, 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
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
    },
    events: {
        fontFamily: "system-ui, -apple-system, 'Montserrat', 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
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
        bgColor: 'transparent',
        bgOpacity: 0,
        borderRadius: 0,
        borderWidth: 0,
        borderStyle: 'solid',
        borderColor: '#ffffff',
        highlightColor: '#00FF00',
        highlightDurationMs: 2000
    }
};

const MOCK_BADGES = {
    broadcaster: {
        '1': {
            image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2Ij48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHJ4PSIyIiBmaWxsPSIjRTkxOTE2Ii8+PHBhdGggZD0iTTMgNWwyLjUgMyAyLjUtNCAyLjUgNCAyLjUtM3Y3SDNWNXoiIGZpbGw9IiNGRkYiLz48L3N2Zz4=',
            title: 'Broadcaster'
        }
    },
    moderator: {
        '1': {
            image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2Ij48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHJ4PSIyIiBmaWxsPSIjMDBBRDAzIi8+PHBhdGggZD0iTTExLjUgMy41YS43LjcgMCAwIDEgMSAxTDYgMTFsLTEuNSAxLjVMMyAxMWwxLjUtMS41IDctN3oiIGZpbGw9IiNGRkYiLz48cGF0aCBkPSJNOCA4bC0yIDJNMTAgNkw4IDgiIHN0cm9rZT0iI0ZGRiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==',
            title: 'Moderator'
        }
    },
    vip: {
        '1': {
            image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2Ij48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHJ4PSIyIiBmaWxsPSIjRTAwNUI5Ii8+PHBhdGggZD0iTTggM2w1IDUtNSA1LTUtNSA1LTV6IiBmaWxsPSIjRkZGIi8+PC9zdmc+',
            title: 'VIP'
        }
    },
    subscriber: {
        '0': {
            image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2Ij48cmVjdCB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHJ4PSIyIiBmaWxsPSIjMDA5OUZGIi8+PHBhdGggZD0iTTggMy41bDEuNSAzIDMuMy41LTIuNCAyLjMuNiAzLjItMy0xLjUtMyAxLjUuNi0zLjItMi40LTIuMyAzLjMtLjVMOCAzLjV6IiBmaWxsPSIjRkZGIi8+PC9zdmc+',
            title: 'Subscriber'
        }
    }
};

window.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
window.MOCK_BADGES = MOCK_BADGES;

