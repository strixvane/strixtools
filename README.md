# StrixTools Overlay

StrixTools is a lightweight, highly customizable Twitch overlay suite designed for OBS and other streaming software. It provides a modern chat overlay and live event tracking (Follows, Subs, Cheers) that you can style directly in your browser.

## Features

- **Customizable Chat:** Adjust fonts, colors, background opacity, and "pillbox" styling.
- **Live Events:** Track the latest followers, subscribers, and cheerers.
- **Web-based Settings:** Configure everything visually and generate a single URL to use in OBS.
- **No Installation Required:** Runs entirely in the browser using static files.

## Setup Instructions

### 1. Configure the Overlay
1. Open `settings.html` in your web browser.
2. Go to the **General** tab and enter your **Twitch Channel** name.
3. Provide a **Client ID** and **Access Token** (see below for instructions on how to get these).
4. Use the **Chat** and **Events** tabs to customize the appearance to match your stream's aesthetic.
5. Click **All-in-One Overlay** (or a specific module button) to generate your custom URL. The URL will be automatically copied to your clipboard. To get individual elements, click their respective buttons above **All-in-One Overlay**.

### 2. Add to OBS
1. In OBS, add a new **Browser Source**.
2. Paste the generated URL into the **URL** field.
3. Set the width and height to your preference.
4. (Optional) Check "Shutdown source when not visible" to save resources.
5. Refresh the cache when you make changes!

## How to Get Your Twitch Access Token

To show live events (follows, subs, bits), the overlay needs permission to read your channel data.

1. Go to [Twitch Token Generator](https://twitchtokengenerator.com/) (or a similar trusted tool).
2. Select **Custom Scope Token**.
3. Enable the following scopes:
   - `moderator:read:followers`
   - `channel:read:subscriptions`
   - `bits:read`
4. Click **Generate Token**.
5. Authorize the application with your Twitch account.
6. Copy the **Access Token** and **Client ID** provided.
7. Paste these into the **General** tab of the `settings.html` page.

## Project Structure

- `index.html`: The main overlay renderer.
- `settings.html`: The configuration dashboard and previewer.
- `js/`: Contains the logic for Twitch connection, chat parsing, and event handling.
- `styles/`: CSS files for the overlay and settings UI.
