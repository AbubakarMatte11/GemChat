// frontend/js/app.js
document.addEventListener('DOMContentLoaded', () => {
    // We'll use localStorage to simulate a user session.
    // In a real app, this would be a secure JWT token.
    const userIsLoggedIn = localStorage.getItem('whatsapp_clone_user');

    if (userIsLoggedIn) {
        // If user data exists, go to the chat page.
        window.location.href = 'pages/chat.html';
    } else {
        // Otherwise, go to the login page.
        window.location.href = 'pages/login.html';
    }
});