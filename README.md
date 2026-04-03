# SwasthTel APP

A React Native mobile app for healthy cooking oil management, built with Expo SDK 54.

## Features

- 🛢️ Oil consumption tracking
- 📊 Analytics & trends
- 🍳 Recipe optimization
- 👥 Community features
- 🏆 Challenges & rewards
- 📚 Education modules
- 🤝 Partner integrations

## Prerequisites

- Node.js 18+
- npm or yarn
- Expo Go app on your mobile device

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/swasthtel-app.git

# Navigate to project directory
cd swasthtel-app

# Install dependencies
npm install
```

## Running the App

### Development (Android - same WiFi network)
```bash
npm run lan
```

### Development (iOS - via tunnel)
```bash
npm run tunnel
```

### Other commands
```bash
npm start          # Start Expo dev server
npm run android    # Start on Android
npm run ios        # Start on iOS
```

Scan the QR code with Expo Go (Android) or Camera app (iOS).

## Project Structure

```
SwasthTel-APP/
├── app.json              # Expo configuration
├── babel.config.js       # Babel configuration
├── eas.json              # EAS Build configuration
├── index.js              # Entry point
├── metro.config.js       # Metro bundler config
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── assets/               # App icons & splash
└── src/
    ├── App.tsx           # Main app component
    ├── assets/           # Images & media
    ├── components/
    │   └── native/       # React Native components
    │       ├── screens/  # Screen components
    │       └── onboarding/ # Onboarding flow
    └── navigation/
        └── AppNavigator.tsx # Navigation config
```

## Tech Stack

- **Framework**: React Native 0.81.5
- **Platform**: Expo SDK 54
- **Navigation**: React Navigation 7
- **Animations**: React Native Reanimated 4
- **Language**: TypeScript

## Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.
