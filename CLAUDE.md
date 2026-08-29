# CLAUDE.md — PrEng Readiness Assessment

Standing context for this repository. Load every session.

## What this is

A public, unauthenticated self-assessment tool that tells a South African
engineer whether they are ready to apply to ECSA for registration as a
Professional Engineer (Pr Eng), and if not, what is missing and roughly when
they will be eligible.

It is a lead-generation and onboarding front door for **Engineering Companion**,
an existing app that helps candidates compile their ECSA registration
documentation. This repo is a separate deployment on its own domain, not part of
the Engineering Companion codebase.

Two jobs, in priority order:

1. Give the engineer a genuinely useful, accurate verdict.
2. Segment them into one of four commercial states and capture the lead.

If those two ever conflict, accuracy wins. This tool makes claims adjacent to a
regulator's decisions, and a wrong verdict shown to a real candidate is a
reputational problem that no conversion rate offsets.

## Hard rules for the agent

- **Never invent, infer, or "reasonably assume" an ECSA rule.** Every threshold,
  requirement, and artefact in the scoring logic must trace to a clause in
  `docs/ecsa-rules-v1.md`, which in turn traces to R-01-POL-PC Rev 5 or
  R-03-PRO-PC Rev 4. If a rule you need is not in that document, stop and ask.
  Do not fill the gap.
- **All domain constants live in `lib/rules/v1.ts`.** No thresholds, no artefact
  lists, no band boundaries hard-coded in components, API routes, or scoring
  branches. If you find yourself typing a number like `3` or `12` outside that
  file, it belongs in that file.
- **Scoring is a pure function.** `lib/scoring.ts` takes answers plus a rules
  object and returns a result. No I/O, no framework imports, no Supabase, no
  `Date.now()` (pass the evaluation date in). This is the only part of the app
  that must be right, and purity is what makes it testable.
- **Supabase is never called from the browser.** All writes go through Next.js
  route handlers using the service role key, server-side only. The anon key does
  not appear in client code.
- **Questions are data, not JSX.** Defined in `lib/questions.ts` as typed
  objects. Wording will be rewritten many times during marketing testing; that
  must be an edit to an array, not a component refactor.
- **No scope creep into the main app.** This tool assesses and captures. It does
  not generate TERs, Engineering Reports, or any registration documentation.
  That is what Engineering Companion is for, and it is the thing being sold.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase (Postgres) for storage
- Vercel for deployment
- Vitest for unit tests

No auth, no user accounts, no ORM. Anonymous session id generated client-side,
persisted for the session, used as the key across tables.

## Structure

```
/app
  /page.tsx                  landing
  /assessment/page.tsx       question flow (client state only)
  /result/[sessionId]/page.tsx  verdict + gated detail
  /api/submit/route.ts       answers -> score -> Supabase
  /api/lead/route.ts         email capture + consent
/lib
  /rules/v1.ts               ALL domain constants, versioned
  /scoring.ts                pure scoring function
  /scoring.test.ts           unit tests, one per band + edge cases
  /questions.ts              question definitions as data
  /supabase.ts               server-side client only
/docs
  /ecsa-rules-v1.md          domain truth, clause-referenced
  /build-brief.md            initial build sequence (archive when shipped)
```

## Conventions

- TypeScript strict mode. No `any` in `lib/`.
- Every result row stores `rule_version`. When ECSA revises its documents, a new
  `lib/rules/v2.ts` is added alongside v1; v1 is never edited in place, so old
  results stay explainable.
- Dates: store and compute in UTC, display in SAST. Durations in whole months.
- Copy is South African English. "Programme", "organisation", "recognised".
- Currency in ZAR.

## Working agreement

- Build in the order set out in `docs/build-brief.md`. Scoring function and its
  tests come before any UI.
- Write the test before the branch it covers.
- Ask before adding a dependency.
- Do not run `git push` or deploy. Commits are fine; I handle remotes.
- If the ECSA source documents are in context and your reading of a clause
  differs from `docs/ecsa-rules-v1.md`, raise it. Do not silently follow either
  one.

## Legal and compliance (non-negotiable, in the UI)

- The tool is not affiliated with, endorsed by, or acting on behalf of ECSA.
- The output is a self-assessment indicator based on published ECSA policy
  documents, not a prediction or determination of an ECSA outcome.
- POPIA: explicit consent checkbox before email capture, stating purpose
  (assessment result and related communications about Engineering Companion) and
  retention. Working unsubscribe path. Lead data stored separately from
  assessment responses so a deletion request can be honoured without destroying
  anonymised analytics.
