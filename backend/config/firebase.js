// backend/config/firebase.js
const admin = require('firebase-admin');

// IMPORTANT: Place the 'serviceAccountKey.json' you downloaded from Firebase
// in this same 'config' directory.
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = { db, auth };