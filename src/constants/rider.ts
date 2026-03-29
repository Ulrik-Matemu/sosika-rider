export const riderRoles = ['rider'] as const;

export const verificationStatuses = [
  'draft',
  'submitted',
  'under_review',
  'approved',
  'needs_resubmission',
  'rejected',
  'suspended',
] as const;

export const onboardingSteps = ['personal_info', 'vehicle_info', 'documents', 'review'] as const;

export const documentKinds = ['nidaImage', 'licenseImage', 'selfieImage'] as const;

export const riderAvailabilityStates = ['offline', 'online', 'busy'] as const;

export const dispatchStates = ['open', 'offered', 'accepted', 'picked_up', 'completed', 'cancelled'] as const;

export const MAX_UPLOAD_SIZE_BYTES = 7 * 1024 * 1024;

export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const;

export const REQUIRED_DOCUMENT_FIELDS = ['nidaImage', 'licenseImage', 'selfieImage'] as const;

export const ONBOARDING_STEP_ORDER = {
  personal_info: 1,
  vehicle_info: 2,
  documents: 3,
  review: 4,
} as const;

export const STATUS_LABELS: Record<(typeof verificationStatuses)[number], string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under review',
  approved: 'Approved',
  needs_resubmission: 'Needs resubmission',
  rejected: 'Rejected',
  suspended: 'Suspended',
};

export const STATUS_DESCRIPTIONS: Record<(typeof verificationStatuses)[number], string> = {
  draft: 'Finish your onboarding details and submit your documents for review.',
  submitted: 'Your profile has been submitted and is waiting to enter review.',
  under_review: 'Your rider application is currently being reviewed by the operations team.',
  approved: 'Your rider account is approved and you can go online for dispatch.',
  needs_resubmission: 'Some details need to be corrected before approval.',
  rejected: 'Your application was rejected. Review the notes and resubmit if allowed.',
  suspended: 'Your operational access is suspended until the issue is resolved.',
};
