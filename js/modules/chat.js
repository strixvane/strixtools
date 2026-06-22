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

        if (window.MOCK_BADGES) {
            this.badgesMap = JSON.parse(JSON.stringify(window.MOCK_BADGES));
        } else {
            this.badgesMap = {};
        }

        if (!this.twitchClient || !this.twitchClient.clientId || !this.twitchClient.accessToken) {
            console.warn("Twitch credentials not set. Using local fallback badges.");
            return;
        }

        const channelName = this.config.twitchChannel;
        if (!channelName) return;

        window.statusManager?.show('Loading badges...', 'loading');

        const maxRetries = 3;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const channelUserId = await this.twitchClient.getChannelUserId(channelName);
                if (!channelUserId) return;

                const globalData = await this.twitchClient.getGlobalBadges();
                if (globalData && globalData.data) {
                    this.parseBadges(globalData.data);
                }

                const channelData = await this.twitchClient.getChannelBadges(channelUserId);
                if (channelData && channelData.data) {
                    this.parseBadges(channelData.data);
                }

                console.log("Twitch badges loaded successfully.");
                window.statusManager?.show('Badges loaded', 'success', 3000);
                return;
            } catch (err) {
                console.error(`Failed to load Twitch badges (attempt ${attempt}/${maxRetries}):`, err);
                if (attempt < maxRetries) {
                    const delay = Math.pow(2, attempt) * 1000;
                    window.statusManager?.show(`Badge retry in ${delay / 1000}s...`, 'warning');
                    await new Promise(r => setTimeout(r, delay));
                } else {
                    window.statusManager?.show('Badge load failed. Check settings.', 'error');
                }
            }
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
        const chatCss = window.buildChatCSS(settings);
        const containerCss = `#chat-container { display: flex; flex-direction: column; gap: ${settings.messageGap}px; }`;
        window.injectStyles('chat-dynamic-styles', containerCss + '\n' + chatCss);
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
                            resolvers.forEach(resolve => resolve('assets/default-avatar.svg'));
                            delete this.pendingUserResolvers[id];
                        }
                    }
                }
            } catch (err) {
                console.error("Error batch fetching profile pictures:", err);
                for (const id of chunk) {
                    const resolvers = this.pendingUserResolvers[id];
                    if (resolvers) {
                        resolvers.forEach(resolve => resolve('assets/default-avatar.svg'));
                        delete this.pendingUserResolvers[id];
                    }
                }
            }
        }
    }

    async handleMessage(_channel, tags, message, _self) {
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

        const fallbackUrl = 'assets/default-avatar.svg';
        const profilePicHTML = this.config.showProfilePics
            ? `<img class="profile-pic" src="${fallbackUrl}" alt="${displayName}" />`
            : '';

        const isWin95 = this.config.theme === 'windows95';
        const isPowerline = this.config.theme === 'powerline';

        messageElement.classList.toggle('theme-windows95', isWin95);
        messageElement.classList.toggle('theme-powerline', isPowerline);

        if (isWin95) {
            messageElement.innerHTML = `
                <div class="win95-titlebar">
                    <span class="win95-title">${badgesHTML}<span class="username-text"></span></span>
                    <button class="win95-close-btn" aria-label="Close">×</button>
                </div>
                <div class="win95-body">
                    ${profilePicHTML}
                    <div class="message-content">
                        <span class="message-text">${contentHTML}</span>
                    </div>
                </div>
            `;
            const titleEl = messageElement.querySelector('.win95-title .username-text');
            if (titleEl) titleEl.textContent = displayName;
        } else if (isPowerline) {
            const avatarContent = this.config.showProfilePics
                ? `<img class="user-avatar" src="${fallbackUrl}" alt="${displayName}" />`
                : '<span class="term-icon">&gt;</span>';
            messageElement.innerHTML = `
                <div class="powerline-header">
                    <div class="term-segment avatar-segment">
                        ${avatarContent}${badgesHTML}
                    </div>
                    <div class="term-segment user-segment">
                        <span class="username"><span class="username-text"></span></span>
                        <span class="path-tilde">~</span>
                    </div>
                    <div class="term-segment spacer-segment"></div>
                </div>
                <span class="message-text">${contentHTML}<span class="cursor-blink">_</span></span>
            `;
            const usernameElement = messageElement.querySelector('.username');
            if (usernameElement) {
                usernameElement.style.color = userColor;
                const nameEl = usernameElement.querySelector('.username-text');
                if (nameEl) {
                    nameEl.textContent = displayName;
                    nameEl.setAttribute('aria-label', displayName);
                }
            }
        } else {
            messageElement.innerHTML = `
                <img class="profile-pic" src="${fallbackUrl}" alt="${displayName}" />
                <div class="message-content">
                    <span class="username">${badgesHTML}<span class="username-text"></span>:</span>
                    <span class="message-text">${contentHTML}</span>
                </div>
            `;
            const usernameElement = messageElement.querySelector('.username');
            if (usernameElement) {
                usernameElement.style.color = userColor;
                const nameEl = usernameElement.querySelector('.username-text');
                if (nameEl) {
                    nameEl.textContent = displayName;
                }
            }
        }

        this.container.appendChild(messageElement);

        if (this.config.showProfilePics && this.twitchClient && this.twitchClient.clientId && this.twitchClient.accessToken) {
            const avatarSelector = isPowerline ? '.user-avatar' : '.profile-pic';
            const picImg = messageElement.querySelector(avatarSelector);
            const userId = tags['user-id'];
            if (userId && picImg) {
                this.fetchUserProfilePic(userId).then(url => {
                    if (url) {
                        picImg.src = url;
                    }
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

function applyWindows95Styles(msg, settings) {
    msg.style.backgroundColor = '#c0c0c0';
    msg.style.borderRadius = '0px';
    msg.style.padding = '2px';
    msg.style.border = '2px solid';
    msg.style.borderColor = '#ffffff #808080 #808080 #ffffff';
    msg.style.display = 'flex';
    msg.style.flexDirection = 'column';
    msg.style.alignItems = 'stretch';
    msg.style.gap = '0px';

    const titlebar = msg.querySelector('.win95-titlebar');
    const title = msg.querySelector('.win95-title');
    const closeBtn = msg.querySelector('.win95-close-btn');
    const win95Body = msg.querySelector('.win95-body');
    const pic = msg.querySelector('.profile-pic');
    const msgText = msg.querySelector('.message-text');

    if (titlebar) {
        titlebar.style.display = 'flex';
        titlebar.style.alignItems = 'center';
        titlebar.style.justifyContent = 'space-between';
        titlebar.style.backgroundColor = '#000080';
        titlebar.style.color = '#ffffff';
        titlebar.style.padding = '3px 4px';
        titlebar.style.marginBottom = '2px';
    }
    if (title) {
        title.style.fontFamily = '"MS Sans Serif", Tahoma, Geneva, sans-serif';
        title.style.fontSize = '11px';
        title.style.fontWeight = 'bold';
        title.style.color = '#ffffff';
        title.style.textShadow = 'none';
        title.style.textTransform = 'none';
        title.style.letterSpacing = '0px';
    }
    if (closeBtn) {
        closeBtn.style.fontFamily = '"MS Sans Serif", Tahoma, Geneva, sans-serif';
        closeBtn.style.fontSize = '9px';
        closeBtn.style.fontWeight = 'bold';
        closeBtn.style.width = '16px';
        closeBtn.style.height = '14px';
        closeBtn.style.backgroundColor = '#c0c0c0';
        closeBtn.style.color = '#000000';
        closeBtn.style.border = '1px solid';
        closeBtn.style.borderColor = '#ffffff #5a5a5a #5a5a5a #ffffff';
        closeBtn.style.display = 'flex';
        closeBtn.style.alignItems = 'center';
        closeBtn.style.justifyContent = 'center';
        closeBtn.style.padding = '0';
        closeBtn.style.margin = '0';
    }
    if (win95Body) {
        win95Body.style.backgroundColor = '#ffffff';
        win95Body.style.border = '2px solid';
        win95Body.style.borderColor = '#808080 #ffffff #ffffff #808080';
        win95Body.style.padding = '6px 8px';
        win95Body.style.color = '#000000';
        win95Body.style.display = 'flex';
        win95Body.style.alignItems = 'center';
        win95Body.style.gap = '8px';
    }
    if (pic) {
        pic.style.width = settings.chat.profilePicSize + 'px';
        pic.style.height = settings.chat.profilePicSize + 'px';
        pic.style.borderRadius = '0px';
        pic.style.border = '1px solid #808080';
        pic.style.flexShrink = '0';
        pic.style.objectFit = 'cover';
        pic.style.display = settings.chat.showProfilePics ? 'block' : 'none';
    }
    if (msgText) {
        msgText.style.fontFamily = '"MS Sans Serif", Tahoma, Geneva, sans-serif';
        msgText.style.color = '#000000';
        msgText.style.textShadow = 'none';
        msgText.style.fontSize = '12px';
        msgText.style.fontWeight = 'normal';
        msgText.style.fontStyle = 'normal';
        msgText.style.letterSpacing = '0px';
    }
}

window.ChatModule = ChatModule;
window.applyWindows95Styles = applyWindows95Styles;
