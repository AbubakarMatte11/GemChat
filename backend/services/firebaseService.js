// backend/services/firebaseService.js
const { db, auth } = require('../config/firebase');

/**
 * Finds a specific message by its unique ID and updates its status.
 * @param {string} roomId - The ID of the chat room.
 * @param {string} messageId - The unique ID of the message document.
 * @param {string} newStatus - The new status ('delivered' or 'read').
 */
async function updateMessageStatusById(roomId, messageId, newStatus) {
    try {
        const messageRef = db.collection('chats').doc(roomId)
            .collection('messages').doc(messageId);
        
        await messageRef.update({ status: newStatus });
        console.log(`Status updated to '${newStatus}' for message ${messageId}`);
    } catch (error) {
        console.error("Error updating message status by ID:", error);
    }
}

/**
 * Saves a chat message to Firestore and returns the new document's unique ID.
 * @param {string} roomId - The ID of the chat room.
 * @param {object} messageData - The message object to save.
 * @returns {Promise<string|null>} The new message's ID, or null on failure.
 */
async function saveMessage(roomId, messageData) {
    try {
        const roomRef = db.collection('chats').doc(roomId).collection('messages');
        const messageToSave = {
            ...messageData,
            status: 'sent',
            timestamp: new Date()
        };
        const newDocRef = await roomRef.add(messageToSave);
        console.log(`Message saved with ID: ${newDocRef.id}`);
        return newDocRef.id; // Return the new document's ID
    } catch (error) {
        console.error("Error saving message to Firestore:", error);
        return null;
    }
}

/**
 * Fetches historical messages for a given room from Firestore.
 * @param {string} roomId - The ID of the chat room.
 * @returns {Promise<Array>} An array of message objects.
 */
async function getMessages(roomId) {
    try {
        const messages = [];
        const querySnapshot = await db.collection('chats').doc(roomId)
            .collection('messages')
            .orderBy('timestamp', 'asc')
            .limit(50)
            .get();
            
        querySnapshot.forEach(doc => {
            // Include the document ID with the message data
            messages.push({ id: doc.id, ...doc.data() });
        });
        
        console.log(`Fetched ${messages.length} messages for room: ${roomId}`);
        return messages;
    } catch (error) {
        console.error("Error fetching messages from Firestore:", error);
        return [];
    }
}

/**
 * Fetches a list of all users from Firebase Auth.
 * @returns {Promise<Array>} A simplified list of user objects.
 */
async function getUsers() {
    try {
        const userRecords = await auth.listUsers(1000);
        const users = userRecords.users.map(user => ({
            uid: user.uid,
            email: user.email,
            name: user.displayName || user.email.split('@')[0],
        }));
        return users;
    } catch (error) {
        console.error("Error listing users:", error);
        return [];
    }
}

// Export all the necessary functions for the application.
module.exports = { saveMessage, getMessages, getUsers, updateMessageStatusById };