// frontend/js/auth.js
import { auth } from './firebase-init.js';
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

document.addEventListener('DOMContentLoaded', () => {
    const googleSignInButton = document.getElementById('google-signin-button');

    googleSignInButton.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider(); // Create a new Google Auth provider instance

        try {
            // Step 1: Trigger the Google Sign-In pop-up
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            console.log("Successfully signed in with Google!");

            // Step 2: Get the ID Token from the signed-in user
            const idToken = await user.getIdToken();
            console.log("Got ID Token!");

            // Step 3: Store the necessary user data and the ID Token
            const userData = {
                uid: user.uid,
                email: user.email,
                name: user.displayName,
                token: idToken, // This is the token our backend can verify
            };

            localStorage.setItem('whatsapp_clone_user', JSON.stringify(userData));
            console.log("User data saved to localStorage. Redirecting...");

            // Step 4: Redirect to the chat app
            window.location.href = 'chat.html';

        } catch (error) {
            alert("Google Sign-In Failed: " + error.message);
            console.error('Google Sign-In error:', error);
        }
    });
});