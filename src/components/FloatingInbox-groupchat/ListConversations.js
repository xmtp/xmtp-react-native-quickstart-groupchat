import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {useXmtp} from '@xmtp/react-native-sdk';

export const ListConversations = ({
  searchTerm,
  selectConversation,
  onConversationFound,
}) => {
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const {client} = useXmtp();
  const bottomOfList = useRef(null);

  const styles = StyleSheet.create({
    conversationListItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      margin: 0,
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
      backgroundColor: '#f0f0f0',
      padding: 10,
    },
    conversationDetails: {},
    conversationName: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    messagePreview: {
      fontSize: 14,
      color: '#666',
    },
    conversationTimestamp: {
      fontSize: 12,
      color: '#999',
      width: '25%',
      textAlign: 'right',
    },
  });

  useEffect(() => {
    let isMounted = true;
    let stream;
    let timer;
    const fetchAndStreamConversations = async () => {
      setLoading(true);
      await client.conversations.syncGroups();
      //Focusing only in group chats for now
      //let allConversations = await client.conversations.listAll();
      let allGroups = await client.conversations.listGroups();
      console.log(
        'allConversations',
        // allConversations.length,
        allGroups.length,
      );
      const combined = [...allGroups /* ...allConversations*/].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setConversations(combined);

      setLoading(false);
      client.conversations.streamAll(conversation => {
        console.log('Streamed conversation:', conversation);
        if (isMounted) {
          setConversations(prevConversations => {
            const newConversations = [...prevConversations, conversation];
            return newConversations.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
            );
          });
        }
      });

      // Delay scrolling to the bottom to allow the layout to update
      timer = setTimeout(() => {
        if (isMounted && bottomOfList.current) {
          bottomOfList.current.scrollToEnd({animated: false});
        }
      }, 0);
    };

    fetchAndStreamConversations();

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (stream) stream.return();
    };
  }, []);

  useEffect(() => {
    if (bottomOfList.current) {
      bottomOfList.current.scrollToEnd({animated: true});
    }
  }, [conversations]);

  const filteredConversations = conversations.filter(
    conversation =>
      conversation.version === 'GROUP' ||
      (conversation?.peerAddresses?.some(peerAddress =>
        peerAddress.toLowerCase().includes(searchTerm.toLowerCase()),
      ) &&
        !conversation?.peerAddresses?.includes(client.address)),
  );

  useEffect(() => {
    if (filteredConversations.length > 0) {
      onConversationFound(true);
    }
  }, [filteredConversations, onConversationFound]);

  return (
    <ScrollView ref={bottomOfList}>
      {filteredConversations.map((conversation, index) => (
        <TouchableOpacity
          key={index}
          style={styles.conversationListItem}
          onPress={() => {
            selectConversation(conversation);
          }}>
          <View style={styles.conversationDetails}>
            <Text style={styles.conversationName}>
              {conversation.version === 'GROUP'
                ? `Group (x${
                    conversation?.peerAddresses?.length
                  }) ${conversation?.peerAddresses
                    ?.map(address => `${address.substring(0, 6)}...`)
                    .join(', ')}`
                : `${conversation?.peerAddress?.substring(
                    0,
                    6,
                  )}...${conversation?.peerAddress?.substring(
                    conversation.peerAddress.length - 4,
                  )}`}
            </Text>
            <Text style={styles.messagePreview}>...</Text>
          </View>
          <Text style={styles.conversationTimestamp}>
            {getRelativeTimeLabel(conversation.createdAt)}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const getRelativeTimeLabel = dateString => {
  const diff = new Date() - new Date(dateString);
  const diffMinutes = Math.floor(diff / 1000 / 60);
  const diffHours = Math.floor(diff / 1000 / 60 / 60);
  const diffDays = Math.floor(diff / 1000 / 60 / 60 / 24);
  const diffWeeks = Math.floor(diff / 1000 / 60 / 60 / 24 / 7);

  if (diffMinutes < 60)
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
};
