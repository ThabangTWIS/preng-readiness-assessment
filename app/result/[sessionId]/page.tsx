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

const STATE_COPY: Record<Result['state'], { heading: string; blurb: string }> = {
  S0: {
    heading: 'Your route needs an individual assessment first',
    blurb:
      'ECSA evaluates your educational qualification case-by-case (E-17-PRO) before a readiness timeline is meaningful.',
  },
  S1: {
    heading: 'Not yet eligible — and there is little compiled yet',
    blurb: 'You have time before you need to apply. Use it to start building your evidence now.',
  },
  S2: {
    heading: 'Not yet eligible — but evidence is building well',
    blurb: 'You cannot submit yet. That is exactly why compiling now, while details are fresh, pays off.',
  },
  S3: {
    heading: 'Eligible to apply — evidence needs work',
    blurb: 'You meet ECSA’s duration and Level E requirements. Your documentation is the gap now.',
  },
  S4: {
    heading: 'Eligible, with strong evidence',
    blurb: 'Your fundamentals look ready. Double-check the details below before you submit.',
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
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 p-4 text-center">
        <p className="text-zinc-700">We couldn&apos;t find a result for this link on this device.</p>
        <Link href="/assessment" className="rounded-lg bg-zinc-900 px-4 py-3 text-sm text-white">
          Start a new assessment
        </Link>
      </main>
    );
  }

  const { result } = stored;
  const copy = STATE_COPY[result.state];
  const topBlocker = result.blockers[0] ?? result.failedGates[0];

  function handleUnlock() {
    if (!consent || !email) return;
    // TODO(Phase 4): POST to /api/lead once Supabase persistence exists.
    setUnlocked(true);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 p-4 pb-16">
      <div className="pt-6">
        <span className="inline-block rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white">
          {result.state}
        </span>
        <h1 className="mt-3 text-xl font-semibold text-zinc-900">{copy.heading}</h1>
        <p className="mt-2 text-sm text-zinc-600">{copy.blurb}</p>
      </div>

      {topBlocker && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-700">Top blocker</p>
          <p className="mt-1 text-sm text-amber-900">{topBlocker.message}</p>
        </div>
      )}

      <Disclaimer />

      {!unlocked ? (
        <div className="rounded-lg border border-zinc-300 p-4">
          <p className="text-sm font-medium text-zinc-900">
            See your full breakdown, months-to-eligible, and action plan
          </p>
          <div className="mt-3 flex flex-col gap-2">
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-lg border border-zinc-300 px-4 py-3 text-sm"
            />
            <label className="flex items-start gap-2 text-xs text-zinc-600">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                className="mt-0.5 h-4 w-4"
              />
              I agree to receive my assessment result and related communications about
              Engineering Companion by email. My response data is stored separately from
              this email address and I can unsubscribe at any time.
            </label>
            <button
              type="button"
              onClick={handleUnlock}
              disabled={!email || !consent}
              className="rounded-lg bg-zinc-900 px-4 py-3 text-sm text-white disabled:opacity-40"
            >
              Unlock full report
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">Evidence dimensions</h2>
            <div className="mt-2 flex flex-col gap-2">
              {Object.entries(result.dimensions).map(([dimension, value]) => (
                <div key={dimension}>
                  <div className="flex justify-between text-xs text-zinc-600">
                    <span className="capitalize">{dimension.replace(/([A-Z])/g, ' $1')}</span>
                    <span>{Math.round(value * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-200">
                    <div
                      className="h-1.5 rounded-full bg-zinc-900"
                      style={{ width: `${value * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {result.monthsToEligible !== null && (
            <p className="text-sm text-zinc-700">
              Estimated <strong>{result.monthsToEligible} month(s)</strong> until you meet the
              duration requirements.
            </p>
          )}

          {result.blockers.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">Action plan</h2>
              <ul className="mt-2 flex flex-col gap-2">
                {result.blockers.map((blocker) => (
                  <li key={blocker.code} className="rounded-lg border border-zinc-200 p-3 text-sm text-zinc-700">
                    {blocker.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.notes.length > 0 && (
            <div className="flex flex-col gap-2">
              {result.notes.map((note) => (
                <p key={note.code} className="rounded-lg bg-zinc-100 p-3 text-xs text-zinc-600">
                  {note.message}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
