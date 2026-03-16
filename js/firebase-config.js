/* ============================================
   Firebase Configuration
   Replace with your actual Firebase project config
   ============================================ */

// Firebase CDN modules are loaded via script tags in HTML.
// This file initializes Firebase and exports the services.

const firebaseConfig = {
  apiKey: "AIzaSyDAQ3xOLPSiTilvGAGwT0EqBonPYMscRnc",
  authDomain: "lmsforlibary.firebaseapp.com",
  projectId: "lmsforlibary",
  storageBucket: "lmsforlibary.firebasestorage.app",
  messagingSenderId: "202169542518",
  appId: "1:202169542518:web:1221d3be2308970b1e3c57"
};

// These will be initialized after Firebase SDK loads
let app, auth, db, storage;

function initFirebase() {
  if (typeof firebase !== 'undefined') {
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    if (typeof firebase.storage === 'function') {
      storage = firebase.storage();
    }
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
