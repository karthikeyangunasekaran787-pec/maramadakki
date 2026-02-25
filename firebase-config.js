// firebase-config.js
// Firebase initialization for Maramadakki website.
// Create a Firebase project at https://console.firebase.google.com/ and
// copy your configuration values into the object below.  This file is
// included by both the public site and the admin panel.

// Example configuration (replace with your own):
// const firebaseConfig = {
//   apiKey: "AIza...",
//   authDomain: "your-project.firebaseapp.com",
//   databaseURL: "https://your-project.firebaseio.com",
//   projectId: "your-project",
//   storageBucket: "your-project.appspot.com",
//   messagingSenderId: "1234567890",
//   appId: "1:1234567890:web:abcdef123456",
// };

// replace these values with your own Firebase project's settings
const firebaseConfig = {
  apiKey: "AIzaSyDIpdiakVDZl4pJW9-tpPGskGjI9aRjoes",
  authDomain: "maramadakki-community-page.firebaseapp.com",
  databaseURL: "https://maramadakki-community-page.firebaseio.com",
  projectId: "maramadakki-community-page",
  storageBucket: "maramadakki-community-page.firebasestorage.app",
  messagingSenderId: "622990135347",
  appId: "1:622990135347:web:67174962fb8ae29b635346",
};

if (typeof firebase !== 'undefined') {
  firebase.initializeApp(firebaseConfig);
  var firebaseDB = firebase.database();
} else {
  console.warn('Firebase SDK not loaded; remote backend disabled.');
}
