import { ONBOARDING_STEP_ORDER } from '../../../constants/rider';
import type { OnboardingStep } from '../../../types/rider';

const orderedSteps = Object.entries(ONBOARDING_STEP_ORDER).sort((a, b) => a[1] - b[1]) as [OnboardingStep, number][];

export function StepIndicator({ currentStep }: { currentStep: OnboardingStep }) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-[28px] border border-black/10 bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:grid-cols-4">
      {orderedSteps.map(([step, order]) => {
        const isActive = step === currentStep;
        const isComplete = order < ONBOARDING_STEP_ORDER[currentStep];

        return (
          <div
            key={step}
            className={`rounded-[20px] px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] ${
              isActive ? 'bg-[#111111] text-white' : isComplete ? 'bg-[#edf8f1] text-emerald-700' : 'bg-[#f5f5f2] text-slate-500'
            }`}
          >
            {step.replace('_', ' ')}
          </div>
        );
      })}
    </div>
  );
}
