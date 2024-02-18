import React, {useState, useRef, useEffect} from 'react';
import {MessageInput} from './MessageInput';
import {MessageItem} from './MessageItem';
import {useXmtp, Client} from '@xmtp/react-native-sdk';
import {View, Text, ScrollView, Alert, StyleSheet} from 'react-native';

import Config from 'react-native-config';
const xmtpEnv = Config.XMTP_ENV;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  messagesContainer: {
    flex: 1,
  },
});

export const MessageContainer = ({
  conversation,
  selectConversation,
  groupChatAddresses,
}) => {
  const isFirstLoad = useRef(true);
  const {client} = useXmtp();
  const bottomOfList = useRef(null);

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [groupChats, setGroupChats] = useState([]);

  const updateMessages = (prevMessages, newMessage) => {
    const doesMessageExist = prevMessages.some(
      existingMessage => existingMessage.id === newMessage.id,
    );

    if (!doesMessageExist) {
      return [...prevMessages, newMessage];
    }
    return prevMessages;
  };

  useEffect(() => {
    let stream;
    let isMounted = true;
    let timer;
    const fetchMessages = async () => {
      if (
        conversation &&
        (conversation.peerAddress || conversation.version === 'GROUP') &&
        isFirstLoad.current
      ) {
        setIsLoading(true);
        let initialMessages = [];
        try {
          initialMessages = await conversation?.messages();
        } catch (e) {
          console.error('Error fetching messages:', e);
        }

        let updatedMessages = [];
        initialMessages.forEach(message => {
          updatedMessages = updateMessages(updatedMessages, message);
        });

        setMessages(updatedMessages);
        setIsLoading(false);
        isFirstLoad.current = false;
      } else {
        setMessages([]);
        setIsLoading(false);
      }
      // Delay scrolling to the bottom to allow the layout to update
      timer = setTimeout(() => {
        if (isMounted && bottomOfList.current) {
          bottomOfList.current.scrollToEnd({animated: false});
        }
      }, 0);
    };
    fetchMessages();

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (stream) stream.return();
    };
  }, [conversation]);

  useEffect(() => {
    const startMessageStream = async () => {
      conversation.streamMessages(message => {
        console.log('Streamed message:', message);
        setMessages(prevMessages => {
          return updateMessages(prevMessages, message);
        });
      });
    };
    if (typeof conversation.streamMessages === 'function') startMessageStream();
  }, [conversation]);

  useEffect(() => {
    if (bottomOfList.current) {
      bottomOfList.current.scrollToEnd({animated: true});
    }
  }, [messages]);

  const handleSendMessage = async newMessage => {
    if (!newMessage.trim()) {
      Alert.alert('Empty message');
      return;
    }
    if (
      conversation &&
      conversation.version === 'GROUP' &&
      conversation.peerAddresses
    ) {
      await conversation.send(newMessage);
    } else if (conversation && conversation.version === 'GROUP') {
      const addressList = [
        '0xCbF04828D2FD41402fE90C03a93ff6bF2060AfA1',
        '0xAfc2e1860B565d91a68417F86F2ae8d78eBc8Bea',
        '0xA058BBB09F46c039cD21d297135349ea0f1E85F1',
        '0x1E35A191eD52DD38c92Abc593f7f2aB0BB7022E4',
        '0x265c0dd2934d94103AE8e0175c3aDF8163EcC29B',
      ];
      const minimumAddresses = 2;
      const randomQuantity = Math.max(
        minimumAddresses,
        Math.floor(Math.random() * addressList.length) + 1,
      );

      const selectedAddresses = [];
      for (
        let i = 0;
        i < addressList.length && selectedAddresses.length < randomQuantity;
        i++
      ) {
        const randomIndex = Math.floor(Math.random() * addressList.length);
        const candidateAddress = addressList[randomIndex];
        if (!selectedAddresses.includes(candidateAddress)) {
          const canMessage = await client.canMessage(candidateAddress);
          const canGroupMessage = await client.canGroupMessage([
            candidateAddress,
          ]);
          console.log(candidateAddress, canGroupMessage, candidateAddress);
          if (canMessage && canGroupMessage) {
            selectedAddresses.push(candidateAddress);
          }
        }
      }
      console.log(addressList);
      console.log('Selected addresses for group chat:', selectedAddresses);
      const canMessageV3 = await client.canGroupMessage(selectedAddresses);
      console.log('canMessageV3', canMessageV3);
      const groupChat = await client.conversations.newGroup(selectedAddresses);
      console.log('groupChat', groupChat);
      // Sync groups after creation if you created a group
      await client.conversations.syncGroups();
      selectConversation(groupChat);
      const groups = await client.conversations.listGroups();
      console.log('groups', groups);
      //setGroupChatAddresses(new Set()); // Clear the group chat addresses
      await groupChat.sendMessage(newMessage);
    } else if (conversation && conversation.peerAddress) {
      await conversation.send(newMessage);
    } else if (conversation) {
      const conv = await client.conversations.newConversation(conversation);
      selectConversation(conv);
      await conv.send(newMessage);
    }
  };

  return (
    <>
      {isLoading ? (
        <Text>Loading messages...</Text>
      ) : (
        <View style={styles.container}>
          <ScrollView style={styles.messagesContainer} ref={bottomOfList}>
            {messages.slice().map(message => {
              return (
                <MessageItem
                  key={message.id}
                  message={message}
                  senderAddress={message.senderAddress}
                  client={client}
                />
              );
            })}
          </ScrollView>
          <MessageInput
            onSendMessage={msg => {
              handleSendMessage(msg);
            }}
          />
        </View>
      )}
    </>
  );
};
