import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { DEFAULT_COUNTRY_CODE } from '../../../constants/app';
import { AppShell } from '../../../components/layout/AppShell';
import { usePhoneAuth } from '../hooks/usePhoneAuth';

export function AuthPage() {
  const [phoneNumber, setPhoneNumber] = useState(DEFAULT_COUNTRY_CODE);
  const [otp, setOtp] = useState('');
  const { confirmationResult, loading, error, clearCodeRequest, clearError, sendOtp, verifyOtp } = usePhoneAuth();

  return (
    <AppShell title="Rider access" subtitle="Secure phone sign-in for onboarding, identity review, and future freelance delivery operations.">
      <div className="mx-auto w-full max-w-md space-y-5 pt-4 sm:pt-8">
        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-[#111111] p-6 text-white shadow-[0_28px_100px_rgba(0,0,0,0.38)]">
          <div className="mb-6 flex items-start gap-4">
            <div className="rounded-[20px] bg-white p-3 text-black">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-[-0.02em]">Phone OTP authentication</h2>
              <p className="mt-1 text-sm leading-6 text-white/65">
                Authentication only unlocks your rider workspace. Operational access still depends on verification approval.
              </p>
            </div>
          </div>

          {!confirmationResult ? (
            <form
              className="space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();
                await sendOtp(phoneNumber);
              }}
            >
              <label className="block space-y-2">
                <span className="text-sm font-medium text-white/80">Phone number</span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(event) => {
                    setPhoneNumber(event.target.value);
                    clearError();
                  }}
                  placeholder="+255700000000"
                  className="w-full rounded-[20px] border border-white/10 bg-white/6 px-4 py-3 text-base text-white outline-none transition placeholder:text-white/25 focus:border-white/30 focus:bg-white/10"
                />
              </label>
              <div id="recaptcha-container" />
              {error ? <p className="rounded-[20px] bg-[#2b1214] px-4 py-3 text-sm text-[#ffb9bf]">{error}</p> : null}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-[20px] bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/40"
              >
                {loading ? 'Sending code...' : 'Send verification code'}
              </button>
            </form>
          ) : (
            <form
              className="space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();
                await verifyOtp(otp);
              }}
            >
              <label className="block space-y-2">
                <span className="text-sm font-medium text-white/80">Verification code</span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(event) => {
                    setOtp(event.target.value.replace(/[^\d]/g, ''));
                    clearError();
                  }}
                  placeholder="000000"
                  className="w-full rounded-[20px] border border-white/10 bg-white/6 px-4 py-3 text-center text-lg tracking-[0.35em] text-white outline-none transition placeholder:text-white/25 focus:border-white/30 focus:bg-white/10"
                />
              </label>
              {error ? <p className="rounded-[20px] bg-[#2b1214] px-4 py-3 text-sm text-[#ffb9bf]">{error}</p> : null}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-[20px] bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/40"
              >
                {loading ? 'Verifying...' : 'Verify and continue'}
              </button>
              <button type="button" onClick={clearCodeRequest} className="w-full text-sm font-medium text-white/55 transition hover:text-white">
                Change phone number
              </button>
            </form>
          )}
        </section>

        <section className="rounded-[28px] border border-black/10 bg-white px-5 py-5 text-slate-700 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Workflow</p>
              <p className="mt-2 text-sm">Sign in, complete onboarding, wait for review, then go online when approved.</p>
            </div>
            <div className="rounded-full bg-[#f5f5f2] px-3 py-1 text-xs font-semibold text-slate-600">Mobile first</div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
