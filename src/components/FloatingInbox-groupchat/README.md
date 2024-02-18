# Group Chat Tutorial for XMTP

This tutorial will guide you through implementing group chat functionality in your XMTP inbox, covering creation, message sending, streaming, and member management.

<div class=" rabbit  p-5 ">

📥 <b>Need a quick reference?</b> Check out this GitHub repo: <a href="https://github.com/fabriguespe/xmtp-rn-group-chat">group-chat</a>

</div>

### Prerequisites

- Node.js
- npm or Yarn
- React Native CLI
- Xcode (for iOS)

<details>
<summary>
<h3>Installation Steps</h3></summary>

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

</details>

## Tutorial

### Creating a Group Chat

To create a group chat, you can use the GroupChat class. When a user initiates a new group chat, you should collect the participants' addresses and create a new instance of GroupChat.

```jsx
const createGroupChat = participants => {
  const groupChat = await client.conversations.newGroup([addresses]);
  selectConversation(groupChat); // Assuming you have a method to select the current conversation
};
```

### Loading Conversations with Group Chats

To load conversations including group chats, you can modify the ListConversations component to fetch and display both direct and group conversations. Assuming your backend or SDK supports a .list() method that can filter for group chats, you would integrate it as follows:

```jsx
useEffect(() => {
  const fetchConversations = async () => {
    setLoading(true);
    const allConversations = await client.conversations.list(
      (includeGroups = true),
    );
    setConversations(allConversations);
    setLoading(false);
  };

  fetchConversations();
}, []);
```

### Sending a Message in a Group Chat

To send a message in a group chat, you can use the sendMessage method of the GroupChat class. Ensure you check if the current conversation is a group chat before sending the message.

```jsx
const handleSendMessage = async newMessage => {
  if (!newMessage.trim()) {
    alert('Empty message');
    return;
  }
  if (conversation.isGroupChat) {
    await conversation.sendMessage(newMessage);
  } else if (conversation && conversation.peerAddress) {
    // Handle sending a direct message
  }
};
```

### Creating a Stream from a Group Chat

To stream messages from a group chat, you can use the streamMessages method. This method should be called when the group chat is selected to ensure real-time message updates.

```jsx
useEffect(() => {
  if (conversation.isGroupChat) {
    const startMessageStream = async () => {
      conversation.streamMessages((message, includeGroups = true) => {
        setMessages(prevMessages => [...prevMessages, message]);
      });
    };
    startMessageStream();
  }
}, [conversation]);
```

### Editing Group Chat Members

To add or remove members from a group chat, you can use the `addMembers` and `removeMember` methods provided by the GroupChat class.
Adding a Member

```jsx
const addMemberToGroupChat = memberAddress => {
  if (selectedConversation.isGroupChat) {
    selectedConversation.addMembers([memberAddress]);
    setMembers(Array.from(selectedConversation.memberAddresses()));
  }
};
```

Removing a Member

```jsx
const removeMemberFromGroupChat = memberAddress => {
  if (selectedConversation.isGroupChat) {
    selectedConversation.removeMembers([memberAddress]);
    setMembers(Array.from(selectedConversation.memberAddresses()));
  }
};
```

Get member addresses

```jsx
const getGroupMemberAddresses = () => {
  if (selectedConversation.isGroupChat) {
    const memberAddresses = Array.from(selectedConversation.memberAddresses());
    console.log('Group Member Addresses:', memberAddresses);
    return memberAddresses;
  } else {
    console.log('Not a group chat.');
    return [];
  }
};
```
