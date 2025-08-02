// backend/middleware/auth.js
const { auth } = require('../config/firebase');

// This function will verify a token sent from the frontend.
async function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
        return res.status(401).send({ message: 'No token provided. Unauthorized.' });
    }

    try {
        // Use Firebase Admin to verify the token
        const decodedToken = await auth.verifyIdToken(token);
        req.user = decodedToken; // Add user info to the request object
        next(); // Token is valid, proceed to the next handler
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(403).send({ message: 'Invalid token. Forbidden.' });
    }
}

module.exports = { verifyToken };