import { ALLOWED_IMAGE_MIME_TYPES, MAX_UPLOAD_SIZE_BYTES } from '../constants/rider';
import type { OnboardingDraftInput, RiderDocumentKind, RiderDocuments } from '../types/rider';
import { normalizeName, normalizePlateNumber } from './format';

export type ValidationErrors<T extends string> = Partial<Record<T, string>>;

export function validatePhoneNumber(phoneNumber: string): string | null {
  if (!/^\+\d{10,15}$/.test(phoneNumber)) {
    return 'Enter a valid phone number in international format.';
  }

  return null;
}

export function validateOtpCode(otp: string): string | null {
  if (!/^\d{6}$/.test(otp)) {
    return 'Enter the 6-digit verification code.';
  }

  return null;
}

export function validatePersonalInfo(values: OnboardingDraftInput): ValidationErrors<'fullName' | 'nidaNumber'> {
  const errors: ValidationErrors<'fullName' | 'nidaNumber'> = {};

  if (normalizeName(values.fullName).length < 3) {
    errors.fullName = 'Enter the rider name exactly as it appears on the ID.';
  }

  if (!/^\d{8,20}$/.test(values.nidaNumber.replace(/\s+/g, ''))) {
    errors.nidaNumber = 'Enter a valid NIDA number.';
  }

  return errors;
}

export function validateVehicleInfo(values: OnboardingDraftInput): ValidationErrors<'plateNumber'> {
  const errors: ValidationErrors<'plateNumber'> = {};

  if (normalizePlateNumber(values.plateNumber).length < 5) {
    errors.plateNumber = 'Enter a valid vehicle plate number.';
  }

  return errors;
}

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
    return 'Use a JPG, PNG, or WEBP image.';
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return 'Image must be 7 MB or smaller.';
  }

  return null;
}

export function validateDocumentCompleteness(documents: RiderDocuments): ValidationErrors<RiderDocumentKind> {
  const errors: ValidationErrors<RiderDocumentKind> = {};

  if (!documents.nidaImage) {
    errors.nidaImage = 'Upload the front of the NIDA card.';
  }

  if (!documents.licenseImage) {
    errors.licenseImage = 'Upload the driving license image.';
  }

  if (!documents.selfieImage) {
    errors.selfieImage = 'Upload the live selfie.';
  }

  return errors;
}
