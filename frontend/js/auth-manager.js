// frontend/js/auth-manager.js
import { auth } from './firebase-init.js';
import { onIdTokenChanged } from "firebase/auth";

export function initializeAuthListener() {
    onIdTokenChanged(auth, async (user) => {
        if (user) {
            // User is signed in or token was refreshed.
            console.log("Auth state changed. Getting fresh ID token.");
            const idToken = await user.getIdToken(true); // 'true' forces a refresh if needed

            // Get the existing user data from localStorage
            const userData = JSON.parse(localStorage.getItem('whatsapp_clone_user'));
            
            // Update the token in the userData object and save it back
            if (userData) {
                userData.token = idToken;
                localStorage.setItem('whatsapp_clone_user', JSON.stringify(userData));
                console.log("Token in localStorage has been refreshed.");
            }
        } else {
            // User is signed out.
            console.log("User is signed out.");
            localStorage.removeItem('whatsapp_clone_user');
            // Optionally, redirect to login page if not already there
            if (window.location.hash !== '#login') {
                window.location.hash = '#login';
            }
        }
    });
}