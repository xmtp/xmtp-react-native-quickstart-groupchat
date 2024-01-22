# XMTP Quickstart

### Prerequisites

- Node.js
- npm or Yarn
- React Native CLI
- Xcode (for iOS)

### 1. Initialize React Native Project

If you haven't already created a React Native project, start by initializing one:

```bash
npx react-native init xmtprn
```

### 2. Install Expo Modules

Install the latest Expo modules:

```bash
npx install-expo-modules@latest
```

### 3. Install XMTP React Native SDK

Install the XMTP React Native SDK using npm:

```bash
npm install @xmtp/react-native-sdk
```

### 4. Update Podfile for iOS

Update the Podfile to set the minimum iOS platform. Open the `Podfile` in your iOS directory and modify the platform line:

```ruby
platform :ios, '16.0'
```

### 5. Update Xcode Target

Ensure your Xcode project's target is updated to iOS 16.0 or higher.

### 6. Add Babel Plugin

Install the Babel plugin required for the XMTP SDK:

```bash
npm add @babel/plugin-proposal-export-namespace-from
```

### 7. Configure Babel

Update your Babel configuration. Open your `babel.config.js` and add the plugin:

```javascript
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: ['@babel/plugin-proposal-export-namespace-from'],
};
```

### 8. Install iOS Pods

Navigate to the iOS directory and install the necessary pods:

```bash
cd ios && pod install && cd ..
```

### 9. Start the Application

Finally, start your React Native application:

```bash
npm run ios
```

## Concepts

Head to our docs to understand XMTP's concepts

- [Get started](https://xmtp.org/docs/build/get-started/overview?sdk=rn)
- [Authentication](https://xmtp.org/docs/build/authentication?sdk=rn)
- [Conversations](https://xmtp.org/docs/build/conversations?sdk=rn)
- [Messages](https://xmtp.org/docs/build/messages/?sdk=rn)
- [Streams](https://xmtp.org/docs/build/streams/?sdk=rn)

#### Troubleshooting

If you get into issues with `Buffer` and `polyfills` check out the fix below:

- [Check out Buffer issue](https://github.com/xmtp/xmtp-js/issues/487)
