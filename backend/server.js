// backend/server.js
const path = require('path'); // 1. Import the 'path' module
// 2. Create an absolute path to the .env file in the parent directory
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
console.log('Firebase Project ID Loaded:', process.env.FIREBASE_PROJECT_ID);
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// Import all necessary services and routes
const { getGeminiResponse } = require('./services/geminiService');
const { saveMessage, getMessages, getUsers, updateMessageStatusById } = require('./services/firebaseService');
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contacts');

// --- App & Server Setup ---
const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3001;

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);

// --- Presence Tracking ---
const onlineUsers = new Map(); // Tracks online users by their UID

// --- Socket.IO Real-Time Logic ---
io.on('connection', (socket) => {
    console.log(`SERVER: A user connected with socket ID: ${socket.id}`);

    // --- Presence System Events ---
    socket.on('user_online', (userId) => {
        console.log(`SERVER: User ${userId} is online.`);
        onlineUsers.set(userId, 'online');
        socket.userId = userId; // Associate user ID with this socket connection
        io.emit('presence_update', { userId, status: 'online' });
    });

    socket.on('check_presence', (otherUserId) => {
        const status = onlineUsers.get(otherUserId) || 'offline';
        socket.emit('presence_update', { userId: otherUserId, status });
    });

    // --- Chat Room and Message Events ---
    socket.on('join_room', (roomId) => {
        console.log(`SERVER: Socket ${socket.id} is joining room: ${roomId}`);
        socket.join(roomId);
        getMessages(roomId).then(history => {
            socket.emit('chat_history', history); 
        });
    });

    socket.on('send_message', async (data) => {
        const { roomId, message, author } = data;
        const messageData = { author, message, roomId, time: data.time };
        
        const messageId = await saveMessage(roomId, messageData);

        if (messageId) {
            const emittedData = { ...messageData, id: messageId, status: 'sent' };
            io.to(roomId).emit('receive_message', emittedData);
        }

        // Check for the new '@buddy' command
        if (message.toLowerCase().startsWith('@buddy')) {
            const prompt = message.replace(/@buddy/i, '').trim();
            const aiResponse = await getGeminiResponse(prompt);
            
            const botMessageData = {
                author: 'Buddy AI', // Respond with the new name
                message: aiResponse,
                roomId: roomId,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            const botMessageId = await saveMessage(roomId, botMessageData);
            if (botMessageId) {
                io.to(roomId).emit('receive_message', { ...botMessageData, id: botMessageId, status: 'sent' });
            }
        }
    });

    // --- Message Status Update Events ---
    socket.on('message_delivered', async (data) => {
        if (!data.id) return;
        await updateMessageStatusById(data.roomId, data.id, 'delivered');
        io.to(data.roomId).emit('status_updated', { ...data, status: 'delivered' });
    });

    socket.on('message_read', async (data) => {
        if (!data.id) return;
        await updateMessageStatusById(data.roomId, data.id, 'read');
        io.to(data.roomId).emit('status_updated', { ...data, status: 'read' });
    });

    // --- Disconnect Event ---
    socket.on('disconnect', () => {
        if (socket.userId) {
            onlineUsers.delete(socket.userId);
            io.emit('presence_update', { userId: socket.userId, status: 'offline' });
            console.log(`SERVER: User ${socket.userId} disconnected and is offline.`);
        } else {
            console.log(`SERVER: A guest disconnected with socket ID: ${socket.id}`);
        }
    });
});

// --- Start Server ---
server.listen(PORT, () => {
  console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
});