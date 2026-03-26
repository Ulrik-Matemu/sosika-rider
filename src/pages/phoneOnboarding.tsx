import React, { useState, useEffect, useRef } from 'react';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import type { ConfirmationResult } from "firebase/auth";
import { auth, db } from "./../../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';

const PhoneOnboarding: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState("+255"); 
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Use a ref to store the verifier to persist across re-renders
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    // Initialize Recaptcha once when component mounts
    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: "invisible",
        callback: () => {
          console.log("Recaptcha resolved");
        },
        'expired-callback': () => {
          console.log("Recaptcha expired, resetting...");
          recaptchaVerifierRef.current?.render().then((widgetId) => {
            (window as any).grecaptcha.reset(widgetId);
          });
        }
      });
    }

    

    // Cleanup on unmount
    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  const onSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recaptchaVerifierRef.current) return;
    
    setLoading(true);

    try {
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifierRef.current);
      setConfirmationResult(confirmation);
      alert("OTP sent to " + phoneNumber);
    } catch (error: any) {
      console.error("SMS Error:", error);
      
      // Reset recaptcha on error to allow retry
      recaptchaVerifierRef.current.render().then((widgetId) => {
        (window as any).grecaptcha.reset(widgetId);
      });

      if (error.code === 'auth/invalid-app-credential') {
        alert("Verification failed. Please refresh the page and try again.");
      } else {
        alert("Failed to send SMS: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await confirmationResult?.confirm(otp);
      const user = result?.user;

      if (user) {
        const userDocRef = doc(db, "riders", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            phoneNumber: user.phoneNumber,
            role: "rider",
            status: "onboarding_incomplete",
            createdAt: new Date().toISOString(),
          });
        }
        alert("Login Successful!");
        // Navigation logic for your PWA goes here (e.g., useNavigate to /upload)
        navigate("/rider-id-form");

      }
    } catch (error) {
      console.error("Verification Error:", error);
      alert("Invalid OTP code.");
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="flex flex-col items-center justify-center p-6 min-h-screen bg-gray-50 font-sans">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Rider Registration</h2>

        {!confirmationResult ? (
          <form onSubmit={onSendOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+255 700 000 000"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                required
              />
            </div>
            {/* The container MUST be inside the form or reachable in the DOM */}
            <div id="recaptcha-container"></div>
            
            <button
              disabled={loading}
              className="w-full bg-black text-white p-3 rounded-lg font-bold hover:bg-gray-800 transition disabled:bg-gray-400"
            >
              {loading ? "Sending SMS..." : "Get Verification Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={onVerifyOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">6-Digit Code</label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                className="w-full p-3 border border-gray-300 rounded-lg text-center tracking-[0.5em] text-xl font-bold outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              disabled={loading}
              className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmationResult(null)}
              className="w-full text-sm text-gray-500 hover:text-black transition"
            >
              Entered wrong number? Edit
            </button>
          </form>
        )}
      </div>
      <p className="mt-8 text-xs text-gray-400">By continuing, you agree to Sosika terms and conditions.</p>
    </div>
  );
};

export default PhoneOnboarding;