'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { Answers, Result } from '@/lib/scoring';
import { Disclaimer } from '@/components/Disclaimer';

interface StoredResult {
  answers: Answers;
  result: Result;
  computedAt: string;
}

// sessionStorage isn't available during server rendering, so reading it goes
// through useSyncExternalStore (getServerSnapshot: null) rather than an
// effect — this avoids a hydration mismatch. Results are cached per
// sessionId so getSnapshot returns a stable reference across renders.
const resultCache = new Map<string, StoredResult | null>();

function noopSubscribe() {
  return () => {};
}

function getServerSnapshot(): StoredResult | null {
  return null;
}

/** Short plain-word category shown right next to the raw state code, so
 * "S3" is never on screen without an immediate answer to "what does that mean". */
const STATE_CATEGORY: Record<Result['state'], string> = {
  S0: 'Needs individual assessment',
  S1: 'Not yet eligible',
  S2: 'Not yet eligible',
  S3: 'Eligible',
  S4: 'Eligible',
};

const STATE_COPY: Record<Result['state'], { heading: string; blurb: string }> = {
  S0: {
    heading: 'Your route needs an individual assessment first',
    blurb:
      'ECSA evaluates your educational qualification case-by-case (E-17-PRO) before a readiness timeline is meaningful.',
  },
  S1: {
    heading: "There's little compiled so far",
    blurb: 'You have time before you need to apply. Use it to start building your evidence now.',
  },
  S2: {
    heading: 'Evidence is building well',
    blurb: 'You cannot submit yet. That is exactly why compiling now, while details are fresh, pays off.',
  },
  S3: {
    heading: 'Evidence needs work',
    blurb: 'You meet ECSA\'s duration and Level E requirements. Your documentation is the gap now.',
  },
  S4: {
    heading: 'Evidence looks strong',
    blurb: 'Your fundamentals look ready. Double-check the details below before you submit.',
  },
};

/** Per-state commercial action, matching ecsa-rules-v1.md §6.1. Always visible
 * (not gated behind the email form) since it's guidance, not score detail. */
const NEXT_STEP: Record<Result['state'], { body: string; cta: string }> = {
  S0: {
    body: "ECSA needs to individually assess your qualification under E-17-PRO before a training-and-experience timeline applies to you. Start that process directly with ECSA, then come back and run this assessment again once your route is confirmed.",
    cta: 'Guide to the individual assessment route: (coming soon)',
  },
  S1: {
    body: 'You have time before the duration requirements are met. Use it: start your Training and Experience Summary now, while details are easy to recall, rather than waiting until you are closer to applying.',
    cta: 'Unlock the starter checklist below.',
  },
  S2: {
    body: 'You cannot submit an application yet, and that is exactly why compiling your evidence now matters: supervisor memories fade and people change roles. Engineering Companion helps you compile this properly while it is still fresh.',
    cta: 'Get help from Engineering Companion: (coming soon)',
  },
  S3: {
    body: "You meet ECSA's duration and Level E requirements. The gap is documentation, and closing it is exactly what Engineering Companion helps with, ready for the next ECSA application window.",
    cta: 'Start with Engineering Companion: (coming soon)',
  },
  S4: {
    body: 'Your fundamentals look ready. If your Engineering Report and referee reports hold up under review, you are close. Would you help others get here too?',
    cta: 'Refer a colleague or leave feedback: (coming soon)',
  },
};

const DIMENSION_INFO: Record<keyof Result['dimensions'], { label: string; help: string }> = {
  documentation: {
    label: 'Documentation',
    help: 'How much of your TES, TERs, Engineering Report and IPD record is done',
  },
  supportStructure: {
    label: 'Support structure',
    help: 'Referees, mentor and supervisor sign-off readiness',
  },
  outcomeCoverage: {
    label: 'Outcome coverage',
    help: 'How well you can show the outcomes ECSA says TERs alone may not cover',
  },
  administrative: {
    label: 'Administrative',
    help: 'ID, certificates and other paperwork readiness',
  },
};

function loadResult(sessionId: string): StoredResult | null {
  try {
    const raw = sessionStorage.getItem(`preng-result:${sessionId}`);
    return raw ? (JSON.parse(raw) as StoredResult) : null;
  } catch {
    return null;
  }
}

