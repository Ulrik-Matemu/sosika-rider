# Sosika Rider PWA

Production-oriented rider onboarding and freelance delivery rider foundation built with React, TypeScript, Vite, Tailwind, Firebase, and Cloudinary.

## What changed

The app was refactored from a flat page-based prototype into a feature-based rider app foundation:

- Firebase phone OTP auth is preserved.
- Rider initialization is now idempotent and typed.
- Onboarding is now multi-step, resumable, and status-aware.
- Cloudinary uploads are handled through a reusable utility with validation, progress, and retry support.
- Rider verification lifecycle now uses `draft`, `submitted`, `under_review`, `approved`, `needs_resubmission`, `rejected`, and `suspended`.
- Rider presence, notification token storage, and review logs are prepared for future dispatch and admin workflows.
- Firestore security rules were added to block riders from self-approving or modifying suspension/review fields.

## Architecture

```text
src/
  components/
    layout/
    ui/
  constants/
  features/
    auth/
    dashboard/
    notifications/
    onboarding/
  hooks/
  lib/
    cloudinary/
    firebase/
  types/
  utils/
functions/
  src/
firestore.rules
```

Key modules:

- `src/lib/firebase/app.ts`
  Central Firebase bootstrap, auth persistence, and messaging support.
- `src/lib/firebase/riderRepository.ts`
  Rider initialization, onboarding draft writes, submission flow, availability, and presence writes.
- `src/lib/cloudinary/upload.ts`
  Reusable Cloudinary upload helper with typed responses, upload progress, and retry behavior.
- `src/hooks/useAuthSession.ts`
  App-level auth + rider/doc/presence session subscription.
- `src/features/onboarding/hooks/useRiderOnboarding.ts`
  Multi-step onboarding state, validation, file selection, draft save, and submission.

## Firestore collections

### `riders/{uid}`

Primary rider profile and lifecycle state.

Fields used by the client:

- `uid`
- `phoneNumber`
- `role`
- `fullName`
- `verificationStatus`
- `onboardingStep`
- `profileCompletionPercent`
- `isSuspended`
- `availabilityState`
- `createdAt`
- `updatedAt`
- `submittedAt`
- `approvedAt`
- `rejectedAt`
- `suspensionReason`
- `reviewNotes`
- `currentAppVersion`

### `rider_documents/{uid}`

Sensitive onboarding and document package.

- `uid`
- `nidaNumber`
- `plateNumber`
- `vehicleType`
- `nidaImage`
- `licenseImage`
- `selfieImage`
- `uploadMetadata`
- `resubmissionCount`
- `lastSubmittedAt`
- `createdAt`
- `updatedAt`

### `rider_presence/{uid}`

Operational rider presence and future dispatch compatibility.

- `uid`
- `isOnline`
- `availabilityState`
- `lastSeenAt`
- `lat`
- `lng`
- `heading`
- `speed`
- `batteryLevel`
- `networkStatus`
- `activeDeliveryType`
- `updatedAt`

### `rider_review_logs/{uid}/events/{eventId}`

Audit trail for rider submission and future admin review actions.

- `action`
- `actor`
- `note`
- `timestamp`

### `rider_notification_tokens/{tokenId}`

Normalized FCM token registry for rider devices.

- `uid`
- `token`
- `platform`
- `permission`
- `userAgent`
- `createdAt`
- `updatedAt`
- `lastSeenAt`

### `rider_notifications/{notificationId}`

Reserved for future rider-facing app notifications.

## Verification lifecycle

The client now assumes this lifecycle:

1. `draft`
2. `submitted`
3. `under_review`
4. `approved`
5. `needs_resubmission`
6. `rejected`
7. `suspended`

Rules:

- Authenticated riders can access onboarding.
- Auth alone does not grant operational access.
- Only approved, non-suspended riders can go online.
- `needs_resubmission` and `rejected` riders can edit and resubmit.
- `reviewNotes`, `approvedAt`, `rejectedAt`, `isSuspended`, and `suspensionReason` are intended for admin or server-side writes.

## Security model

Security rules live in [firestore.rules](/home/ulrik/Desktop/Projects/Personal/sosika-delivery/sosika-delivery/firestore.rules).

