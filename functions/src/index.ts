/**
 * Optional Firebase Functions entrypoint for future privileged rider actions.
 *
 * Intended usage:
 * - approveRider(uid, note)
 * - rejectRider(uid, note)
 * - suspendRider(uid, reason)
 * - move submitted -> under_review automatically
 *
 * This repo does not yet ship a full Functions package, but these are the
 * privileged writes the frontend is now structured to hand off to admin code.
 */

export type RiderAdminAction = 'approveRider' | 'rejectRider' | 'suspendRider' | 'markUnderReview';

export interface RiderAdminActionPayload {
  uid: string;
  note?: string;
  reason?: string;
  actorUid: string;
}

export function describeRiderAdminAction(action: RiderAdminAction, payload: RiderAdminActionPayload) {
  return {
    action,
    payload,
    summary: `Admin action ${action} prepared for rider ${payload.uid}`,
  };
}
