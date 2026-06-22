# Changelog - StrixTools Overlay

A summary of all the new features and fixes added in this update.

## [2.5.0] - 2026-06-22
- **Added Tests:** Big backend overhaul that is the biggest portion of this update. Not something that will be felt up front, but is going to make it a LOT easier for me long term to maintain this project. (Big thanks to Herb for the help on getting used to TDD!)
- **New Powerline inspired theme:** Added 'Powerline' theme inspired by conversations between myself and Onihiko_VT. Also added customizable accents as part of this update!
- **Various Bugfixes:** Lost track at some point, but squashed a lot of bugs identified by adding tests.
- **Screen Reader Support:** Not super needed on this app, but someone pointed out that it's not too difficult to add and some people do need.

### Upcoming Plans
- Next big update will be another backend one to make deploying new versions easier for me, still working on it. Will likely include more themes!

## [2.4.0] - 2026-06-15

### Retro Windows 95 Theme
- **Retro Look & Feel:** Added a theme selection option to give your chat messages a classic, old-school Windows 95 look!
- **Authentic Windows Design:** When selected, your chat messages turn into classic gray dialog boxes, complete with 3D borders, a dark blue title bar displaying the username, and a white message text box.
- **Retro Close Button:** Each chat message window features a simulated close button "X" in the top-right corner, just like the real operating system.
- **Theme Selection Dropdown:** Added a new dropdown menu in your settings page under the Chat tab to easily switch between the default "Modern Pillbox" style and the new "Retro Windows 95" theme.

## [2.3.0] - 2026-06-15

### Optional Profile Pictures
- **Show Chat Avatars:** You can now show Twitch profile pictures right next to people's usernames in your chat overlay! Just check the new box in the settings page.
- **Shape & Size Controls:** You can choose exactly how big or small the profile pictures are, and make them circles, soft rounded squares, or regular squares.
- **Centered Text:** I've aligned the username and chat text to be perfectly centered with the middle of the profile picture so everything looks super neat and tidy.

### Reliability & "Under the Hood"
- **Twitch-Friendly Loading:** I've optimized how the app gets profile pictures from Twitch so it loads them in groups and remembers them. This keeps the overlay fast, lightweight, and prevents you from hitting any Twitch limits.
- **Sleek Default Avatar:** If you don't have your Twitch account details set up in the General tab, or while a profile picture is loading, the overlay will display a default avatar placeholder.

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
