// frontend/js/chat.js

import { fetchAndRenderContacts } from './contacts.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. INITIAL SETUP & USER VERIFICATION ---
    const user = JSON.parse(localStorage.getItem('whatsapp_clone_user'));
    if (!user || !user.token) {
        window.location.href = 'login.html';
        return;
    }

    // --- 2. DOM ELEMENT GETTERS ---
    const welcomeScreen = document.getElementById('welcome-screen');
    const chatContent = document.getElementById('chat-content');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const messageContainer = document.getElementById('message-container');
    const chatWithName = document.getElementById('chat-with-name');
    const chatWithStatus = document.getElementById('chat-with-status');
    const currentUserNameElement = document.getElementById('current-user-name');

    // --- 3. INITIALIZE UI & STATE ---
    
    if (currentUserNameElement) {
        currentUserNameElement.textContent = user.name || user.email.split('@')[0];
    }

    const socket = io('http://localhost:3001');
    let currentRoomId = null;
    let currentContact = null;
    let readObserver;

    // --- 4. RENDERING FUNCTIONS ---

    const renderMyMessage = (data) => {
        const existingMessage = document.getElementById(data.id);
        if (existingMessage) {
            const ticks = existingMessage.querySelector('.status-ticks');
            if (ticks) {
                ticks.innerHTML = data.status === 'sent' ? '✓' : '✓✓';
                ticks.className = `status-ticks ${data.status}`;
            }
            return;
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = 'message my-message';
        messageDiv.id = data.id;
        
        messageDiv.innerHTML = `
            <div class="message-bubble">
                ${!data.type ? `<span>${data.message}</span>` : ''}
                <div class="message-info">
                    ${data.time}
                    <span class="status-ticks ${data.status}">${data.status === 'sent' ? '✓' : '✓✓'}</span>
                </div>
            </div>
        `;
        messageContainer.appendChild(messageDiv);
    };

    const renderOtherMessage = (data) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message other-message';
        messageDiv.id = data.id;
        messageDiv.dataset.messageData = JSON.stringify(data);

        // Check if the author is an object (a real user) or a string (the bot).
        const authorName = typeof data.author === 'object' ? data.author.name : data.author;

        messageDiv.innerHTML = `
            <div class="message-bubble">
                <strong>${authorName}</strong><br>
                ${!data.type ? `<span>${data.message}</span>` : ''}
                <div class="message-info">${data.time}</div>
            </div>
        `;
        messageContainer.appendChild(messageDiv);

        // We only send delivery/read receipts for messages from real users.
        if (typeof data.author === 'object') {
            socket.emit('message_delivered', { id: data.id, roomId: data.roomId, author: data.author });
            if (readObserver) readObserver.observe(messageDiv);
        }
    };

    // --- 5. CORE LOGIC ---

    const setupReadObserver = () => {
        readObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.isRead) {
                    const messageData = JSON.parse(entry.target.dataset.messageData);
                    socket.emit('message_read', { id: messageData.id, roomId: messageData.roomId, author: messageData.author });
                    entry.target.dataset.isRead = 'true';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.8 });
    };
    
    window.switchToChat = (contact) => {
        const newRoomId = [user.uid, contact.uid].sort().join('_');
        if (newRoomId === currentRoomId) return;
        
        currentRoomId = newRoomId;
        currentContact = contact;
        
        welcomeScreen.classList.add('hidden');
        chatContent.classList.remove('hidden');
        chatWithName.textContent = contact.name;
        chatWithStatus.textContent = '...';
        messageContainer.innerHTML = '<h4>Loading chat...</h4>';
        
        document.querySelectorAll('.contact-item').forEach(c => c.classList.remove('active'));
        const contactElement = [...document.querySelectorAll('.contact-item')].find(el => JSON.parse(el.dataset.contactInfo).uid === contact.uid);
        if (contactElement) contactElement.classList.add('active');

        socket.emit('join_room', currentRoomId);
        socket.emit('check_presence', contact.uid);
    };

    const sendMessage = () => {
        const messageText = messageInput.value.trim();
        if (messageText === '' || !currentRoomId) return;
        
        const messageData = {
            roomId: currentRoomId,
            author: { uid: user.uid, email: user.email, name: user.email.split('@')[0] },
            message: messageText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        socket.emit('send_message', messageData);
        messageInput.value = '';
    };

    // --- 6. SOCKET EVENT LISTENERS ---

    socket.on('connect', () => {
        socket.emit('user_online', user.uid);
        fetchAndRenderContacts();
        setupReadObserver();
    });

    socket.on('chat_history', (history) => {
        messageContainer.innerHTML = '';
        history.forEach(messageData => {
            if (messageData.author.uid === user.uid) {
                renderMyMessage(messageData);
            } else {
                renderOtherMessage(messageData);
            }
        });
        messageContainer.scrollTop = messageContainer.scrollHeight;
    });

    socket.on('receive_message', (data) => {
        if (data.roomId === currentRoomId) {
            if (data.author.uid === user.uid) {
                renderMyMessage(data);
            } else {
                renderOtherMessage(data);
            }
            messageContainer.scrollTop = messageContainer.scrollHeight;
        }
    });
    
    socket.on('status_updated', (data) => {
        if (data.author.uid === user.uid) {
            renderMyMessage(data);
        }
    });

    socket.on('presence_update', (data) => {
        if (currentContact && currentContact.uid === data.userId) {
            chatWithStatus.textContent = data.status;
        }
    });

    // --- 7. UI EVENT BINDINGS ---
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => e.key === 'Enter' && sendMessage());
});

// ===================================================================
//  THEME TOGGLE SCRIPT
// ===================================================================
const themeToggle = document.getElementById('theme-checkbox');
if (themeToggle) {
    const currentTheme = localStorage.getItem('theme');

    // Apply the saved theme on initial load
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        if (currentTheme === 'dark') {
            themeToggle.checked = true;
        }
    }

    // Listen for changes on the toggle
    themeToggle.addEventListener('change', function(e) {
        if (e.target.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });
}