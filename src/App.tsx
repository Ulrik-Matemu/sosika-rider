
import './App.css'
import  { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import PhoneOnboarding from './pages/phoneOnboarding'
import RiderIdentityForm from './pages/riderIndentityForm'
import { Dashboard } from './pages/dashboard'
import { auth, db } from './../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from './../firebaseConfig';


function App() {
  const [loading, setLoading] = useState(true);
  const [userStatus, setUserStatus] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notificationToken, setNotificationToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ title?: string; body?: string } | null>(null);



  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        const userDocRef = doc(db, "riders", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserStatus(userDoc.data().status);
        } else {
          // This case should ideally not happen if user is authenticated but no doc exists
          // For safety, treat as onboarding_incomplete
          setUserStatus("onboarding_incomplete");
        }
      } else {
        setIsAuthenticated(false);
        setUserStatus(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Request permission and get token
    const requestPermissionAndGetToken =  async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log("Notification permission granted");
          // Get registration token. In web, this is FCM device token
          const currentToken = await getToken(messaging, {
            vapidKey: (import.meta.env as any).VITE_FIREBASE_VAPID_KEY // TODO: Add vapid key from firebase
          });

          if (currentToken) {
            console.log('FCM Reg Token: ', currentToken);
            setNotificationToken(currentToken);
            // TODO: Send this token to database
            // requires: import { setDoc, arrayUnion, serverTimestamp } from 'firebase/firestore'
            if (currentToken) {
              try {
                const currentUser = auth.currentUser;
                if (!currentUser) return;

                // Add token to rider document (keeps history of tokens and latest token)
                const riderRef = doc(db, 'riders', currentUser.uid);
                await setDoc(
                  riderRef,
                  {
                    fcmTokens: arrayUnion(currentToken),
                    lastFCMToken: currentToken,
                    notificationPermissionGrantedAt: serverTimestamp(),
                  },
                  { merge: true }
                );

                // Optionally keep a reverse lookup / token record for quick lookups
                const tokenRef = doc(db, 'riderTokens', currentToken);
                await setDoc(
                  tokenRef,
                  {
                    uid: currentUser.uid,
                    phone: currentUser.phoneNumber || null,
                    displayName: currentUser.displayName || null,
                    token: currentToken,
                    createdAt: serverTimestamp(),
                  },
                  { merge: true }
                );

                console.log('FCM token saved to Firestore');
              } catch (error) {
                console.error('Error saving FCM token to Firestore:', error);
              }
            }
          } else {
            console.log('No FCM Reg Token found');
          }
        } else {
          console.log('Unable to get permission to notify.');
        }
      } catch (error) {
        console.error("Error getting FCM Token:", error);
      }
    };

    requestPermissionAndGetToken();

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message Received', payload);
      console.log(notification, notificationToken);
      setNotification({
        title: payload.notification?.title,
        body: payload.notification?.body
      });
      // You can display an in-app notification here or use a custom UI.
    });

    return () => {
      unsubscribe(); //clean up the onMessage listener
    };
  }, []);

  // const NotificationUI = () => { 
  //   return (
  //     <>
  //     {notificationToken && <p>FCM Token: {notificationToken}</p>}
  //     {notification && (
  //       <div style={{ border: '1px solid black', padding: '10px', margin: '10px' }}>
  //         <h2>{notification.title}</h2>
  //         <p>{notification.body}</p>
  //       </div>
  //     )}
  //     </>
  //   )
  // }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading application...</p>
      </div>
    );
  }

  return (
    <>
    
    <Router>
      <Routes>
        <Route path='/' element={
          isAuthenticated ? (
            userStatus === "onboarding_incomplete" ? (
              <Navigate to="/rider-id-form" />
            ) : (
              <Navigate to="/dashboard" />
            )
          ) : (
            <PhoneOnboarding />
          )
        } />
        <Route path='/rider-id-form' element={
          isAuthenticated && userStatus === "onboarding_incomplete" ? (
            <RiderIdentityForm />
          ) : isAuthenticated ? (
            <Navigate to="/dashboard" />
          ) : (
            <Navigate to="/" />
          )
        } />
        <Route path='/dashboard' element={
          isAuthenticated && userStatus !== "onboarding_incomplete" ? (
            <Dashboard />
          ) : isAuthenticated ? (
            <Navigate to="/rider-id-form" />
          ) : (
            <Navigate to="/" />
          )
        } />
      </Routes>
    </Router>
    </>
  )
}

export default App
