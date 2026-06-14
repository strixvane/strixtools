# StrixTools Overlay

![StrixTools Overlay Preview](assets/preview_screenshot.webp)

StrixTools is a lightweight, high-performance, and highly customizable Twitch overlay suite designed for OBS and other streaming software. Built with modern web technologies, it provides a seamless chat experience and real-time event tracking without the need for complex installations or backend servers.

## Features

- **Deep Customization:** Adjust typography, colors, background opacity, "pillbox" styling, and advanced borders directly from the settings dashboard.
- **Live Events (Twitch EventSub):** Instant tracking of new Followers, Subscribers, and Cheers using Twitch's latest WebSocket-based EventSub API.
- **Enhanced Chat:** Modern chat overlay with support for Twitch emotes and "pillbox" message layouts.
- **Local Persistence:** Your settings are automatically saved in your browser's local storage—no need to re-configure after closing the page.
- **Live Preview & Testing:** See your changes in real-time and use built-in "Test Chat" and "Test Event" buttons to verify your layout before going live.
- **Modular or All-in-One:** Generate a single URL for the full suite or individual URLs for specific components (e.g., Chat only, Follower only).

## Setup Instructions

### 1. Initial Configuration (OBS Custom Dock)
The best way to use StrixTools is by adding the settings page directly into OBS. This allows you to see changes live on your stream as you make them.

1. In OBS, go to **View** -> **Docks** -> **Custom Browser Docks...**
2. **Dock Name:** `StrixTools Settings`
3. **URL:** (Point this to the `settings.html` file on your computer, e.g., `C:\Users\Name\strixtools\settings.html`)
4. Click **Apply**. A new window will appear in OBS. Drag it wherever you like in your layout.
5. **Twitch Connection:** In the new dock, enter your **Twitch Channel**, **Client ID**, and **Access Token**.

### 2. Add the Overlay to OBS
1. In your StrixTools Settings dock, scroll down and click **All-in-One Overlay**. The custom URL will be copied to your clipboard.
2. In OBS, add a new **Browser Source** to your scene.
3. **URL:** Paste the URL from your clipboard.
4. **Dimensions:** Set your preferred width and height.
5. **Live Updates:** Now, whenever you change a color or font in the **StrixTools Settings dock**, the overlay in your scene will update **instantly**! You no longer need to generate new URLs for every change.

> [!TIP]
> **Cleaner URLs:** We've optimized the generated URLs to be much shorter and easier to manage. They now only store the settings you've actually changed from the defaults.

### 3. How to Get Your Twitch Access Token

To track live events and read chat, the overlay needs a secure connection to your Twitch channel.

1. Go to [Twitch Token Generator](https://twitchtokengenerator.com/) (or another trusted developer tool).
2. Select **Custom Scope Token**.
3. Enable the following mandatory scopes:
   - `moderator:read:followers`
   - `channel:read:subscriptions`
   - `bits:read`
4. Click **Generate Token** and authorize the application.
5. Copy the **Access Token** and **Client ID**.
6. Paste these into the **General** tab in `settings.html`.

> [!CAUTION]
> **SECURITY WARNING:** The generated OBS URL contains your private Access Token. **NEVER** show this URL on stream, share it with others, or commit it to a public repository. If your token is compromised, generate a new one immediately.

## Project Structure

- `index.html`: The main overlay renderer used in OBS.
- `settings.html`: The visual configuration dashboard and previewer.
- `assets/`: Image resources and project screenshots.
- `js/modules/`: Core logic for Twitch API connection (`twitch.js`), Chat handling (`chat.js`), and Event tracking (`events.js`).
- `styles/`: CSS definitions for the overlay themes and settings UI.
- `js/config.js`: Default settings and configuration schema.

## Technical Details

- **Twitch Integration:** `tmi.js` for IRC chat and Twitch EventSub (WebSockets) for real-time notifications.
- **Emotes:** Parsed using `emotettv` for high-quality emote rendering.
- **Styling:** Dynamic CSS generation based on your visual configuration.
- **Storage:** Web LocalStorage for configuration persistence.

---

For a full list of recent updates and changes, see the [CHANGELOG.md](CHANGELOG.md).
