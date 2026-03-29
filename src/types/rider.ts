import type {
  dispatchStates,
  documentKinds,
  onboardingSteps,
  riderAvailabilityStates,
  riderRoles,
  verificationStatuses,
} from '../constants/rider';

export type RiderRole = (typeof riderRoles)[number];
export type VerificationStatus = (typeof verificationStatuses)[number];
export type OnboardingStep = (typeof onboardingSteps)[number];
export type RiderAvailabilityState = (typeof riderAvailabilityStates)[number];
export type RiderDocumentKind = (typeof documentKinds)[number];
export type DispatchState = (typeof dispatchStates)[number];

export interface CloudinaryAsset {
  secureUrl: string;
  publicId: string;
  assetId: string;
  version: number;
  bytes: number;
  format: string;
  width?: number;
  height?: number;
  originalFilename: string;
  uploadedAt: string;
  resourceType: string;
}

export interface RiderProfile {
  uid: string;
  phoneNumber: string | null;
  role: RiderRole;
  fullName: string;
  verificationStatus: VerificationStatus;
  onboardingStep: OnboardingStep;
  profileCompletionPercent: number;
  isSuspended: boolean;
  availabilityState: RiderAvailabilityState;
  createdAt?: unknown;
  updatedAt?: unknown;
  submittedAt?: unknown;
  approvedAt?: unknown;
  rejectedAt?: unknown;
  suspensionReason: string | null;
  reviewNotes: string | null;
  currentAppVersion: string;
}

export interface RiderDocuments {
  uid: string;
  nidaNumber: string;
  plateNumber: string;
  vehicleType: string | null;
  nidaImage: CloudinaryAsset | null;
  licenseImage: CloudinaryAsset | null;
  selfieImage: CloudinaryAsset | null;
  uploadMetadata: Partial<Record<RiderDocumentKind, UploadMetadata>>;
  resubmissionCount: number;
  lastSubmittedAt?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface UploadMetadata {
  fileName: string;
  bytes: number;
  mimeType: string;
  uploadedAt: string;
}

export interface RiderPresence {
  uid: string;
  isOnline: boolean;
  availabilityState: RiderAvailabilityState;
  lastSeenAt?: unknown;
  lat: number | null;
  lng: number | null;
  heading: number | null;
  speed: number | null;
  batteryLevel: number | null;
  networkStatus: string | null;
  activeDeliveryType: string | null;
  updatedAt?: unknown;
}

export interface RiderReviewLogEvent {
  action: 'submitted' | 'resubmitted' | 'status_changed' | 'approved' | 'rejected' | 'suspended';
  actor: {
    type: 'rider' | 'admin' | 'system';
    uid: string;
  };
  note: string | null;
  timestamp?: unknown;
}

export interface RiderNotificationToken {
  uid: string;
  token: string;
  platform: 'web';
  permission: NotificationPermission;
  userAgent: string;
  createdAt?: unknown;
  updatedAt?: unknown;
  lastSeenAt?: unknown;
}

export interface RiderNotification {
  uid: string;
  type: 'verification_approved' | 'verification_rejected' | 'new_delivery_request' | 'reassignment' | 'cancellation' | 'general';
  title: string;
  body: string;
  isRead: boolean;
  createdAt?: unknown;
  data?: Record<string, string>;
}

export interface DeliveryTenderStub {
  tenderId: string;
  deliveryType: string;
  state: DispatchState;
  pickupLabel: string;
  dropoffLabel: string;
  payoutAmount: number | null;
}

export interface RiderSession {
  rider: RiderProfile;
  documents: RiderDocuments;
  presence: RiderPresence | null;
}

export interface OnboardingDraftInput {
  fullName: string;
  nidaNumber: string;
  plateNumber: string;
  vehicleType: string;
}
