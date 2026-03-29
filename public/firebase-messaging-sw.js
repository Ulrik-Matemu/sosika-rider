// public/firebase-messaging-sw.js
// Keep this config aligned with the same Firebase project used by the web app.
// Vite env vars are not injected into files under /public, so this file must be
// updated manually when the Firebase project changes.
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
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
  const notificationTitle = payload.notification?.title || 'Sosika Rider';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new rider update.',
    icon: '/icons/144x144.png',
    data: payload.data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/dashboard'));
});
