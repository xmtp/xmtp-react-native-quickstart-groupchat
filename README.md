# ARCHIVED: Group chat tutorial with React Native

![Status](https://img.shields.io/badge/Project_Status-Archived-lightgrey)

> **Important**: This tutorial has been archived. For help with building group chat, use the `xmtp-react-native` [example app](https://github.com/xmtp/xmtp-react-native/tree/main/example) instead.

---

This **archived** tutorial will guide you through implementing group chat functionality in your XMTP inbox, covering creation, message sending, streaming, and member management.

<details>
<summary>

<h3>Installation Steps</h3></summary>

### Prerequisites

- Node.js
- npm or Yarn
- React Native CLI
- Xcode (for iOS)

### 1. Initialize react native project

If you haven't already created a React Native project, start by initializing one:

```bash
npx react-native init xmtprn
```

### 2. Install expo modules

Install the latest Expo modules:

```bash
npx install-expo-modules@latest
```

### 3. Install XMTP react native sdk

Install the XMTP React Native SDK using npm:

```bash
npm install @xmtp/react-native-sdk
```

### 4. Update podfile for ios

Update the Podfile to set the minimum iOS platform. Open the `Podfile` in your iOS directory and modify the platform line:

```ruby
platform :ios, '16.0'
```

### 5. Update xcode target

Ensure your Xcode project's target is updated to iOS 16.0 or higher.

### 6. Add Babel plugin

Install the Babel plugin required for the XMTP SDK:

```bash
npm add @babel/plugin-proposal-export-namespace-from
```

### 7. Configure babel

Update your Babel configuration. Open your `babel.config.js` and add the plugin:

```javascript
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: ['@babel/plugin-proposal-export-namespace-from'],
};
```

### 8. Install ios pods

Navigate to the iOS directory and install the necessary pods:

```bash
cd ios && pod install && cd ..
```

### 9. Start the application

Finally, start your React Native application:

```bash
npm run ios
```

</details>

## Concepts

Head to our docs to understand XMTP group chat concepts

- [Creating a group chat](https://xmtp.org/docs/build/group-chat)
- [Send a message in a group chat](https://xmtp.org/docs/build/group-chat)
- [Synchronizing group conversations](https://xmtp.org/docs/build/group-chat)
- [List group chat conversations](https://xmtp.org/docs/build/group-chat)
- [Check if a group chat is active](https://xmtp.org/docs/build/group-chat)
- [Synchronizing group details and messages](https://xmtp.org/docs/build/group-chat)
- [Manage group chat members](https://xmtp.org/docs/build/group-chat)
- [Listen for new messages and updates](https://xmtp.org/docs/build/group-chat)
- [Listen for new group chats](https://xmtp.org/docs/build/group-chat)

## Tutorial

### Creating a group chat

To create a group chat, you can use the GroupChat class. When a user initiates a new group chat, you should collect the participants' addresses and create a new instance of GroupChat.

```jsx
const createGroupChat = participants => {
  const groupChat = await client.conversations.newGroup([addresses]);
  selectConversation(groupChat); // Assuming you have a method to select the current conversation
};
```

### Loading all group chats

> :warning: Remember to `syncGroups()` chats to ensure you have the latest data.

To load conversations including group chats, you can modify the ListConversations component to fetch and display both direct and group conversations. Assuming your backend or SDK supports a .list() method that can filter for group chats, you would integrate it as follows:

```jsx
useEffect(() => {
  const fetchConversations = async () => {
    setLoading(true);
    //Get groups from local DB
    const allGroups = await client.conversations.listGroups();
    setConversations(allGroups);
    setLoading(false);
  };

  fetchConversations();
}, []);
```

### Sending a message in a group chat

To send a message in a group chat, you can use the sendMessage method of the GroupChat class. Ensure you check if the current conversation is a group chat before sending the message.

```jsx
const handleSendMessage = async newMessage => {
  if (!newMessage.trim()) {
    alert('Empty message');
    return;
  }
  if (group && group.version === 'GROUP') {
    await group.send(newMessage);
  } else if (group && group.peerAddress) {
    // Handle sending a direct message
  }
};
```

### Loading group chat messages

Here's a simplified example of how you might use `group.messages()` to load and display messages from a group chat:

> :warning: Group chats are currently per installation
> As of now, group chats in XMTP are specific to each installation. This means that while you can access your group chat conversations across different devices, the historical messages within those chats might not automatically appear. Currently, each group chat's message history is tied to the device where it was initiated. As a result, there is no automatic syncing of message history across devices. When you sign in on a new device, you will see existing group chat conversations but will only receive new messages from that point forward. We are actively working on enhancing this feature to improve your experience with group conversations.

```jsx
useEffect(() => {
  const loadGroupMessages = async () => {
    if (conversation && conversation.version === 'GROUP') {
      try {
        setIsLoading(true);
        // Assuming `conversation` is an instance of a GroupChat
        // Fetch the latest 20 messages from the group chat
        const messages = await conversation.messages({limit: 20});
        setMessages(messages.reverse()); // Reverse the messages to display the latest at the bottom
      } catch (error) {
        console.error('Failed to load group messages:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  loadGroupMessages();
}, [conversation]);
```

### Listening for new messages

To stream messages from a group chat, you can use the streamMessages method. This method should be called when the group chat is selected to ensure real-time message updates.

```jsx
useEffect(() => {
  if (conversation.version === 'GROUP') {
    const startMessageStream = async () => {
      conversation.streamGroupMessages((message, includeGroups = true) => {
        setMessages(prevMessages => [...prevMessages, message]);
      });
    };
    startMessageStream();
  }
}, [conversation]);
```

### Manage group chat members

> :warning: Remember to `sync()` chats to ensure you have the latest data.

To add or remove members from a group chat, you can use the `addMembers` and `removeMember` methods provided by the GroupChat class.
Adding a Member

```jsx
const addMemberToGroupChat = memberAddress => {
  if (selectedConversation.version === 'GROUP') {
    //Update the member
    selectedConversation.addMembers([memberAddress]);
    //Update state
    setMembers(await selectedConversation.memberAddresses());
  }
};
```

Removing a Member

```jsx
const removeMemberFromGroupChat = memberAddress => {
  if (selectedConversation.version === 'GROUP') {
    //Update the member
    selectedConversation.removeMembers([memberAddress]);
    //Update state
    setMembers(await selectedConversation.memberAddresses());
  }
};
```

Get member addresses

```jsx
const getGroupMemberAddresses = () => {
  if (selectedConversation.version === 'GROUP') {
    //Get member addresses
    const memberAddresses = await selectedConversation.memberAddresses();
    console.log('Group Member Addresses:', memberAddresses);
    return memberAddresses;
  } else {
    console.log('Not a group chat.');
    return [];
  }
};
```

_For additional details and guidance, please visit our [Documentation](https://xmtp.org/docs/build/group-chat)._
