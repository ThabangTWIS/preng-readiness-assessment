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

  function handleNext() {
    if (!canAdvance) return;
    if (isLastStep) {
      submit();
    } else {
      setStep((s) => s + 1);
    }
  }

  function submit() {
    const answers = buildAnswers(form);
    const result = score(answers, RulesV1, new Date());
    const sessionId = crypto.randomUUID();
    sessionStorage.setItem(
      `preng-result:${sessionId}`,
      JSON.stringify({ answers, result, computedAt: new Date().toISOString() }),
    );
    router.push(`/result/${sessionId}`);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 p-4 pb-24">
      <div className="pt-6">
        <div className="h-1.5 w-full rounded-full bg-zinc-200">
          <div
            className="h-1.5 rounded-full bg-zinc-900 transition-all"
            style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          Question {step + 1} of {QUESTIONS.length}
        </p>
      </div>

      <QuestionCard question={question} form={form} onChange={handleChange} />

      <div className="fixed inset-x-0 bottom-0 mx-auto flex max-w-md gap-3 border-t border-zinc-200 bg-white p-4">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-lg border border-zinc-300 px-4 py-3 text-sm text-zinc-700 disabled:opacity-40"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!canAdvance}
          className="flex-1 rounded-lg bg-zinc-900 px-4 py-3 text-sm text-white disabled:opacity-40"
        >
          {isLastStep ? 'See my result' : 'Next'}
        </button>
      </div>
    </main>
  );
}
