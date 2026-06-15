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

        const showProfilePics = settings.showProfilePics;

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
                display: ${showProfilePics ? 'flex' : 'block'};
                align-items: center;
                gap: 10px;
            }
            .profile-pic {
                width: ${settings.profilePicSize}px;
                height: ${settings.profilePicSize}px;
                border-radius: ${settings.profilePicRadius}%;
                flex-shrink: 0;
                object-fit: cover;
                display: ${showProfilePics ? 'block' : 'none'};
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

            /* Windows 95 Theme */
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
        `;
        
        const existing = document.getElementById('chat-dynamic-styles');
        if (existing) existing.remove();
        document.head.appendChild(dynamicStyles);
    }

    async fetchUserProfilePic(userId) {
        if (!this.profilePicsCache) {
            this.profilePicsCache = {};
            this.pendingUserFetches = [];
            this.pendingUserResolvers = {};
            this.fetchTimeout = null;
        }

        if (this.profilePicsCache[userId]) {
            return this.profilePicsCache[userId];
        }

        return new Promise((resolve) => {
            if (!this.pendingUserResolvers[userId]) {
                this.pendingUserResolvers[userId] = [];
            }
            this.pendingUserResolvers[userId].push(resolve);

            if (!this.pendingUserFetches.includes(userId)) {
                this.pendingUserFetches.push(userId);
            }

            if (this.fetchTimeout) {
                clearTimeout(this.fetchTimeout);
            }

            this.fetchTimeout = setTimeout(() => {
                this.processPendingUserFetches();
            }, 50);
        });
    }

    async processPendingUserFetches() {
        const userIds = [...this.pendingUserFetches];
        this.pendingUserFetches = [];

        if (userIds.length === 0) return;

        const chunks = [];
        for (let i = 0; i < userIds.length; i += 100) {
            chunks.push(userIds.slice(i, i + 100));
        }

        for (const chunk of chunks) {
            try {
                const query = chunk.map(id => `id=${encodeURIComponent(id)}`).join('&');
                const url = `https://api.twitch.tv/helix/users?${query}`;
                
                const res = await fetch(url, {
                    headers: this.twitchClient.getHeaders()
                });

                if (!res.ok) {
                    throw new Error(`Twitch API error: ${res.statusText}`);
                }

                const data = await res.json();
                const fetchedIds = new Set();

                if (data.data) {
                    for (const user of data.data) {
                        const id = user.id;
                        const profileUrl = user.profile_image_url;
                        this.profilePicsCache[id] = profileUrl;
                        fetchedIds.add(id);

                        const resolvers = this.pendingUserResolvers[id];
                        if (resolvers) {
                            resolvers.forEach(resolve => resolve(profileUrl));
                            delete this.pendingUserResolvers[id];
                        }
                    }
                }

                for (const id of chunk) {
                    if (!fetchedIds.has(id)) {
                        const resolvers = this.pendingUserResolvers[id];
                        if (resolvers) {
                            resolvers.forEach(resolve => resolve('assets/default-avatar.png'));
                            delete this.pendingUserResolvers[id];
                        }
                    }
                }
            } catch (err) {
                console.error("Error batch fetching profile pictures:", err);
                for (const id of chunk) {
                    const resolvers = this.pendingUserResolvers[id];
                    if (resolvers) {
                        resolvers.forEach(resolve => resolve('assets/default-avatar.png'));
                        delete this.pendingUserResolvers[id];
                    }
                }
            }
        }
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

        const fallbackUrl = 'assets/default-avatar.png';
        const profilePicHTML = this.config.showProfilePics
            ? `<img class="profile-pic" src="${fallbackUrl}" alt="${displayName}" />`
            : '';

        if (this.config.theme === 'windows95') {
            messageElement.classList.add('theme-windows95');
            messageElement.innerHTML = `
                <div class="win95-titlebar">
                    <span class="win95-title">${badgesHTML}${displayName}</span>
                    <button class="win95-close-btn" aria-label="Close">×</button>
                </div>
                <div class="win95-body">
                    ${profilePicHTML}
                    <div class="message-content">
                        <span class="message-text">${contentHTML}</span>
                    </div>
                </div>
            `;
        } else {
            messageElement.classList.remove('theme-windows95');
            messageElement.innerHTML = `
                <img class="profile-pic" src="${fallbackUrl}" alt="${displayName}" />
                <div class="message-content">
                    <span class="username">${badgesHTML}${displayName}:</span>
                    <span class="message-text">${contentHTML}</span>
                </div>
            `;
            const usernameElement = messageElement.querySelector('.username');
            if (usernameElement) {
                usernameElement.style.color = userColor;
            }
        }

        this.container.appendChild(messageElement);

        if (this.config.showProfilePics && this.twitchClient && this.twitchClient.clientId && this.twitchClient.accessToken) {
            const picImg = messageElement.querySelector('.profile-pic');
            const userId = tags['user-id'];
            if (userId && picImg) {
                this.fetchUserProfilePic(userId).then(url => {
                    if (url) {
                        picImg.src = url;
                    }
                }).catch(err => {
                    console.error("Failed to fetch profile picture for user", userId, err);
                });
            }
        }

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
