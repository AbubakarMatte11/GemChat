// frontend/js/firebase-init.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB9IS0K1AAo6h1esjUwh2b7SoHrsf78sgU",
  authDomain: "whatsapp-clone-danish.firebaseapp.com",
  projectId: "whatsapp-clone-danish",
  storageBucket: "whatsapp-clone-danish.firebasestorage.app",
  messagingSenderId: "362571063307",
  appId: "1:362571063307:web:ebd9967fb94f34a991a70e",
  measurementId: "G-BM2DYV92PK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export only the services we are actually using
export const auth = getAuth(app);