export default function ResultPage() {
  const params = useParams<{ sessionId: string }>();
  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);

  const stored = useSyncExternalStore(
    noopSubscribe,
    () => {
      if (!resultCache.has(params.sessionId)) {
        resultCache.set(params.sessionId, loadResult(params.sessionId));
      }
      return resultCache.get(params.sessionId) ?? null;
    },
    getServerSnapshot,
  );

  if (stored === null) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 bg-white p-4 text-center">
        <p className="text-navy">We couldn&apos;t find a result for this link on this device.</p>
        <Link href="/assessment" className="rounded-lg bg-navy px-4 py-3 text-sm text-white">
          Start a new assessment
        </Link>
      </main>
    );
  }

  const { result } = stored;
  const copy = STATE_COPY[result.state];
  const nextStep = NEXT_STEP[result.state];
  const topBlocker = result.blockers[0] ?? result.failedGates[0];

  function handleUnlock() {
    if (!consent || !email) return;
    // TODO(Phase 4): POST to /api/lead once Supabase persistence exists.
    setUnlocked(true);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 bg-white p-4 pb-16">
      <div className="pt-6">
        <div className="flex items-center gap-2">
          <span className="inline-block rounded-full bg-navy px-3 py-1 text-xs font-medium text-white">
            {result.state}
          </span>
          <span className="text-sm font-medium text-navy/70">{STATE_CATEGORY[result.state]}</span>
        </div>
        <h1 className="font-heading mt-3 text-2xl font-bold text-navy">{copy.heading}</h1>
        <p className="mt-2 text-sm text-navy/80">{copy.blurb}</p>
      </div>

      {topBlocker && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-700">Top blocker</p>
          <p className="mt-1 text-sm text-amber-900">{topBlocker.message}</p>
        </div>
      )}

      <div className="rounded-lg border border-navy/20 bg-navy-tint p-4">
        <h2 className="font-heading text-sm font-bold text-navy">Your next step</h2>
        <p className="mt-2 text-sm text-navy/80">{nextStep.body}</p>
        <p className="mt-3 text-xs text-navy/40">{nextStep.cta}</p>
      </div>

      {!unlocked ? (
        <div className="rounded-lg border border-navy/20 p-4">
          <p className="text-sm font-medium text-navy">
            See your full breakdown, months-to-eligible, and action plan
          </p>
          <div className="mt-3 flex flex-col gap-2">
            <input
              type="email"
              placeholder="FuturePr@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-lg border border-zinc-300 px-4 py-3 text-sm text-foreground focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/40"
            />
            <label className="flex items-start gap-2 text-xs text-navy/70">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                className="mt-0.5 h-4 w-4 accent-navy"
              />
              I agree that any follow-up about my results or Engineering Companion will be
              sent to this email address, stored separately from my assessment answers, and
              that I can unsubscribe at any time.
            </label>
            <button
              type="button"
              onClick={handleUnlock}
              disabled={!email || !consent}
              className="rounded-lg bg-navy px-4 py-3 text-sm text-white disabled:opacity-40"
            >
              Unlock full report
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="font-heading text-sm font-bold text-navy">Evidence dimensions</h2>
            <div className="mt-2 flex flex-col gap-3">
              {(Object.entries(result.dimensions) as [keyof Result['dimensions'], number][]).map(
                ([dimension, value]) => (
                  <div key={dimension}>
                    <div className="flex justify-between text-xs text-navy/70">
                      <span>{DIMENSION_INFO[dimension].label}</span>
                      <span>{Math.round(value * 100)}%</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-navy-tint">
                      <div className="h-1.5 rounded-full bg-blue" style={{ width: `${value * 100}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-navy/50">{DIMENSION_INFO[dimension].help}</p>
                  </div>
                ),
              )}
            </div>
          </div>

          {result.monthsToEligible !== null && (
            <p className="text-sm text-navy/80">
              Estimated <strong>{result.monthsToEligible} month(s)</strong> until you meet the
              duration requirements.
            </p>
          )}

          {result.blockers.length > 0 && (
            <div>
              <h2 className="font-heading text-sm font-bold text-navy">Action plan</h2>
              <ul className="mt-2 flex flex-col gap-2">
                {result.blockers.map((blocker) => (
                  <li key={blocker.code} className="rounded-lg border border-navy/15 p-3 text-sm text-navy/80">
                    {blocker.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.notes.length > 0 && (
            <div className="flex flex-col gap-2">
              {result.notes.map((note) => (
                <p key={note.code} className="rounded-lg bg-navy-tint p-3 text-xs text-navy/70">
                  {note.message}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      <Disclaimer />
    </main>
  );
}
