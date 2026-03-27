
import './App.css'
import  { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import PhoneOnboarding from './pages/phoneOnboarding'
import RiderIdentityForm from './pages/riderIndentityForm'
import { Dashboard } from './pages/dashboard'
import { auth, db } from './../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

function App() {
  const [loading, setLoading] = useState(true);
  const [userStatus, setUserStatus] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
