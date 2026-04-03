# Social Authentication Setup Guide

## Overview
This guide will help you set up Google, Facebook, and Apple authentication for the SwasthTel app.

## 1. Google OAuth Setup

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** and **Google Identity** services

### Step 2: Create OAuth 2.0 Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Create the following client IDs:

#### For Android:
- Application type: **Android**
- Package name: `com.swasthtel.app`
- SHA-1 certificate fingerprint: Get this by running:
  ```bash
  # For debug keystore
  keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
  
  # On Windows
  keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
  ```

#### For iOS:
- Application type: **iOS**
- Bundle ID: `com.swasthtel.app`

#### For Web (used for Expo Go):
- Application type: **Web application**
- Authorized redirect URIs:
  - `https://auth.expo.io/@your-expo-username/swasthtel-app`

### Step 3: Update the App
Edit `src/services/socialAuth.ts` and replace the placeholder values:

```typescript
const GOOGLE_CONFIG = {
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
};
```

---

## 2. Facebook OAuth Setup

### Step 1: Create a Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** > **Create App**
3. Choose **Consumer** as the app type
4. Fill in the app details

### Step 2: Configure Facebook Login
1. In your app dashboard, add **Facebook Login** product
2. Go to **Settings** > **Basic**
3. Note your **App ID**

### Step 3: Add Platform Settings

#### For Android:
1. Go to **Settings** > **Basic** > **Add Platform** > **Android**
2. Package Name: `com.swasthtel.app`
3. Class Name: `com.swasthtel.app.MainActivity`
4. Key Hashes: Generate using:
   ```bash
   keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore | openssl sha1 -binary | openssl base64
   ```

#### For iOS:
1. Go to **Settings** > **Basic** > **Add Platform** > **iOS**
2. Bundle ID: `com.swasthtel.app`

### Step 4: Update the App
Edit `src/services/socialAuth.ts`:

```typescript
const FACEBOOK_CONFIG = {
  clientId: 'YOUR_FACEBOOK_APP_ID',
};
```

---

## 3. Apple Sign In Setup (iOS Only)

### Prerequisites
- Apple Developer Account ($99/year)
- Xcode installed on a Mac

### Step 1: Enable Apple Sign In Capability
1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Go to **Certificates, Identifiers & Profiles**
3. Select your App ID or create a new one
4. Enable **Sign In with Apple** capability

### Step 2: Configure in Xcode (for standalone builds)
1. Open your project in Xcode
2. Go to **Signing & Capabilities**
3. Click **+ Capability** and add **Sign in with Apple**

### Step 3: The app.json is already configured
```json
{
  "ios": {
    "usesAppleSignIn": true
  }
}
```

---

## 4. Backend Environment Variables

Add these to your backend `.env` file for additional security (optional token verification):

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_web_client_id

# Facebook OAuth  
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Apple Sign In
APPLE_TEAM_ID=your_apple_team_id
APPLE_KEY_ID=your_apple_key_id
APPLE_PRIVATE_KEY=your_apple_private_key
```

---

## 5. Testing in Expo Go

When testing in Expo Go, you'll use the **web client ID** for Google authentication. The redirect URI will be:

```
https://auth.expo.io/@your-expo-username/swasthtel-app
```

Make sure to add this to your Google OAuth web client's authorized redirect URIs.

---

## 6. Building for Production

When you build a standalone app (not Expo Go), the native OAuth flows will be used:
- Android will use the Android client ID
- iOS will use the iOS client ID and native Apple Sign In

Build commands:
```bash
# For Android
eas build --platform android

# For iOS
eas build --platform ios
```

---

## Troubleshooting

### "redirect_uri_mismatch" Error (Google)
- Make sure your redirect URI exactly matches what's configured in Google Cloud Console
- For Expo Go: `https://auth.expo.io/@username/slug`

### Facebook Login Not Working
- Check that your app is in "Live" mode (not development)
- Verify the App ID is correct

### Apple Sign In Not Appearing
- Apple Sign In only works on iOS devices
- Make sure `usesAppleSignIn: true` is in app.json
- The device must be running iOS 13 or later

---

## Security Notes

1. **Never commit OAuth credentials** to version control
2. Use environment variables for production
3. The backend verifies tokens from social providers before creating sessions
4. Social auth users get a randomly generated password (they can't use password login)
