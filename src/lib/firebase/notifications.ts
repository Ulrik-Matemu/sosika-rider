import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import type { RiderNotificationToken } from '../../types/rider';
import { buildTokenDocumentId } from '../../utils/format';
import { db } from './app';

export async function saveNotificationToken(uid: string, token: string, permission: NotificationPermission) {
  const tokenId = buildTokenDocumentId(token);
  const tokenRef = doc(db, 'rider_notification_tokens', tokenId);
  const payload: RiderNotificationToken = {
    uid,
    token,
    platform: 'web',
    permission,
    userAgent: navigator.userAgent,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastSeenAt: serverTimestamp(),
  };

  await setDoc(tokenRef, payload, { merge: true });
}
