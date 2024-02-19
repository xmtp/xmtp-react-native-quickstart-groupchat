import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useXmtp} from '@xmtp/react-native-sdk';

export const MessageItem = ({message, senderAddress}) => {
  const {client} = useXmtp();
  const renderMessage = () => {
    const contentTypeID = message.contentTypeId;
    const isRegistered = contentTypeID in client.codecRegistry;
    if (!isRegistered) {
      console.log(`Codec not registered for content type: ${contentTypeID}`);
      //xmtp.org/group_membership_change:1.0
      // Not supported content type
      if (message?.fallback != null) {
        return message?.fallback;
      } else {
        return;
      }
    }
    return (
      <View
        style={[
          styles.messageContent,
          isSender
            ? styles.senderMessageContent
            : styles.receiverMessageContent,
        ]}>
        <Text style={styles.renderedMessage}>{message.content()}</Text>
        <View style={styles.footer}>
          <Text style={styles.timeStamp}>
            {`${new Date(message.sent).getHours()}:${String(
              new Date(message.sent).getMinutes(),
            ).padStart(2, '0')}`}
          </Text>
        </View>
      </View>
    );
  };

  const isSender = senderAddress === client?.address;
  return (
    <View
      style={isSender ? styles.senderMessage : styles.receiverMessage}
      key={message.id}>
      {renderMessage()}
    </View>
  );
};

const styles = StyleSheet.create({
  senderMessage: {
    alignSelf: 'flex-start',
    textAlign: 'left',
  },
  receiverMessage: {
    alignSelf: 'flex-end',
    textAlign: 'right',
  },
  messageContent: {
    backgroundColor: 'lightgreen',
    padding: 10,
    margin: 5,
    borderRadius: 5,
    maxWidth: '80%',
  },
  timeStamp: {
    fontSize: 8,
    color: 'grey',
  },
  senderMessageContent: {
    backgroundColor: 'lightblue',
  },
  receiverMessageContent: {
    backgroundColor: 'lightgreen',
  },
});
