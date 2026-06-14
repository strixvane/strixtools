class ChatModule {
    constructor(config, twitchClient) {
        this.config = config;
        this.twitchClient = twitchClient;
        this.container = null;
        this.client = null;
        this.badgesMap = {};
    }

    init(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.applyStyles();
        this.loadBadges();
        
        if (this.config.twitchChannel && window.tmi) {
            this.client = new window.tmi.Client({
                channels: [this.config.twitchChannel]
            });

            this.client.connect().catch(console.error);
            this.client.on('message', this.handleMessage.bind(this));
        }
    }

    async loadBadges() {
        if (!this.config.showBadges) {
            this.badgesMap = {};
            return;
        }

        // Initialize with default fallback mock badges
        if (window.MOCK_BADGES) {
            this.badgesMap = JSON.parse(JSON.stringify(window.MOCK_BADGES));
        } else {
            this.badgesMap = {};
        }

        if (!this.twitchClient || !this.twitchClient.clientId || !this.twitchClient.accessToken) {
            console.warn("Twitch credentials not set. Using local fallback badges.");
            return;
        }

        try {
            const channelName = this.config.twitchChannel;
            if (!channelName) return;

            const channelUserId = await this.twitchClient.getChannelUserId(channelName);
            if (!channelUserId) return;

            // Fetch global badges
            const globalData = await this.twitchClient.getGlobalBadges();
            if (globalData && globalData.data) {
                this.parseBadges(globalData.data);
            }

            // Fetch channel-specific badges
            const channelData = await this.twitchClient.getChannelBadges(channelUserId);
            if (channelData && channelData.data) {
                this.parseBadges(channelData.data);
            }

            console.log("Twitch badges loaded successfully.");
        } catch (err) {
            console.error("Failed to load Twitch badges:", err);
        }
    }

    parseBadges(badgeSets) {
        for (const set of badgeSets) {
            this.badgesMap[set.set_id] = this.badgesMap[set.set_id] || {};
            for (const version of set.versions) {
                this.badgesMap[set.set_id][version.id] = {
                    image: version.image_url_1x,
                    title: version.title
                };
            }
        }
    }

    getBadgeUrl(badgeName, badgeVersion) {
        if (this.badgesMap[badgeName]) {
            if (this.badgesMap[badgeName][badgeVersion]) {
                return this.badgesMap[badgeName][badgeVersion].image;
            }
            // Fallback to any version of the badge that we have
            const versions = Object.keys(this.badgesMap[badgeName]);
            if (versions.length > 0) {
                const fallbackVersion = versions.includes('0') ? '0' : (versions.includes('1') ? '1' : versions[0]);
                return this.badgesMap[badgeName][fallbackVersion].image;
            }
        }
        return null;
    }

    applyStyles() {
        const settings = this.config;
        const hexToRgba = (hex, opacityPercentage) => {
            if (!hex || hex.length < 7) return 'rgba(0,0,0,1)';
            let r = parseInt(hex.slice(1, 3), 16),
                g = parseInt(hex.slice(3, 5), 16),
                b = parseInt(hex.slice(5, 7), 16),
                a = opacityPercentage / 100;
            return `rgba(${r}, ${g}, ${b}, ${a})`;
        };

        const bgColorWithOpacity = hexToRgba(settings.pillboxBgColor, settings.pillboxOpacity);
        const dynamicStyles = document.createElement('style');
        dynamicStyles.id = 'chat-dynamic-styles';

        const border = settings.borderWidth > 0 
            ? `${settings.borderWidth}px ${settings.borderStyle} ${settings.borderColor}` 
            : 'none';

        dynamicStyles.innerHTML = `
            #chat-container { 
                display: flex;
                flex-direction: column;
                gap: ${settings.messageGap}px; 
            }
            .chat-message {
                background-color: ${bgColorWithOpacity};
                border-radius: ${settings.pillboxRadius}px;
                padding: ${settings.pillboxPadding};
                border: ${border};
                margin-bottom: 0;
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
        `;
        
        const existing = document.getElementById('chat-dynamic-styles');
        if (existing) existing.remove();
        document.head.appendChild(dynamicStyles);
    }

    async handleMessage(channel, tags, message, self) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message');

        const userColor = tags['color'] || '#9146FF';
        const displayName = tags['display-name'] || tags['username'];

        let contentHTML = message;
        if (window.parseEmotes) {
            const parsedEmotes = await window.parseEmotes(message, tags.emotes, {
                channelId: tags['room-id']
            });
            contentHTML = parsedEmotes.toHTML();
        }

        let badgesHTML = '';
        if (this.config.showBadges && tags.badges) {
            for (const [badgeName, badgeVersion] of Object.entries(tags.badges)) {
                const badgeUrl = this.getBadgeUrl(badgeName, badgeVersion);
                if (badgeUrl) {
                    badgesHTML += `<img class="chat-badge" src="${badgeUrl}" alt="${badgeName}" title="${badgeName}" />`;
                }
            }
            if (badgesHTML) {
                badgesHTML = `<span class="badges-container">${badgesHTML}</span>`;
            }
        }

        messageElement.innerHTML = `
            <span class="username">${badgesHTML}${displayName}:</span>
            <span class="message-text">${contentHTML}</span>
        `;

        const usernameElement = messageElement.querySelector('.username');
        usernameElement.style.color = userColor;

        this.container.appendChild(messageElement);

        while (this.container.children.length > this.config.maxMessages) {
            this.container.removeChild(this.container.firstChild);
        }

        if (this.config.messageLifetimeMs > 0) {
            setTimeout(() => {
                messageElement.classList.add('fade-out');
                messageElement.addEventListener('animationend', () => {
                    if (messageElement.parentNode) {
                        messageElement.parentNode.removeChild(messageElement);
                    }
                });
            }, this.config.messageLifetimeMs);
        }
    }
}

window.ChatModule = ChatModule;
