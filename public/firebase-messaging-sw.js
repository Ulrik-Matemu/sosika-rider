// public/firebase-messaging-sw.js
// Give the service worker access to Firebase SDK
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js'); // Use compat versions
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by reusing the config from your main app
const firebaseConfig = {
  apiKey: "AIzaSyAf-TlhfJJfQwEgmTxN9jPm7cDmqjQmz9w",
  authDomain: "sosika-6442a.firebaseapp.com",
  projectId: "sosika-6442a",
  storageBucket: "sosika-6442a.firebasestorage.app",
  messagingSenderId: "981492231480",
  appId: "1:981492231480:web:f48eb11971394be1e5e5cd",
  measurementId: "G-H7YM628FBN"
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/144x144.png' // Optional: path to an icon for the notification
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
