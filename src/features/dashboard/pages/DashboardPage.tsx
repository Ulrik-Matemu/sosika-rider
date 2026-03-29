import { Bell, Bike, FileText, LogOut, Radio, ShieldCheck } from 'lucide-react';
import { AppShell } from '../../../components/layout/AppShell';
import { StatusBanner } from '../../../components/ui/StatusBanner';
import type { RiderSession } from '../../../types/rider';
import { setRiderAvailability } from '../../../lib/firebase/riderRepository';

export function DashboardPage({
  session,
  onSignOut,
  notification,
}: {
  session: RiderSession;
  onSignOut: () => Promise<void>;
  notification: { title?: string; body?: string } | null;
}) {
  const approved = session.rider.verificationStatus === 'approved' && !session.rider.isSuspended;
  const isOnline = session.presence?.isOnline ?? false;

  return (
    <AppShell
      title={session.rider.fullName || 'Rider dashboard'}
      subtitle={session.rider.phoneNumber ?? 'Phone authentication active'}
      headerAction={
        <button
          type="button"
          onClick={() => void onSignOut()}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      }
    >
      <div className="space-y-5">
        {notification ? (
          <section className="rounded-3xl border border-blue-200 bg-blue-50 p-4 text-blue-900">
            <div className="flex items-start gap-3">
              <Bell className="mt-0.5 h-5 w-5" />
              <div>
                <p className="text-sm font-semibold">{notification.title ?? 'New notification'}</p>
                <p className="mt-1 text-sm leading-6">{notification.body ?? 'A new rider update has arrived.'}</p>
              </div>
            </div>
          </section>
        ) : null}

        <StatusBanner
          status={session.rider.verificationStatus}
          reviewNotes={session.rider.reviewNotes}
          suspensionReason={session.rider.suspensionReason}
        />

        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Availability</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-950">Operational readiness</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Only approved riders can go online for dispatch. Presence data is already structured for future tender and live dispatch modules.
              </p>
            </div>
            <div className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </div>
          </div>

          <button
            type="button"
            disabled={!approved}
            onClick={() => void setRiderAvailability(session.rider.uid, !isOnline)}
            className={`mt-5 inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition ${
              approved ? 'bg-slate-950 text-white hover:bg-slate-800' : 'cursor-not-allowed bg-slate-200 text-slate-500'
            }`}
          >
            <Radio className="h-4 w-4" />
            {approved ? (isOnline ? 'Go offline' : 'Go online') : 'Approval required before going online'}
          </button>
        </section>

        <div className="grid gap-4 sm:grid-cols-3">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <Bike className="h-5 w-5 text-orange-600" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Vehicle</p>
            <p className="mt-2 text-sm font-medium text-slate-900">{session.documents.plateNumber || 'Not set'}</p>
            <p className="mt-1 text-sm text-slate-600">{session.documents.vehicleType || 'bodaboda'}</p>
          </section>
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <FileText className="h-5 w-5 text-blue-600" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Verification</p>
            <p className="mt-2 text-sm font-medium text-slate-900">{session.documents.nidaNumber || 'Pending'}</p>
            <p className="mt-1 text-sm text-slate-600">{session.rider.profileCompletionPercent}% profile completion</p>
          </section>
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Dispatch ready</p>
            <p className="mt-2 text-sm font-medium text-slate-900">{approved ? 'Eligible' : 'Locked'}</p>
            <p className="mt-1 text-sm text-slate-600">Future tender and assignment flows plug into the same rider presence model.</p>
          </section>
        </div>

        <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 p-5 text-sm leading-6 text-slate-600">
          Dispatch UI is intentionally not built yet. The app now stores rider availability, last seen data, notification tokens, and review logs so future delivery request flows can be added without reworking onboarding.
        </section>
      </div>
    </AppShell>
  );
}