### Client-writable rider fields

Riders can write only the fields required for onboarding and allowed operational updates:

- `fullName`
- `onboardingStep`
- `profileCompletionPercent`
- `currentAppVersion`
- `updatedAt`
- `verificationStatus`
- `submittedAt`
- `availabilityState`

### Protected rider fields

These are intended to be admin-controlled or server-controlled:

- `role`
- `phoneNumber` after initialization
- `approvedAt`
- `rejectedAt`
- `reviewNotes`
- `isSuspended`
- `suspensionReason`

### Client-writable document fields

- `nidaNumber`
- `plateNumber`
- `vehicleType`
- `nidaImage`
- `licenseImage`
- `selfieImage`
- `uploadMetadata`
- `resubmissionCount`
- `lastSubmittedAt`
- `updatedAt`

### Presence protection

- Riders can only update their own presence doc.
- Setting online presence is gated by `verificationStatus == approved` and `isSuspended == false`.

### Admin model

Rules already support future admin access through a Firebase custom claim:

- `request.auth.token.admin == true`

## Onboarding flow

The new onboarding is split into four steps:

1. Personal info
2. Vehicle info
3. Document uploads
4. Review and submit

Behavior:

- Draft fields are saved into Firestore.
- Uploaded documents are stored independently, so one document can be replaced without breaking the rest of the profile.
- Uploads validate image type and file size.
- Upload progress is visible per document.
- Failed uploads can be retried without restarting the whole form.
- Final submission is blocked until required fields and documents exist.

## Notifications

Foreground FCM handling is organized in `src/features/notifications/hooks/usePushNotifications.ts`.

Current behavior:

- Requests notification permission after auth.
- Fetches the FCM token when supported.
- Stores the token in `rider_notification_tokens` using a deterministic id to reduce duplicate token spam.
- Handles foreground message display in the app shell.

## Operational readiness

The dashboard now supports a rider availability toggle backed by `rider_presence/{uid}`.

Prepared for future dispatch:

- rider online/offline state
- last seen
- geo and motion fields
- delivery-type-ready presence shape
- audit trail for onboarding lifecycle
- token registry for notifications

Dispatch UI is intentionally not built yet, but the data model is ready for:

- new delivery request
- tender / offer acceptance
- reassignment
- cancellation
- multi-delivery-type expansion beyond food-only flows

## Optional Firebase Functions path

There is a lightweight placeholder in [functions/src/index.ts](/home/ulrik/Desktop/Projects/Personal/sosika-delivery/sosika-delivery/functions/src/index.ts) documenting the future privileged action boundary:

- `approveRider`
- `rejectRider`
- `suspendRider`
- `markUnderReview`

Recommended next step is moving status transitions such as `submitted -> under_review`, `under_review -> approved`, and suspension actions into Cloud Functions or an Admin SDK service.

## Environment variables

Create `.env` with:

```dotenv
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
VITE_FIREBASE_VAPID_KEY=...
VITE_CLOUDINARY_CLOUD_NAME=...
VITE_CLOUDINARY_PRESET_NAME=...
VITE_APP_VERSION=...
```

## Manual Firebase and Cloudinary setup

1. Enable Firebase Authentication phone sign-in.
2. Add your authorized domains for OTP and PWA hosting.
3. Deploy the Firestore rules in `firestore.rules`.
4. If you want admin-ready rule bypass, add a Firebase custom claim named `admin`.
5. Enable Cloud Messaging and generate the web VAPID key.
6. Keep `public/firebase-messaging-sw.js` aligned with the same Firebase project because files in `/public` do not receive Vite env injection.
7. Configure the Cloudinary unsigned upload preset referenced by `VITE_CLOUDINARY_PRESET_NAME`.
8. Restrict the Cloudinary preset to expected formats/folders if possible.

## Development

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
```

## Recommended next features

1. Add a real admin review panel or separate admin repo.
2. Move privileged verification transitions into Firebase Functions.
3. Add geolocation capture and periodic presence heartbeats.
4. Add rider notification inbox UI backed by `rider_notifications`.
5. Add dispatch collections and offer acceptance timeouts.
6. Add analytics and error tracking for onboarding drop-off and upload failures.
