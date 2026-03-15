/* ============================================
   Firebase Configuration
   Replace with your actual Firebase project config
   ============================================ */

// Firebase CDN modules are loaded via script tags in HTML.
// This file initializes Firebase and exports the services.

const firebaseConfig = {
  // ⚠️ REPLACE these with your actual Firebase project credentials
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// These will be initialized after Firebase SDK loads
let app, auth, db, storage;

function initFirebase() {
  if (typeof firebase !== 'undefined') {
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    storage = firebase.storage();
    console.log('Firebase initialized successfully');
    return true;
  }
  console.warn('Firebase SDK not loaded. Running in demo mode.');
  return false;
}

// Check if Firebase is available; if not, use demo mode
let firebaseReady = false;

document.addEventListener('DOMContentLoaded', () => {
  firebaseReady = initFirebase();
});
