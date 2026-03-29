import { STATUS_LABELS } from '../constants/rider';
import type { VerificationStatus } from '../types/rider';

export function formatPhoneNumber(value: string): string {
  return value.replace(/[^\d+]/g, '');
}

export function normalizePlateNumber(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, ' ');
}

export function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function statusLabel(status: VerificationStatus): string {
  return STATUS_LABELS[status];
}

export function formatRelativeText(status: VerificationStatus): string {
  return status.replace(/_/g, ' ');
}

export function buildTokenDocumentId(token: string): string {
  return token.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 180);
}

export function getCompletionPercent(fieldsComplete: boolean[]): number {
  const completed = fieldsComplete.filter(Boolean).length;
  return Math.round((completed / fieldsComplete.length) * 100);
}
