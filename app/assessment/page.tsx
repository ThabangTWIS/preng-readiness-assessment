'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { buildAnswers } from '@/lib/answers';
import { QUESTIONS } from '@/lib/questions';
import { RulesV1 } from '@/lib/rules/v1';
import { score } from '@/lib/scoring';
import { QuestionCard, isQuestionAnswered } from '@/components/QuestionCard';

export default function AssessmentPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Record<string, unknown>>({});

  const question = QUESTIONS[step];
  const isLastStep = step === QUESTIONS.length - 1;
  const canAdvance = isQuestionAnswered(question, form);

  function handleChange(key: string, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function goToNextStep(currentForm: Record<string, unknown>) {
    if (isLastStep) {
      submit(currentForm);
    } else {
      setStep((s) => s + 1);
    }
  }

  function handleNext() {
    if (!canAdvance) return;
    goToNextStep(form);
  }

  // Auto-advance for single_select/boolean answers: merge locally rather
  // than reading `form`, since the onChange update hasn't landed yet.
  function handleAutoAdvance(key: string, value: unknown) {
    goToNextStep({ ...form, [key]: value });
  }

  function submit(finalForm: Record<string, unknown>) {
    const answers = buildAnswers(finalForm);
    const result = score(answers, RulesV1, new Date());
    const sessionId = crypto.randomUUID();
    sessionStorage.setItem(
      `preng-result:${sessionId}`,
      JSON.stringify({ answers, result, computedAt: new Date().toISOString() }),
    );
    router.push(`/result/${sessionId}`);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 bg-white p-4">
      <div className="pt-6">
        <div className="h-1.5 w-full rounded-full bg-navy-tint">
          <div
            className="h-1.5 rounded-full bg-blue transition-all"
            style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-navy/70">
          Question {step + 1} of {QUESTIONS.length}
        </p>
      </div>

      <QuestionCard
        question={question}
        form={form}
        onChange={handleChange}
        onAutoAdvance={handleAutoAdvance}
      />

      <div className="flex gap-3 pb-8">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-lg border border-zinc-300 px-4 py-3 text-sm text-navy disabled:opacity-40"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!canAdvance}
          className="flex-1 rounded-lg bg-navy px-4 py-3 text-sm text-white disabled:opacity-40"
        >
          {isLastStep ? 'See my result' : 'Next'}
        </button>
      </div>
    </main>
  );
}
