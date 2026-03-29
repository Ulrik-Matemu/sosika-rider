import { AlertTriangle, CheckCircle2, Clock3, ShieldAlert, XCircle } from 'lucide-react';
import { STATUS_DESCRIPTIONS, STATUS_LABELS } from '../../constants/rider';
import type { VerificationStatus } from '../../types/rider';

const toneByStatus: Record<VerificationStatus, string> = {
  draft: 'border-black/10 bg-white text-slate-700',
  submitted: 'border-amber-300/60 bg-[#fff7e7] text-[#704800]',
  under_review: 'border-amber-300/60 bg-[#fff7e7] text-[#704800]',
  approved: 'border-emerald-300/60 bg-[#eefbf3] text-[#0b6b32]',
  needs_resubmission: 'border-orange-300/60 bg-[#fff1ea] text-[#9a3412]',
  rejected: 'border-rose-300/60 bg-[#fff0f1] text-[#a11a37]',
  suspended: 'border-white/10 bg-[#111111] text-white',
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
    <section className={`rounded-[28px] border p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] ${toneByStatus[status]}`}>
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
