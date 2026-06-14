class EventsModule {
    constructor(config, twitchClient) {
        this.config = config;
        this.twitchClient = twitchClient;
        this.userId = null;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectDelay = 30000;
        this.highlights = new Map();
    }

    async init() {
        console.log("Initializing Events Module...");
        this.applyStyles();
        try {
            this.userId = await this.twitchClient.validateAuth();
            console.log("Auth validated, User ID:", this.userId);
            await this.fetchInitialData();
            this.connect();
        } catch (err) {
            console.error("Events module failed to initialize:", err);
        }
    }

    applyStyles() {
        const root = document.documentElement;
        const s = this.config;
        
        const hexToRgba = (hex, opacityPercentage) => {
            if (!hex || hex === 'transparent') return 'transparent';
            if (hex.length < 7) return 'rgba(0,0,0,0)';
            let r = parseInt(hex.slice(1, 3), 16),
                g = parseInt(hex.slice(3, 5), 16),
                b = parseInt(hex.slice(5, 7), 16),
                a = opacityPercentage / 100;
            return `rgba(${r}, ${g}, ${b}, ${a})`;
        };

        const bgColor = hexToRgba(s.bgColor, s.bgOpacity);
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

        const style = document.createElement('style');
        style.id = 'events-dynamic-styles';
        
        const layoutCss = s.layout === 'horizontal' 
            ? `#events-container { display: flex; flex-direction: row; gap: ${s.spacing}px; }`
            : `#events-container { display: block; } .event-container { margin: ${s.spacing}px 0; }`;

        const orientationCss = s.orientation === 'stacked'
            ? `.event-container { display: flex; flex-direction: column; align-items: flex-start; }`
            : `.event-container { display: flex; flex-direction: row; align-items: center; gap: 8px; }`;

        const labelPosCss = s.labelPosition === 'after'
            ? `.event-container { flex-direction: ${s.orientation === 'stacked' ? 'column-reverse' : 'row-reverse'}; }`
            : '';

        style.innerHTML = `
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

        const existing = document.getElementById('events-dynamic-styles');
        if (existing) existing.remove();
        document.head.appendChild(style);
    }

    async fetchInitialData() {
        const headers = this.twitchClient.getHeaders();
        const userId = this.userId;

        console.log("Fetching initial event data...");

        try {
            const folRes = await fetch(`https://api.twitch.tv/helix/channels/followers?broadcaster_id=${userId}&moderator_id=${userId}`, { headers });
            if (!folRes.ok) {
                const err = await folRes.json();
                console.error("Follower API failed:", err);
            } else {
                const folData = await folRes.json();
                if (folData.data?.length > 0) {
                    console.log("Latest Follower found:", folData.data[0].user_name);
                    this.updateDOM("latest-follow", folData.data[0].user_name, false);
                }
            }
        } catch (err) { console.error("Follower fetch error:", err); }

        try {
            const subRes = await fetch(`https://api.twitch.tv/helix/subscriptions?broadcaster_id=${userId}`, { headers });
            if (!subRes.ok) {
                const err = await subRes.json();
                console.error("Subscription API failed:", err);
            } else {
                const subData = await subRes.json();
                if (subData.data?.length > 0) {
                    const recentSub = subData.data.find(sub => sub.user_id !== userId) || subData.data[0];
                    console.log("Latest Sub found:", recentSub.user_name);
                    this.updateDOM("latest-subscribe", recentSub.user_name, false);
                }
            }
        } catch (err) { console.error("Sub fetch error:", err); }
    }

    connect() {
        console.log("Connecting to Twitch EventSub WebSocket...");
        this.ws = new WebSocket("wss://eventsub.wss.twitch.tv/ws");

        this.ws.onopen = () => {
            console.log("WebSocket connection opened.");
            this.reconnectAttempts = 0;
        };

        this.ws.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            const messageType = message.metadata.message_type;

            if (messageType === "session_welcome") {
                console.log("WebSocket session welcome. Subscribing to events...");
                this.subscribeToEvents(message.payload.session.id);
            } else if (messageType === "notification") {
                this.handleNotification(message.payload);
            }
        };

        this.ws.onclose = () => {
            console.warn("WebSocket connection closed.");
            this.handleReconnect();
        };

        this.ws.onerror = (err) => {
            console.error("WebSocket error:", err);
            this.ws.close();
        };
    }

    handleReconnect() {
        const delay = Math.min(Math.pow(2, this.reconnectAttempts) * 1000, this.maxReconnectDelay);
        console.log(`Attempting reconnect in ${delay / 1000}s...`);
        setTimeout(() => {
            this.reconnectAttempts++;
            this.connect();
        }, delay);
    }

    async subscribeToEvents(sessionId) {
        const events = [
            { type: "channel.follow", version: "2", condition: { broadcaster_user_id: this.userId, moderator_user_id: this.userId } },
            { type: "channel.subscribe", version: "1", condition: { broadcaster_user_id: this.userId } },
            { type: "channel.cheer", version: "1", condition: { broadcaster_user_id: this.userId } }
        ];

        for (const sub of events) {
            try {
                const res = await fetch("https://api.twitch.tv/helix/eventsub/subscriptions", {
                    method: "POST",
                    headers: this.twitchClient.getHeaders(),
                    body: JSON.stringify({
                        type: sub.type,
                        version: sub.version,
                        condition: sub.condition,
                        transport: { method: "websocket", session_id: sessionId }
                    })
                });
                if (!res.ok) {
                    const err = await res.json();
                    console.error(`Subscription failed for ${sub.type}:`, err);
                } else {
                    console.log(`Subscribed to ${sub.type}`);
                }
            } catch (err) {
                console.error(`Error subscribing to ${sub.type}:`, err);
            }
        }
    }

    handleNotification(payload) {
        const eventType = payload.subscription.type;
        const eventData = payload.event;
        console.log("Received event notification:", eventType, eventData);

        if (eventType === "channel.follow" || eventType === "channel.subscribe") {
            const idName = `latest-${eventType.split(".")[1]}`;
            this.updateDOM(idName, eventData.user_name, true);
        } else if (eventType === "channel.cheer") {
            this.updateDOM("latest-cheer", `${eventData.user_name} (${eventData.bits} bits)`, true);
        }
    }

    updateDOM(elementId, text, highlight = true) {
        const container = document.getElementById(elementId);
        const valEl = container ? container.querySelector('.value') : null;
        if (!valEl) return;

        valEl.innerText = text;

        if (highlight && this.config.highlightDurationMs > 0) {
            if (this.highlights.has(elementId)) {
                clearTimeout(this.highlights.get(elementId));
            }

            container.classList.add('highlight-active');
            
            const timeout = setTimeout(() => {
                container.classList.remove('highlight-active');
                this.highlights.delete(elementId);
            }, this.config.highlightDurationMs);

            this.highlights.set(elementId, timeout);
        }
    }
}

window.EventsModule = EventsModule;
