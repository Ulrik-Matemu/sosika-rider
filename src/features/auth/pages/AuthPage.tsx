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
    <AppShell title="Rider access" subtitle="Sign in with your phone number to continue onboarding or manage your rider account.">
      <div className="mx-auto mt-10 w-full max-w-md space-y-6">
        <section className="rounded-[2rem] border border-orange-100 bg-white/90 p-6 shadow-lg shadow-orange-100/50">
          <div className="mb-6 flex items-start gap-4">
            <div className="rounded-2xl bg-orange-100 p-3 text-orange-700">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Phone OTP authentication</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
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
                <span className="text-sm font-medium text-slate-700">Phone number</span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(event) => {
                    setPhoneNumber(event.target.value);
                    clearError();
                  }}
                  placeholder="+255700000000"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base outline-none transition focus:border-orange-400 focus:bg-white"
                />
              </label>
              <div id="recaptcha-container" />
              {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
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
                <span className="text-sm font-medium text-slate-700">Verification code</span>
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
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-lg tracking-[0.35em] outline-none transition focus:border-orange-400 focus:bg-white"
                />
              </label>
              {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-orange-300"
              >
                {loading ? 'Verifying...' : 'Verify and continue'}
              </button>
              <button type="button" onClick={clearCodeRequest} className="w-full text-sm font-medium text-slate-500 transition hover:text-slate-950">
                Change phone number
              </button>
            </form>
          )}
        </section>
      </div>
    </AppShell>
  );
}
