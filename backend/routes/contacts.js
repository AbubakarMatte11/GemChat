// backend/routes/contacts.js
const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { getUsers } = require('../services/firebaseService');

const router = express.Router();

// GET /api/contacts - Fetches all users
// This route is protected, meaning a valid token is required.
router.get('/', verifyToken, async (req, res) => {
    try {
        const allUsers = await getUsers();
        // Filter out the currently logged-in user from the list
        const otherUsers = allUsers.filter(user => user.uid !== req.user.uid);
        res.status(200).json(otherUsers);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users.' });
    }
});

module.exports = router;