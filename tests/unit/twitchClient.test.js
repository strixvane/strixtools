import { describe, it, expect, vi, beforeEach } from 'vitest';

const { TwitchClient } = window;

describe('TwitchClient', () => {
    let client;

    beforeEach(() => {
        client = new TwitchClient({
            clientId: 'test-client-id',
            accessToken: 'test-token',
            twitchChannel: 'testchannel'
        });
    });

    describe('getHeaders', () => {
        it('returns correct headers object', () => {
            const headers = client.getHeaders();
            expect(headers).toEqual({
                'Client-Id': 'test-client-id',
                'Authorization': 'Bearer test-token',
                'Content-Type': 'application/json'
            });
        });
    });

    describe('validateAuth', () => {
        it('returns userId on successful auth', async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ data: [{ id: '12345' }] })
            });

            const result = await client.validateAuth();
            expect(result).toBe('12345');
            expect(client.userId).toBe('12345');
            expect(globalThis.fetch).toHaveBeenCalledWith(
                'https://api.twitch.tv/helix/users',
                expect.objectContaining({
                    headers: expect.objectContaining({ 'Authorization': 'Bearer test-token' })
                })
            );
        });

        it('throws when access token is missing', async () => {
            const badClient = new TwitchClient({
                clientId: 'test',
                accessToken: '',
                twitchChannel: 'test'
            });
            await expect(badClient.validateAuth()).rejects.toThrow('Access Token is missing');
        });

        it('throws on non-ok response', async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: false,
                statusText: 'Unauthorized'
            });

            await expect(client.validateAuth()).rejects.toThrow('Auth failed');
        });

        it('throws on empty data array', async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ data: [] })
            });

            await expect(client.validateAuth()).rejects.toThrow('Could not find user data');
        });

        it('throws on missing data key', async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({})
            });

            await expect(client.validateAuth()).rejects.toThrow('Could not find user data');
        });
    });

    describe('getChannelUserId', () => {
        it('returns userId for valid channel name', async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ data: [{ id: '67890' }] })
            });

            const result = await client.getChannelUserId('mychannel');
            expect(result).toBe('67890');
            expect(globalThis.fetch).toHaveBeenCalledWith(
                expect.stringContaining('mychannel'),
                expect.any(Object)
            );
        });

        it('returns null for nonexistent channel', async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ data: [] })
            });

            const result = await client.getChannelUserId('nonexistent');
            expect(result).toBeNull();
        });

        it('returns null when null name provided and no fallback channel', async () => {
            const c = new TwitchClient({
                clientId: 'test',
                accessToken: 'token',
                twitchChannel: ''
            });
            const result = await c.getChannelUserId(null);
            expect(result).toBeNull();
        });

        it('falls back to channel from config when no argument passed', async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ data: [{ id: '11111' }] })
            });

            const c = new TwitchClient({
                clientId: 'test',
                accessToken: 'token',
                twitchChannel: 'configchannel'
            });
            const result = await c.getChannelUserId();
            expect(result).toBe('11111');
        });

        it('throws on fetch error', async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: false,
                statusText: 'Not Found'
            });

            await expect(client.getChannelUserId('badchannel')).rejects.toThrow(
                'Failed to fetch user ID for channel badchannel'
            );
        });
    });

    describe('getGlobalBadges', () => {
        it('returns badge data on success', async () => {
            const badgeData = { data: [{ set_id: 'vip', versions: [] }] };
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(badgeData)
            });

            const result = await client.getGlobalBadges();
            expect(result).toEqual(badgeData);
        });

        it('throws on fetch failure', async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: false,
                statusText: 'Bad Request'
            });

            await expect(client.getGlobalBadges()).rejects.toThrow('Failed to fetch global badges');
        });
    });

    describe('getChannelBadges', () => {
        it('returns badge data for valid broadcaster', async () => {
            const badgeData = { data: [{ set_id: 'subscriber', versions: [] }] };
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(badgeData)
            });

            const result = await client.getChannelBadges('54321');
            expect(result).toEqual(badgeData);
            expect(globalThis.fetch).toHaveBeenCalledWith(
                expect.stringContaining('54321'),
                expect.any(Object)
            );
        });

        it('returns null when no broadcasterId provided', async () => {
            const result = await client.getChannelBadges();
            expect(result).toBeNull();
        });

        it('returns null when broadcasterId is empty', async () => {
            const result = await client.getChannelBadges('');
            expect(result).toBeNull();
        });

        it('throws on fetch failure', async () => {
            globalThis.fetch = vi.fn().mockResolvedValue({
                ok: false,
                statusText: 'Forbidden'
            });

            await expect(client.getChannelBadges('54321')).rejects.toThrow(
                'Failed to fetch channel badges for broadcaster 54321'
            );
        });
    });
});
