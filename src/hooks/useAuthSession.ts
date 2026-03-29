import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { useEffect, useMemo, useState } from 'react';
import type { RiderSession } from '../types/rider';
import { auth } from '../lib/firebase/app';
import { ensureRiderInitialized, signOutPresenceReset, subscribeToRiderSession } from '../lib/firebase/riderRepository';

interface AuthSessionState {
  authUser: User | null;
  riderSession: RiderSession | null;
  isLoading: boolean;
  error: string | null;
  signOutCurrentUser: () => Promise<void>;
}

export function useAuthSession(): AuthSessionState {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [riderSession, setRiderSession] = useState<RiderSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribeRiderSession: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      unsubscribeRiderSession?.();
      setAuthUser(user);
      setError(null);

      if (!user) {
        setRiderSession(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        await ensureRiderInitialized(user.uid, user.phoneNumber);
        unsubscribeRiderSession = subscribeToRiderSession(
          user.uid,
          (session) => {
            setRiderSession(session);
            setIsLoading(false);
          },
          (sessionError) => {
            setError(sessionError.message);
            setIsLoading(false);
          },
        );
      } catch (sessionError) {
        setError(sessionError instanceof Error ? sessionError.message : 'Failed to initialize rider session.');
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribeRiderSession?.();
      unsubscribeAuth();
    };
  }, []);

  const signOutCurrentUser = useMemo(
    () => async () => {
      if (auth.currentUser) {
        await signOutPresenceReset(auth.currentUser.uid);
      }

      await signOut(auth);
    },
    [],
  );

  return { authUser, riderSession, isLoading, error, signOutCurrentUser };
}
