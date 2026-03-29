import { getToken, onMessage } from 'firebase/messaging';
import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { getMessagingClient } from '../../../lib/firebase/app';
import { saveNotificationToken } from '../../../lib/firebase/notifications';

export function usePushNotifications(user: User | null) {
  const [notification, setNotification] = useState<{ title?: string; body?: string } | null>(null);

  useEffect(() => {
    if (!user || typeof Notification === 'undefined') {
      return;
    }

    let unsubscribeForeground: (() => void) | undefined;

    void (async () => {
      const messaging = await getMessagingClient();
      if (!messaging) {
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return;
      }

      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      if (!vapidKey) {
        return;
      }

      const token = await getToken(messaging, { vapidKey });
      if (token) {
        await saveNotificationToken(user.uid, token, permission);
      }

      unsubscribeForeground = onMessage(messaging, (payload) => {
        setNotification({
          title: payload.notification?.title,
          body: payload.notification?.body,
        });
      });
    })();

    return () => {
      unsubscribeForeground?.();
    };
  }, [user]);

  return { notification };
}
