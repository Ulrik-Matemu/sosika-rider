import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';
import { useEffect, useRef, useState } from 'react';
import { auth } from '../../../lib/firebase/app';
import { validateOtpCode, validatePhoneNumber } from '../../../utils/validation';

export function usePhoneAuth() {
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }

    return () => {
      recaptchaVerifierRef.current?.clear();
      recaptchaVerifierRef.current = null;
    };
  }, []);

  async function sendOtp(phoneNumber: string) {
    const phoneError = validatePhoneNumber(phoneNumber);
    if (phoneError) {
      setError(phoneError);
      return false;
    }

    if (!recaptchaVerifierRef.current) {
      setError('Recaptcha failed to initialize. Refresh and try again.');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifierRef.current);
      setConfirmationResult(result);
      return true;
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to send verification code.');
      const widgetId = await recaptchaVerifierRef.current.render();
      (window as Window & typeof globalThis & { grecaptcha?: { reset: (id: number) => void } }).grecaptcha?.reset(widgetId);
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(otp: string) {
    const otpError = validateOtpCode(otp);
    if (otpError) {
      setError(otpError);
      return false;
    }

    if (!confirmationResult) {
      setError('Request a verification code first.');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      await confirmationResult.confirm(otp);
      return true;
    } catch (verificationError) {
      setError(verificationError instanceof Error ? verificationError.message : 'Invalid verification code.');
      return false;
    } finally {
      setLoading(false);
    }
  }

  return {
    confirmationResult,
    loading,
    error,
    clearCodeRequest: () => setConfirmationResult(null),
    clearError: () => setError(null),
    sendOtp,
    verifyOtp,
  };
}
