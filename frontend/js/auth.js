// frontend/js/auth.js
import { auth } from './firebase-init.js';
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

document.addEventListener('DOMContentLoaded', () => {
    const googleSignInButton = document.getElementById('google-signin-button');

    // This listener makes the button work
    googleSignInButton.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();

        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const idToken = await user.getIdToken();

            const userData = {
                uid: user.uid,
                email: user.email,
                name: user.displayName,
                token: idToken,
            };

            localStorage.setItem('whatsapp_clone_user', JSON.stringify(userData));
            
            // The auth-manager.js will automatically redirect to chat.html
            // But we can force it here as well for speed.
            window.location.href = 'chat.html';

        } catch (error) {
            alert("Google Sign-In Failed: " + error.message);
            console.error('Google Sign-In error:', error);
        }
    });
});