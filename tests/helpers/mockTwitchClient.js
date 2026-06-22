export class MockTwitchClient {
    constructor(config) {
        this.clientId = config.clientId;
        this.accessToken = config.accessToken;
        this.channel = config.twitchChannel;
        this.userId = null;
    }

    getHeaders() {
        return {
            'Client-Id': this.clientId,
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
        };
    }

    async getChannelUserId(_channelName) {
        return '12345';
    }

    async getGlobalBadges() {
        return { data: [] };
    }

    async getChannelBadges(_broadcasterId) {
        return { data: [] };
    }

    async validateAuth() {
        this.userId = 'broadcaster-123';
        return this.userId;
    }
}
