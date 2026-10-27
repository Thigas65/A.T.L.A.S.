# ATLAS Companion (Android)

This is a separate Android companion project; it does not change the existing Render web app.

## Current starter features
- Opens the installed Instagram app, or the official Instagram website if the app is not installed.
- Lets the user prepare and copy a message for manual review.
- Includes a narrowly scoped accessibility-service scaffold, but it currently performs no UI inspection, clicks, reading, or sending.

## Important limits
- This is not yet connected to the ATLAS website and is not an Instagram API integration.
- No Instagram password or session cookie is requested or stored.
- Messages are not sent automatically. The user reviews and sends them in Instagram.
- Accessibility access must never be enabled for a service the user does not trust.

## Build
Open the android-companion folder in Android Studio and let Gradle sync. Build an APK from the Build menu. This repository does not include the Gradle wrapper yet, and the project has not been built or tested on a physical phone.

## Next step
After a successful build and local test, define a consent-based bridge between ATLAS web and this companion app. Any future accessibility actions should be limited to explicit user requests and should not send messages without confirmation.
