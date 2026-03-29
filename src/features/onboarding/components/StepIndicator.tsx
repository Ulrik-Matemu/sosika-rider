import { ONBOARDING_STEP_ORDER } from '../../../constants/rider';
import type { OnboardingStep } from '../../../types/rider';

const orderedSteps = Object.entries(ONBOARDING_STEP_ORDER).sort((a, b) => a[1] - b[1]) as [OnboardingStep, number][];

export function StepIndicator({ currentStep }: { currentStep: OnboardingStep }) {
  return (
    <div className="grid grid-cols-4 gap-2 rounded-[2rem] border border-slate-200 bg-white p-3 shadow-sm">
      {orderedSteps.map(([step, order]) => {
        const isActive = step === currentStep;
        const isComplete = order < ONBOARDING_STEP_ORDER[currentStep];

        return (
          <div
            key={step}
            className={`rounded-2xl px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em] ${
              isActive ? 'bg-slate-950 text-white' : isComplete ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {step.replace('_', ' ')}
          </div>
        );
      })}
    </div>
  );
}
