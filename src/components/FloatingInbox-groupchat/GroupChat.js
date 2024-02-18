import {EventEmitter} from 'fbemitter';

class Message {
  constructor(text, sender) {
    this.id = `msg-${Date.now()}`; // Unique ID for the group chat
    this.text = text;
    this.senderAddress = sender; // New property for the sender of the message
    this.sent = new Date();
  }

  content() {
    return this.text;
  }
}

export class GroupChat {
  isGroupChat = true;
  static groupChats = []; // Static property to hold all group chats

  constructor(participants) {
    this.eventEmitter = new EventEmitter();

    this.id = `group-${Date.now()}`; // Unique ID for the group chat
    this.participants = participants;
    this.peerAddress = Array.from(participants)[0];
    this.msgArray = [];
    this.createdAt = new Date();
    GroupChat.groupChats.push(this); // Add this group chat to the array
  }

  streamMessages(callback) {
    // Immediately call the callback for each existing message
    this.msgArray.forEach(message => callback(message));
    this.eventEmitter.addListener('newMessage', callback);
  }
  async sendMessage(text) {
    const participantsArray = Array.from(this.participants);
    const randomParticipant =
      participantsArray[Math.floor(Math.random() * participantsArray.length)]; // Select a random participant

    const message = new Message(text, randomParticipant);
    this.msgArray.push(message);
    this.eventEmitter.emit('newMessage', message); // Emit an event whenever a new message is sent
    return this.msgArray;
  }

  async messages() {
    return this.msgArray;
  }
  getMessages() {
    return this.msgArray;
  }

  static addGroupChat(groupChat) {
    GroupChat.groupChats.push(groupChat);
  }

  static removeGroupChat(id) {
    GroupChat.groupChats = GroupChat.groupChats.filter(chat => chat.id !== id);
  }

  static getAllGroupChats() {
    return GroupChat.groupChats;
  }
  // Method to add members
  addMembers(members) {
    members.forEach(member => this.participants.add(member));
  }
  // Method to remove members
  removeMembers(members) {
    members.forEach(member => this.participants.delete(member));
  }

  // Method to list all members
  memberAddresses() {
    return this.participants;
  }

  // Method for a member to leave
  leave(member) {
    this.removeMember(member);
  }
  static getGroupChatById(id) {
    return GroupChat.groupChats.find(chat => chat.id === id) || null;
  }
}
