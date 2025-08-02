// backend/routes/auth.js
const express = require('express');
const { auth } = require('../config/firebase');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }

    try {
        let userRecord;
        try {
            // Check if the user already exists
            userRecord = await auth.getUserByEmail(email);
        } catch (error) {
            // If user not found, create a new one
            if (error.code === 'auth/user-not-found') {
                console.log(`User not found for ${email}, creating new user.`);
                userRecord = await auth.createUser({
                    email: email,
                    emailVerified: true, // You might want this to be false in a real app
                });
            } else {
                // For other errors, re-throw
                throw error;
            }
        }
        
        // Create a custom authentication token for the user
        const customToken = await auth.createCustomToken(userRecord.uid);
        
        console.log(`Successfully created token for UID: ${userRecord.uid}`);
        
        // Send the token and user info back to the frontend
        res.status(200).json({
            token: customToken,
            uid: userRecord.uid,
            email: userRecord.email
        });

    } catch (error) {
        console.error('Error during login/signup:', error);
        res.status(500).json({ message: 'An internal server error occurred.' });
    }
});

module.exports = router;