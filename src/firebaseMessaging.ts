// import { initializeApp } from "firebase/app";
// import { getMessaging, getToken, onMessage } from "firebase/messaging";
// import { app } from "./../firebaseConfig"; // Assuming app is exported from firebaseConfig.ts

// const messaging = getMessaging(app);

// export const requestForToken = async () => {
//   try {
//     const permission = await Notification.requestPermission();
//     if (permission === "granted") {
//       const currentToken = await getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY });
//       if (currentToken) {
//         console.log("FCM registration token:", currentToken);
//         // TODO: Send this token to your backend server to save it for sending notifications
//         return currentToken;
//       } else {
//         console.log("No registration token available. Request permission to generate one.");
//         return null;
//       }
//     } else {
//       console.log("Notification permission denied.");
//       return null;
//     }
//   } catch (err) {
//     console.error("An error occurred while retrieving token:", err);
//     return null;
//   }
// };

// export const onMessageListener = () =>
//   new Promise((resolve) => {
//     onMessage(messaging, (payload) => {
//       console.log("Foreground message received:", payload);
//       resolve(payload);
//     });
//   });
