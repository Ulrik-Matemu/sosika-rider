import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { APP_VERSION } from '../../constants/app';
import type {
  OnboardingDraftInput,
  RiderDocuments,
  RiderProfile,
  RiderPresence,
  RiderReviewLogEvent,
  RiderSession,
  VerificationStatus,
} from '../../types/rider';
import { getCompletionPercent, normalizeName, normalizePlateNumber } from '../../utils/format';
import { db } from './app';

const ridersCollection = collection(db, 'riders');
const riderDocumentsCollection = collection(db, 'rider_documents');
const riderPresenceCollection = collection(db, 'rider_presence');

export function riderDocRef(uid: string) {
  return doc(ridersCollection, uid);
}

export function riderDocumentsRef(uid: string) {
  return doc(riderDocumentsCollection, uid);
}

export function riderPresenceRef(uid: string) {
  return doc(riderPresenceCollection, uid);
}

function reviewLogsCollection(uid: string) {
  return collection(db, 'rider_review_logs', uid, 'events');
}

export function buildDefaultRiderProfile(uid: string, phoneNumber: string | null): RiderProfile {
  return {
    uid,
    phoneNumber,
    role: 'rider',
    fullName: '',
    verificationStatus: 'draft',
    onboardingStep: 'personal_info',
    profileCompletionPercent: 0,
    isSuspended: false,
    availabilityState: 'offline',
    suspensionReason: null,
    reviewNotes: null,
    currentAppVersion: APP_VERSION,
  };
}

export function buildDefaultRiderDocuments(uid: string): RiderDocuments {
  return {
    uid,
    nidaNumber: '',
    plateNumber: '',
    vehicleType: 'bodaboda',
    nidaImage: null,
    licenseImage: null,
    selfieImage: null,
    uploadMetadata: {},
    resubmissionCount: 0,
  };
}

