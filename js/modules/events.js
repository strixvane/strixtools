class EventsModule {
    constructor(config, twitchClient) {
        this.config = config;
        this.twitchClient = twitchClient;
        this.userId = null;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectDelay = 30000;
        this.maxReconnectAttempts = 10;
        this.highlights = new Map();
        this.subscriptionIds = [];
        this.reconnectTimer = null;
        this.keepaliveTimer = null;
        window.addEventListener('beforeunload', () => {
            this.unsubscribeAll();
        });
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
            window.statusManager?.show('Auth failed. Verify Client ID & Token in settings.', 'error');
        }
    }

    applyStyles() {
        window.setEventCSSVariables(document.documentElement, this.config);
        const css = window.buildEventCSS(this.config, '#events-container');
        window.injectStyles('events-dynamic-styles', css);
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

    connect(reconnectUrl) {
        if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
            return;
        }
        const url = reconnectUrl || "wss://eventsub.wss.twitch.tv/ws";
        window.statusManager?.show('Connecting to Twitch...', 'loading');
        console.log(`Connecting to Twitch EventSub WebSocket${reconnectUrl ? ' (reconnect URL)' : ''}...`);
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
            console.log("WebSocket connection opened.");
            this.reconnectAttempts = 0;
            window.statusManager?.show('Connected', 'success', 3000);
        };

        this.ws.onmessage = async (event) => {
            try {
                const message = JSON.parse(event.data);
                const messageType = message.metadata.message_type;

                if (messageType === "session_welcome") {
                    console.log("WebSocket session welcome. Subscribing to events...");
                    await this.subscribeToEvents(message.payload.session.id);
                } else if (messageType === "session_reconnect") {
                    console.log("WebSocket session reconnect requested by Twitch.");
                    this.ws.close();
                    this.connect(message.payload.session.reconnect_url);
                } else if (messageType === "notification") {
                    this.handleNotification(message.payload);
                } else if (messageType === "session_keepalive") {
                    // keepalive received, connection is healthy
                }
            } catch (err) {
                console.error("Failed to parse WebSocket message:", err);
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
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error("Max reconnect attempts reached. Stopping reconnection.");
            window.statusManager?.show('Connection failed. Check network & Twitch status.', 'error');
            return;
        }
        window.statusManager?.show('Connection lost. Reconnecting...', 'warning');
        const delay = Math.min(Math.pow(2, this.reconnectAttempts) * 1000, this.maxReconnectDelay);
        console.log(`Attempting reconnect in ${delay / 1000}s...`);
        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.reconnectAttempts++;
            this.connect();
        }, delay);
    }

    async unsubscribeAll() {
        for (const id of this.subscriptionIds) {
            try {
                await fetch(`https://api.twitch.tv/helix/eventsub/subscriptions?id=${id}`, {
                    method: "DELETE",
                    headers: this.twitchClient.getHeaders()
                });
            } catch (err) {
                console.error("Failed to unsubscribe:", err);
            }
        }
        this.subscriptionIds = [];
    }

    async subscribeToEvents(sessionId) {
        await this.unsubscribeAll();

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
                    const data = await res.json();
                    if (data.data && data.data.length > 0 && data.data[0].id) {
                        this.subscriptionIds.push(data.data[0].id);
                    }
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
