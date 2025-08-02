// frontend/js/profile.js
document.addEventListener('DOMContentLoaded', () => {
    // Get user data from browser storage
    const user = JSON.parse(localStorage.getItem('whatsapp_clone_user'));

    // If no user is logged in, redirect to the login page
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Find the HTML elements
    const userNameElement = document.getElementById('user-name');
    const userEmailElement = document.getElementById('user-email');

    // Populate the elements with the user's data
    if (userNameElement) {
        userNameElement.textContent = user.name || 'Not set';
    }
    if (userEmailElement) {
        userEmailElement.textContent = user.email;
    }
});