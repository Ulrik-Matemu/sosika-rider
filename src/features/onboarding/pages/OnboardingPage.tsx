import { startTransition, useMemo, useState } from 'react';
import { CheckCircle2, ChevronRight, FileUp, RefreshCcw } from 'lucide-react';
import { AppShell } from '../../../components/layout/AppShell';
import { StatusBanner } from '../../../components/ui/StatusBanner';
import type { RiderDocumentKind, RiderSession } from '../../../types/rider';
import { StepIndicator } from '../components/StepIndicator';
import { useRiderOnboarding } from '../hooks/useRiderOnboarding';

function fileLabel(kind: RiderDocumentKind) {
  if (kind === 'nidaImage') return 'NIDA front image';
  if (kind === 'licenseImage') return 'Driving license image';
  return 'Live selfie';
}

export function OnboardingPage({ session }: { session: RiderSession }) {
  const { rider } = session;
  const [step, setStep] = useState<RiderSession['rider']['onboardingStep']>(rider.onboardingStep);
  const [submissionNote, setSubmissionNote] = useState('');
  const {
    canResubmit,
    documentDraft,
    draft,
    fieldErrors,
    formError,
    isSaving,
    isSubmitting,
    selectedFiles,
    uploadStates,
    updateField,
    selectFile,
    savePersonalInfo,
    saveVehicleInfo,
    saveDocuments,
    submitForReview,
  } = useRiderOnboarding(session);

  const hasLockedStatus = useMemo(() => rider.verificationStatus === 'submitted' || rider.verificationStatus === 'under_review' || rider.verificationStatus === 'approved' || rider.verificationStatus === 'suspended', [rider.verificationStatus]);

  const editable = !hasLockedStatus || rider.verificationStatus === 'needs_resubmission' || rider.verificationStatus === 'rejected';

  function gotoNextStep(nextStep: RiderSession['rider']['onboardingStep']) {
    startTransition(() => setStep(nextStep));
  }

  return (
    <AppShell
      title="Rider onboarding"
      subtitle="Complete your freelance rider profile. Your account only becomes operational after approval."
      headerAction={
        <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
          {rider.profileCompletionPercent}% complete
        </div>
      }
    >
      <div className="space-y-5">
        <StatusBanner status={rider.verificationStatus} reviewNotes={rider.reviewNotes} suspensionReason={rider.suspensionReason} />
        <StepIndicator currentStep={step} />

        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          {step === 'personal_info' ? (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Step 1</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-950">Personal information</h2>
              </div>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Full name</span>
                <input
                  disabled={!editable}
                  value={draft.fullName}
                  onChange={(event) => updateField('fullName', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-400 focus:bg-white disabled:cursor-not-allowed"
                />
                {fieldErrors.fullName ? <span className="text-sm text-rose-600">{fieldErrors.fullName}</span> : null}
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">NIDA number</span>
                <input
                  disabled={!editable}
                  value={draft.nidaNumber}
                  onChange={(event) => updateField('nidaNumber', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-400 focus:bg-white disabled:cursor-not-allowed"
                />
                {fieldErrors.nidaNumber ? <span className="text-sm text-rose-600">{fieldErrors.nidaNumber}</span> : null}
              </label>
              {editable ? (
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={async () => {
                    const ok = await savePersonalInfo();
                    if (ok) gotoNextStep('vehicle_info');
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:bg-slate-400"
                >
                  {isSaving ? 'Saving...' : 'Save and continue'}
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          ) : null}

          {step === 'vehicle_info' ? (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Step 2</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-950">Vehicle information</h2>
              </div>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Plate number</span>
                <input
                  disabled={!editable}
                  value={draft.plateNumber}
                  onChange={(event) => updateField('plateNumber', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-400 focus:bg-white disabled:cursor-not-allowed"
                />
                {fieldErrors.plateNumber ? <span className="text-sm text-rose-600">{fieldErrors.plateNumber}</span> : null}
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Vehicle type</span>
                <input
                  disabled={!editable}
                  value={draft.vehicleType}
                  onChange={(event) => updateField('vehicleType', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-400 focus:bg-white disabled:cursor-not-allowed"
                />
              </label>
              {editable ? (
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => gotoNextStep('personal_info')}
                    className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={async () => {
                      const ok = await saveVehicleInfo();
                      if (ok) gotoNextStep('documents');
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:bg-slate-400"
                  >
                    {isSaving ? 'Saving...' : 'Save and continue'}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 'documents' ? (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Step 3</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-950">Document uploads</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">Each document can be uploaded or replaced independently. Draft uploads are saved for later resume.</p>
              </div>
              {(['nidaImage', 'licenseImage', 'selfieImage'] as RiderDocumentKind[]).map((kind) => {
                const existingAsset = documentDraft[kind];
                const selectedFile = selectedFiles[kind];
                const uploadState = uploadStates[kind];

                return (
                  <div key={kind} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{fileLabel(kind)}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {selectedFile ? `Ready: ${selectedFile.name}` : existingAsset ? 'Uploaded and saved to draft.' : 'Not uploaded yet.'}
                        </p>
                      </div>
                      {existingAsset ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <FileUp className="h-5 w-5 text-slate-500" />}
                    </div>
                    <div className="mt-4 space-y-3">
                      <input
                        disabled={!editable}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        capture={kind === 'selfieImage' ? 'user' : 'environment'}
                        onChange={(event) => selectFile(kind, event.target.files?.[0] ?? null)}
                        className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-orange-100 file:px-4 file:py-2 file:font-semibold file:text-orange-700"
                      />
                      {uploadState.uploading ? (
                        <div className="space-y-2">
                          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                            <div className="h-full bg-orange-500 transition-all" style={{ width: `${uploadState.progress}%` }} />
                          </div>
                          <p className="text-xs font-medium text-slate-600">{uploadState.progress}% uploaded</p>
                        </div>
                      ) : null}
                      {uploadState.error ? <p className="text-sm text-rose-600">{uploadState.error}</p> : null}
                      {fieldErrors[kind] ? <p className="text-sm text-rose-600">{fieldErrors[kind]}</p> : null}
                    </div>
                  </div>
                );
              })}
              {editable ? (
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => gotoNextStep('vehicle_info')}
                    className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={async () => {
                      const ok = await saveDocuments();
                      if (ok) gotoNextStep('review');
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:bg-slate-400"
                  >
                    {isSaving ? 'Uploading...' : 'Save documents'}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 'review' ? (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Step 4</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-950">Review and submit</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Personal</p>
                  <p className="mt-3 text-sm text-slate-700">Full name: {session.rider.fullName || 'Not saved'}</p>
                  <p className="mt-1 text-sm text-slate-700">NIDA number: {documentDraft.nidaNumber || 'Not saved'}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Vehicle</p>
                  <p className="mt-3 text-sm text-slate-700">Plate number: {documentDraft.plateNumber || 'Not saved'}</p>
                  <p className="mt-1 text-sm text-slate-700">Vehicle type: {documentDraft.vehicleType || 'Not saved'}</p>
                </div>
              </div>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Optional note for reviewer</span>
                <textarea
                  disabled={!editable}
                  value={submissionNote}
                  onChange={(event) => setSubmissionNote(event.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-400 focus:bg-white disabled:cursor-not-allowed"
                  placeholder="Add clarification if a document was replaced or reuploaded."
                />
              </label>
              {editable ? (
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => gotoNextStep('documents')}
                    className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting || !canResubmit}
                    onClick={async () => {
                      const ok = await submitForReview(submissionNote);
                      if (!ok) return;
                    }}
                    className="rounded-2xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-orange-300"
                  >
                    {isSubmitting ? 'Submitting...' : canResubmit ? 'Submit for review' : 'Waiting for review'}
                  </button>
                </div>
              ) : (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                  This onboarding record is currently locked while operations handles the current status.
                </div>
              )}
            </div>
          ) : null}

          {formError ? <p className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</p> : null}
        </section>

        {(rider.verificationStatus === 'needs_resubmission' || rider.verificationStatus === 'rejected') && editable ? (
          <button
            type="button"
            onClick={() => gotoNextStep('personal_info')}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-100"
          >
            <RefreshCcw className="h-4 w-4" />
            Update application and resubmit
          </button>
        ) : null}
      </div>
    </AppShell>
  );
}
