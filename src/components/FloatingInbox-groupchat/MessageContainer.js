import React, {useState, useRef, useEffect} from 'react';
import {MessageInput} from './MessageInput';
import {MessageItem} from './MessageItem';
import {useXmtp} from '@xmtp/react-native-sdk';
import {View, Text, ScrollView, Alert, StyleSheet} from 'react-native';

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
    let isMounted = true;
    let timer;
    const fetchMessages = async () => {
      if (
        conversation &&
        (conversation.peerAddress || conversation.peerAddresses) &&
        isFirstLoad.current
      ) {
        setIsLoading(true);
        await conversation.sync();
        const initialMessages = await conversation?.messages();
        const orderedMessages = initialMessages.reverse();
        let updatedMessages = [];
        orderedMessages.forEach(message => {
          updatedMessages = updateMessages(updatedMessages, message);
        });

        setMessages(updatedMessages);
        setIsLoading(false);
        isFirstLoad.current = false;
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
    };
  }, [conversation]);

  useEffect(() => {
    const startMessageGroupStream = async () => {
      console.log('Stream started');

      await conversation.streamGroupMessages(message => {
        console.log('Streamed g message:', message.content());
        setMessages(prevMessages => {
          return updateMessages(prevMessages, message);
        });
      });
    };

    const startMessageStream = async () => {
      await conversation.streamMessages(message => {
        console.log('Streamed message:', message);
        setMessages(prevMessages => {
          return updateMessages(prevMessages, message);
        });
      });
    };
    if (typeof conversation.streamMessages === 'function') startMessageStream();
    if (typeof conversation.streamGroupMessages === 'function')
      startMessageGroupStream();
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
      await conversation.sync();
      await conversation.send(newMessage);
      await conversation.sync();
    } else if (conversation && conversation.version === 'GROUP') {
      console.log('groupChatAddresses', groupChatAddresses);
      const minimumAddresses = 2;
      const randomQuantity = Math.max(
        minimumAddresses,
        Math.floor(Math.random() * groupChatAddresses.length) + 1,
      );

      const selectedAddresses = [];
      for (
        let i = 0;
        i < groupChatAddresses.length &&
        selectedAddresses.length < randomQuantity;
        i++
      ) {
        const randomIndex = Math.floor(
          Math.random() * groupChatAddresses.length,
        );
        const candidateAddress = groupChatAddresses[randomIndex];
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
      console.log(selectedAddresses);
      const canMessageV3 = await client.canGroupMessage(selectedAddresses);
      console.log(
        'Selected addresses for group chat:',
        selectedAddresses,
        canMessageV3,
      );
      if (canMessageV3) {
        const groupChat = await client.conversations.newGroup(
          selectedAddresses,
        );
        selectConversation(groupChat);
        await groupChat.send(newMessage);
        await groupChat.sync();
      } else {
        console.log('No group chat created');
      }
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
