const express = require('express');
const { db } = require('../config/firebase');
const router = express.Router();

// Get chat messages
router.get('/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const messagesRef = db.collection('chats').doc(chatId).collection('messages');
    const snapshot = await messagesRef.orderBy('timestamp', 'asc').get();
    
    const messages = [];
    snapshot.forEach(doc => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send message
router.post('/:chatId/message', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { senderId, text, type = 'text', mediaUrl } = req.body;
    
    const messageData = {
      senderId,
      text,
      type,
      mediaUrl: mediaUrl || null,
      timestamp: new Date(),
      status: 'sent'
    };
    
    const messageRef = await db.collection('chats').doc(chatId).collection('messages').add(messageData);
    
    // Update chat last message
    await db.collection('chats').doc(chatId).update({
      lastMessage: text,
      lastMessageTime: new Date()
    });
    
    res.json({ success: true, messageId: messageRef.id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new chat
router.post('/create', async (req, res) => {
  try {
    const { participants, type = 'direct' } = req.body;
    
    const chatData = {
      participants,
      type,
      createdAt: new Date(),
      lastMessage: '',
      lastMessageTime: new Date()
    };
    
    const chatRef = await db.collection('chats').add(chatData);
    res.json({ success: true, chatId: chatRef.id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user chats
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const chatsRef = db.collection('chats');
    const snapshot = await chatsRef.where('participants', 'array-contains', userId).get();
    
    const chats = [];
    snapshot.forEach(doc => {
      chats.push({ id: doc.id, ...doc.data() });
    });
    
    res.json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;