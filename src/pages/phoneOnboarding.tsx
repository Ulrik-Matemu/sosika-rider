import React, { useState } from 'react';
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
} from "firebase/auth";
import type { ConfirmationResult } from "firebase/auth";
import { auth, db } from "./../../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

const PhoneOnboarding: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState("+255"); // Default TZ prefix
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize Recaptcha
  const setupRecaptcha = (containerId: string) => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: "invisible",
      });
    }
  };

  const onSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setupRecaptcha("recaptcha-container");
    
    const appVerifier = (window as any).recaptchaVerifier;

    try {
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      alert("OTP sent to " + phoneNumber);
    } catch (error) {
      console.error("SMS Error:", error);
      alert("Failed to send SMS. Check phone format.");
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
        // Check if rider already exists in Firestore, if not, create initial profile
        const userDoc = await getDoc(doc(db, "riders", user.uid));
        if (!userDoc.exists()) {
          await setDoc(doc(db, "riders", user.uid), {
            phoneNumber: user.phoneNumber,
            role: "rider",
            status: "onboarding_incomplete",
            createdAt: new Date().toISOString(),
          });
        }
        // Redirect to Document Upload page or next step
        alert("Login Successful!");
      }
    } catch (error) {
      alert("Invalid OTP code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 min-h-screen bg-gray-50">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Rider Registration</h2>
        
        {!confirmationResult ? (
          <form onSubmit={onSendOTP} className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Enter Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+255 700 000 000"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            <div id="recaptcha-container"></div>
            <button
              disabled={loading}
              className="w-full bg-black text-white p-3 rounded-lg font-bold hover:opacity-90 transition"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={onVerifyOTP} className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Enter 6-digit Code</label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              className="w-full p-3 border rounded-lg text-center tracking-widest text-xl outline-none"
              required
            />
            <button
              disabled={loading}
              className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold transition"
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>
            <button 
              type="button"
              onClick={() => setConfirmationResult(null)}
              className="w-full text-sm text-gray-500 hover:underline"
            >
              Change phone number
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PhoneOnboarding;