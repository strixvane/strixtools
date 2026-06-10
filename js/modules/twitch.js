class TwitchClient {
    constructor(config) {
        this.clientId = config.clientId;
        this.accessToken = config.accessToken;
        this.channel = config.twitchChannel;
        this.userId = null;
    }

    async validateAuth() {
        if (!this.accessToken) {
            throw new Error("Access Token is missing. Please check your settings.");
        }

        const userRes = await fetch("https://api.twitch.tv/helix/users", {
            headers: {
                "Client-Id": this.clientId,
                "Authorization": `Bearer ${this.accessToken}`
            }
        });

        if (!userRes.ok) {
            throw new Error("Auth failed. Please check the Access Token and Client ID.");
        }

        const userData = await userRes.json();
        if (!userData.data || userData.data.length === 0) {
            throw new Error("Could not find user data. Check your Client ID and Access Token.");
        }
        this.userId = userData.data[0].id;
        return this.userId;
    }

    getHeaders() {
        return {
            "Client-Id": this.clientId,
            "Authorization": `Bearer ${this.accessToken}`,
            "Content-Type": "application/json"
        };
    }
}

window.TwitchClient = TwitchClient;
