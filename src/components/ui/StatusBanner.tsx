import { AlertTriangle, CheckCircle2, Clock3, ShieldAlert, XCircle } from 'lucide-react';
import { STATUS_DESCRIPTIONS, STATUS_LABELS } from '../../constants/rider';
import type { VerificationStatus } from '../../types/rider';

const toneByStatus: Record<VerificationStatus, string> = {
  draft: 'border-slate-200 bg-white text-slate-700',
  submitted: 'border-amber-200 bg-amber-50 text-amber-900',
  under_review: 'border-amber-200 bg-amber-50 text-amber-900',
  approved: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  needs_resubmission: 'border-orange-200 bg-orange-50 text-orange-900',
  rejected: 'border-rose-200 bg-rose-50 text-rose-900',
  suspended: 'border-slate-900 bg-slate-950 text-white',
};

function getStatusIcon(status: VerificationStatus) {
  switch (status) {
    case 'approved':
      return <CheckCircle2 className="h-5 w-5" />;
    case 'submitted':
    case 'under_review':
      return <Clock3 className="h-5 w-5" />;
    case 'needs_resubmission':
      return <AlertTriangle className="h-5 w-5" />;
    case 'rejected':
      return <XCircle className="h-5 w-5" />;
    case 'suspended':
      return <ShieldAlert className="h-5 w-5" />;
    default:
      return <AlertTriangle className="h-5 w-5" />;
  }
}

export function StatusBanner({
  status,
  reviewNotes,
  suspensionReason,
}: {
  status: VerificationStatus;
  reviewNotes?: string | null;
  suspensionReason?: string | null;
}) {
  return (
    <section className={`rounded-3xl border p-5 shadow-sm ${toneByStatus[status]}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{getStatusIcon(status)}</div>
        <div className="space-y-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] opacity-70">Verification status</p>
            <h2 className="text-lg font-semibold">{STATUS_LABELS[status]}</h2>
          </div>
          <p className="text-sm leading-6 opacity-90">{STATUS_DESCRIPTIONS[status]}</p>
          {reviewNotes ? (
            <p className="rounded-2xl bg-black/5 px-3 py-2 text-sm leading-6">
              <span className="font-semibold">Review notes:</span> {reviewNotes}
            </p>
          ) : null}
          {suspensionReason ? (
            <p className="rounded-2xl bg-white/10 px-3 py-2 text-sm leading-6">
              <span className="font-semibold">Suspension reason:</span> {suspensionReason}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
