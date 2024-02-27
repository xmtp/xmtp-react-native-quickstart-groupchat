import React, {useState, useEffect} from 'react';
import {StyleSheet, Alert} from 'react-native';
import {View, Text, TextInput, Button, TouchableOpacity} from 'react-native';
import {useXmtp} from '@xmtp/react-native-sdk';
const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  memberContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberText: {
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10, // Add padding here
    margin: 20,
  },
  removeIcon: {
    marginLeft: 10,
    color: 'red',
    fontWeight: 'bold',
  },
  leaveButton: {
    backgroundColor: 'red',
    color: 'white',
  },
});

export const GroupChatInfo = ({
  selectedConversation,
  resetSelectedConversation,
}) => {
  // Add a new state for the participant to be added
  const [newParticipant, setNewParticipant] = useState('');
  const {client} = useXmtp();
  const [members, setMembers] = useState([]);
  const isAdmin = client.address === selectedConversation?.adminAddress; // Assuming you have a way to determine the admin's address
  console.log(
    'isAdmin',
    isAdmin,
    client.address,
    selectedConversation.adminAddress,
  );
  const handleRemoveMember = participant => {
    if (!isAdmin) return; // Prevent non-admins from attempting to remove members

    Alert.alert(
      'Confirmation',
      `Are you sure you want to remove ${participant} from the group chat?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            await selectedConversation.removeMember([participant]);
            setMembers(members.filter(member => member !== participant));
          },
        },
      ],
    );
  };

  useEffect(() => {
    const fetchMembers = async () => {
      const members = await selectedConversation.memberAddresses(); // Fetch member addresses
      console.log('Members:', members);
      setMembers(members.filter(member => member !== client.address)); // Update state excluding the current client's address
    };

    fetchMembers().catch(console.error); // Execute the async function and catch any potential errors
  }, [selectedConversation, client.address]); // Add client.address to the dependency array if its changes should also trigger the effect

  const leaveGroupChat = () => {
    Alert.alert(
      'Confirmation',
      'Are you sure you want to leave the group chat?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            await selectedConversation.removeMember(client.address);
            setMembers(Array.from(selectedConversation.memberAddresses()));
            resetSelectedConversation(); // Add this line
          },
        },
      ],
    );
  };

  const addParticipant = () => {
    if (!isAdmin) return; // Prevent non-admins from attempting to remove members
    Alert.alert(
      'Confirmation',
      `Are you sure you want to add ${newParticipant} to the group chat?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            await selectedConversation.addMembers([newParticipant]);
            const updatedMembers = await selectedConversation.memberAddresses();
            setMembers(updatedMembers);
            setNewParticipant(''); // Clear the input
          },
        },
      ],
    );
  };

  return (
    <View>
      <Text style={styles.title}>Group Chat Info</Text>

      <Text style={{textAlign: 'center'}}>Members:</Text>
      {members.map(participant => (
        <View key={participant} style={styles.memberContainer}>
          <Text style={styles.memberText}>{participant}</Text>
          {isAdmin && (
            <TouchableOpacity
              style={styles.removeIcon}
              onPress={() => handleRemoveMember(participant)}>
              <Text style={styles.removeIcon}>X</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
      {isAdmin && (
        <>
          <TextInput
            style={styles.input}
            onChangeText={setNewParticipant}
            value={newParticipant}
            placeholder="Add a participant"
          />
          <Button title="Add Participant" onPress={addParticipant} />
        </>
      )}
      <Button
        title="Leave"
        style={styles.leaveButton}
        onPress={leaveGroupChat}
      />
    </View>
  );
};
