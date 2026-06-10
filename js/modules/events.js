class EventsModule {
    constructor(config, twitchClient) {
        this.config = config;
        this.twitchClient = twitchClient;
        this.userId = null;
    }

    async init() {
        this.applyStyles();
        this.userId = await this.twitchClient.validateAuth();
        this.fetchInitialData();
        this.initWebSocket();
    }

    applyStyles() {
        const root = document.documentElement;
        const s = this.config;
        
        root.style.setProperty('--event-font-family', s.fontFamily);
        root.style.setProperty('--event-font-size', s.fontSize + 'px');
        root.style.setProperty('--event-font-weight', s.fontWeight);
        root.style.setProperty('--event-font-style', s.fontStyle);
        root.style.setProperty('--event-text-decoration', s.textDecoration);
        root.style.setProperty('--event-kerning', s.kerning + 'px');
        root.style.setProperty('--event-text-color', s.textColor);
        root.style.setProperty('--event-label-color', s.labelColor);
        root.style.setProperty('--event-text-shadow', `${s.shadowX}px ${s.shadowY}px ${s.shadowBlur}px ${s.shadowColor}`);
        root.style.setProperty('--event-padding', s.padding + 'px');

        const style = document.createElement('style');
        
        if (s.layout === 'horizontal') {
            style.innerHTML += `
                #events-container { display: flex; flex-direction: row; gap: ${s.spacing}px; }
                .event-container { margin: 0; padding: var(--event-padding); }
            `;
        } else {
            style.innerHTML += `
                #events-container { display: block; }
                .event-container { margin: ${s.spacing}px 0; padding: var(--event-padding); }
            `;
        }

        if (s.orientation === 'stacked') {
            style.innerHTML += `
                .event-container { display: flex; flex-direction: column; align-items: flex-start; }
            `;
        } else {
            style.innerHTML += `
                .event-container { display: flex; flex-direction: row; align-items: center; gap: 8px; }
            `;
        }

        if (s.labelPosition === 'after') {
            style.innerHTML += `
                .event-container { flex-direction: ${s.orientation === 'stacked' ? 'column-reverse' : 'row-reverse'}; }
                .event-container .label { margin-left: 5px; margin-right: 0; }
            `;
        }

        document.head.appendChild(style);
    }

    async fetchInitialData() {
        const headers = this.twitchClient.getHeaders();
        const userId = this.userId;

        try {
            const folRes = await fetch(`https://api.twitch.tv/helix/channels/followers?broadcaster_id=${userId}`, { headers });
            const folData = await folRes.json();
            if (folData.data?.length > 0) this.updateDOM("latest-follow", folData.data[0].user_name);
        } catch (err) { console.error("Follower fetch error", err); }

        try {
            const subRes = await fetch(`https://api.twitch.tv/helix/subscriptions?broadcaster_id=${userId}`, { headers });
            const subData = await subRes.json();
            if (subData.data?.length > 0) {
                const recentSub = subData.data.find(sub => sub.user_id !== userId) || subData.data[0];
                this.updateDOM("latest-subscribe", recentSub.user_name);
            }
        } catch (err) { console.error("Sub fetch error", err); }
    }

    initWebSocket() {
        const ws = new WebSocket("wss://eventsub.wss.twitch.tv/ws");
        ws.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            const messageType = message.metadata.message_type;

            if (messageType === "session_welcome") {
                this.subscribeToEvents(message.payload.session.id);
            } else if (messageType === "notification") {
                this.handleNotification(message.payload);
            }
        };
        ws.onerror = (err) => console.error("WebSocket error:", err);
    }

    async subscribeToEvents(sessionId) {
        const events = [
            { type: "channel.follow", version: "2", condition: { broadcaster_user_id: this.userId, moderator_user_id: this.userId } },
            { type: "channel.subscribe", version: "1", condition: { broadcaster_user_id: this.userId } },
            { type: "channel.cheer", version: "1", condition: { broadcaster_user_id: this.userId } }
        ];

        for (const sub of events) {
            await fetch("https://api.twitch.tv/helix/eventsub/subscriptions", {
                method: "POST",
                headers: this.twitchClient.getHeaders(),
                body: JSON.stringify({
                    type: sub.type,
                    version: sub.version,
                    condition: sub.condition,
                    transport: { method: "websocket", session_id: sessionId }
                })
            });
        }
    }

    handleNotification(payload) {
        const eventType = payload.subscription.type;
        const eventData = payload.event;

        if (eventType === "channel.follow" || eventType === "channel.subscribe") {
            const idName = `latest-${eventType.split(".")[1]}`;
            this.updateDOM(idName, eventData.user_name);
        } else if (eventType === "channel.cheer") {
            this.updateDOM("latest-cheer", `${eventData.user_name} (${eventData.bits} bits)`);
        }
    }

    updateDOM(elementId, text) {
        const el = document.querySelector(`#${elementId} .value`);
        if (el) el.innerText = text;
    }
}

window.EventsModule = EventsModule;
