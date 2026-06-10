import { TwitchClient } from './modules/twitch.js';
import { ChatModule } from './modules/chat.js';
import { EventsModule } from './modules/events.js';

const init = async () => {
    let settings = window.DEFAULT_SETTINGS || {};
    const urlParams = new URLSearchParams(window.location.search);
    const encodedConfig = urlParams.get('cfg');

    if (encodedConfig) {
        try {
            const decodedString = decodeURIComponent(atob(encodedConfig));
            const customSettings = JSON.parse(decodedString);
            settings = {
                general: { ...DEFAULT_SETTINGS.general, ...customSettings.general },
                chat: { ...DEFAULT_SETTINGS.chat, ...customSettings.chat },
                events: { ...DEFAULT_SETTINGS.events, ...customSettings.events }
            };
        } catch (error) {
            console.error("Failed to parse settings from URL, falling back to defaults.", error);
        }
    }

    const twitchClient = new TwitchClient(settings.general);

    const chatModule = new ChatModule({ ...settings.chat, twitchChannel: settings.general.twitchChannel });
    chatModule.init('chat-container');

    const eventsModule = new EventsModule(settings.events, twitchClient);
    try {
        await eventsModule.init();
    } catch (err) {
        console.error("Events module failed to initialize:", err);
    }
};

window.onload = init;
