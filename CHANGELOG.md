# Changelog - StrixTools Overlay

A summary of all the new features and fixes added in this update.

## [2.2.0] - 2026-06-14

### New Feature
- Added Twitch badges to chat overlay. Now displays user badges in chat for mods, subs, turbo, etc.
- Made Twitch badges optional, just uncheck the box in the chat settings to hide them.
- Updated instructions in the README to be a little clearer.

## [2.1.1] - 2026-06-14

### Fix
- Broke the individual elements copy URL buttons, issue now resolved. Also fixed the green confirmation when button is clicked and text copied so that it now correctly overlays the button that was pressed.

## [2.1.0] - 2026-06-14

### Major New Features
- **Clean URLs:** I've made the generated OBS links much shorter and smarter. They now only save the specific changes you've made, making them easier to copy and less likely to cause issues in OBS.

### Better Customization
- **Text Control:** You can now make your chat and follower labels *italic*, add extra space between letters, or underline them.
- **Improved Shadows:** I've added new controls so you can move your text shadows exactly where you want them.
- **Accurate Previews:** The "Live Preview" box now shows you exactly what your overlay will look like in OBS.

### Reliability & "Under the Hood"
- **Smoother & Faster:** I've made some performance improvements and optimizations to reduce the memory footprint a bit.
- **Mistake-Proofing:** If you accidentally leave a setting empty or type something a bit off, the app will now automatically fix it with a safe default so nothing breaks.
- **Bug Squashing:** Fixed a small issue where some of your font styles (like italics) wouldn't always show up correctly in the live chat.

## [2.0.0] - 2026-06-13

### New Features & Reliability
- **Automatic Reconnecting:** The overlay will now automatically try to reconnect if your internet dips or Twitch’s connection drops, keeping your "Latest Follower" labels up-to-date without needing a refresh.
- **Smart Settings Saving:** Your styling choices are now saved in your browser. You can refresh the page or close your browser without losing your custom colors and fonts.
- **"Reset Styles" Button:** Added a way to quickly revert all colors and fonts to their original look without accidentally deleting your Twitch Channel name or tokens.
- **Improved Twitch Integration:** Updated how we talk to Twitch to ensure your most recent followers and subscribers show up correctly every time.

### Customization & Styling
- **Professional Fonts:** Updated the default fonts to be much cleaner and easier to read.
- **Advanced Borders:** You can now add custom borders (dashed, dotted, or solid) to your chat bubbles and event labels.
- **Event Styling:** You can now add backgrounds and rounded corners to your "Latest Follower" and "Latest Sub" labels to make them match your chat's look.
- **Custom Highlights:** When a new follower or sub arrives, you can now choose exactly what color they "flash" and how long that highlight lasts.
- **Optional Fade-out:** You can now set the chat fade-out timer to 0 to keep messages on your screen permanently.

### Testing & Usability
- **Better Test Buttons:** Added "Test Chat" and "Test Event" buttons that use a list of real-looking names, so you can see exactly how your styles look before going live.
- **Setup Checks:** The app will now warn you if you’ve forgotten to enter your Twitch details before you try to generate a link for OBS.

### Security
- **Privacy Warnings:** Added clear warnings to help you keep your private Twitch tokens safe and off-stream.