export async function ensureRiderInitialized(uid: string, phoneNumber: string | null) {
  await runTransaction(db, async (transaction) => {
    const riderRef = riderDocRef(uid);
    const docsRef = riderDocumentsRef(uid);
    const presenceRef = riderPresenceRef(uid);

    const [riderSnap, docsSnap, presenceSnap] = await Promise.all([
      transaction.get(riderRef),
      transaction.get(docsRef),
      transaction.get(presenceRef),
    ]);

    if (!riderSnap.exists()) {
      transaction.set(riderRef, {
        ...buildDefaultRiderProfile(uid, phoneNumber),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else if (!riderSnap.data().phoneNumber && phoneNumber) {
      transaction.update(riderRef, {
        phoneNumber,
        updatedAt: serverTimestamp(),
      });
    }

    if (!docsSnap.exists()) {
      transaction.set(docsRef, {
        ...buildDefaultRiderDocuments(uid),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    if (!presenceSnap.exists()) {
      transaction.set(presenceRef, {
        uid,
        isOnline: false,
        availabilityState: 'offline',
        lat: null,
        lng: null,
        heading: null,
        speed: null,
        batteryLevel: null,
        networkStatus: null,
        activeDeliveryType: null,
        lastSeenAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  });
}

export function subscribeToRiderSession(
  uid: string,
  onData: (session: RiderSession) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  let rider = buildDefaultRiderProfile(uid, null);
  let documents = buildDefaultRiderDocuments(uid);
  let presence: RiderPresence | null = null;

  const emit = () => onData({ rider, documents, presence });

  const unsubscribers = [
    onSnapshot(
      riderDocRef(uid),
      (snapshot) => {
        if (snapshot.exists()) {
          rider = {
            ...buildDefaultRiderProfile(uid, null),
            ...(snapshot.data() as Partial<RiderProfile>),
          };
          emit();
        }
      },
      (error) => onError(error),
    ),
    onSnapshot(
      riderDocumentsRef(uid),
      (snapshot) => {
        if (snapshot.exists()) {
          documents = {
            ...buildDefaultRiderDocuments(uid),
            ...(snapshot.data() as Partial<RiderDocuments>),
          };
          emit();
        }
      },
      (error) => onError(error),
    ),
    onSnapshot(
      riderPresenceRef(uid),
      (snapshot) => {
        presence = snapshot.exists() ? ({ ...(snapshot.data() as RiderPresence) } as RiderPresence) : null;
        emit();
      },
      (error) => onError(error),
    ),
  ];

  return () => {
    for (const unsubscribe of unsubscribers) {
      unsubscribe();
    }
  };
}

export async function updateRiderDraft(uid: string, values: OnboardingDraftInput, onboardingStep: RiderProfile['onboardingStep']) {
  const completionPercent = getCompletionPercent([
    normalizeName(values.fullName).length >= 3,
    values.nidaNumber.trim().length >= 8,
    normalizePlateNumber(values.plateNumber).length >= 5,
  ]);

  await Promise.all([
    setDoc(
      riderDocRef(uid),
      {
        fullName: normalizeName(values.fullName),
        onboardingStep,
        profileCompletionPercent: completionPercent,
        currentAppVersion: APP_VERSION,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    ),
    setDoc(
      riderDocumentsRef(uid),
      {
        nidaNumber: values.nidaNumber.trim(),
        plateNumber: normalizePlateNumber(values.plateNumber),
        vehicleType: values.vehicleType || 'bodaboda',
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    ),
  ]);
}

export async function updateRiderDocumentsDraft(uid: string, payload: Partial<RiderDocuments>) {
  const currentRef = riderDocRef(uid);

  await Promise.all([
    setDoc(
      riderDocumentsRef(uid),
      {
        ...payload,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    ),
    setDoc(
      currentRef,
      {
        onboardingStep: 'documents',
        currentAppVersion: APP_VERSION,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    ),
  ]);
}

export async function submitRiderForReview(uid: string, note?: string, previousStatus?: VerificationStatus) {
  const riderRef = riderDocRef(uid);
  const docsRef = riderDocumentsRef(uid);
  const eventRef = doc(reviewLogsCollection(uid));

  await runTransaction(db, async (transaction) => {
    const riderSnap = await transaction.get(riderRef);
    const docsSnap = await transaction.get(docsRef);

    if (!riderSnap.exists() || !docsSnap.exists()) {
      throw new Error('Rider onboarding record is incomplete.');
    }

    const docs = docsSnap.data() as RiderDocuments;
    if (!docs.nidaNumber || !docs.plateNumber || !docs.nidaImage || !docs.licenseImage || !docs.selfieImage) {
      throw new Error('Complete all onboarding fields before submitting.');
    }

    transaction.set(
      riderRef,
      {
        verificationStatus: 'submitted',
        onboardingStep: 'review',
        profileCompletionPercent: 100,
        submittedAt: serverTimestamp(),
        currentAppVersion: APP_VERSION,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    transaction.set(
      docsRef,
      {
        resubmissionCount:
          previousStatus === 'needs_resubmission' || previousStatus === 'rejected'
            ? ((docs.resubmissionCount ?? 0) as number) + 1
            : docs.resubmissionCount ?? 0,
        lastSubmittedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    const event: RiderReviewLogEvent = {
      action: previousStatus === 'needs_resubmission' || previousStatus === 'rejected' ? 'resubmitted' : 'submitted',
      actor: { type: 'rider', uid },
      note: note ?? null,
      timestamp: serverTimestamp(),
    };

    transaction.set(eventRef, event);
  });
}

export async function signOutPresenceReset(uid: string) {
  await setDoc(
    riderPresenceRef(uid),
    {
      isOnline: false,
      availabilityState: 'offline',
      lastSeenAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function touchPresence(uid: string, payload: Partial<RiderPresence>) {
  await setDoc(
    riderPresenceRef(uid),
    {
      ...payload,
      lastSeenAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function setRiderAvailability(uid: string, isOnline: boolean) {
  await Promise.all([
    setDoc(
      riderPresenceRef(uid),
      {
        isOnline,
        availabilityState: isOnline ? 'online' : 'offline',
        lastSeenAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    ),
    updateDoc(riderDocRef(uid), {
      availabilityState: isOnline ? 'online' : 'offline',
      updatedAt: serverTimestamp(),
    }),
  ]);
}

export async function getExistingRiderStatus(uid: string) {
  const snapshot = await getDoc(riderDocRef(uid));
  return snapshot.exists() ? (snapshot.data() as Partial<RiderProfile>).verificationStatus ?? 'draft' : 'draft';
}
