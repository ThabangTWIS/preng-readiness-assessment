# Build Brief — PrEng Readiness Assessment MVP

One-time document describing the initial build sequence. Archive or delete once
the MVP has shipped. Standing context lives in `CLAUDE.md`; domain truth lives in
`docs/ecsa-rules-v1.md`.

Build in this order. Do not start a phase until the previous one's acceptance
criteria pass.

---

## Phase 0 — Scaffold

Next.js App Router + TypeScript + Tailwind + Vitest. Nothing else yet.

**Acceptance:** `npm run dev` serves a placeholder page; `npm run test` runs and
passes with zero tests.

---

## Phase 1 — Rules and scoring (the only part that must be right)

### 1.1 `lib/rules/v1.ts`

Encode every constant from `docs/ecsa-rules-v1.md`. Nothing derived, nothing
invented. Suggested shape:

```ts
export const RULE_VERSION = 'v1';

export const DURATION = {
  minMonthsSinceQualification: 36,   // R-01 Schedule 4
  minMonthsAtLevelE: 12,             // R-03 §4.1.4(1)
  teoRelaxationMinYears: 10,         // R-03 §4.1.4(2)
  teoRelaxationMinYearsAtE: 3,
} as const;

export const RESPONSIBILITY_LEVELS = [
  { code: 'A', label: 'Being exposed' },
  { code: 'B', label: 'Assisting' },
  { code: 'C', label: 'Participating' },
  { code: 'D', label: 'Contributing' },
  { code: 'E', label: 'Performing' },
] as const;

export const EDUCATION_ROUTES = ['accredited', 'washington_accord',
  'substantially_equivalent', 'individual_assessment', 'unknown'] as const;

export const ARTEFACTS = [ /* R-03 Table 2, Pr Eng column */ ] as const;

export const THIN_EVIDENCE_OUTCOMES = ['C6', 'D8', 'D9', 'E11'] as const;
```

Every constant gets a trailing comment with its clause reference.

### 1.2 `lib/scoring.ts`

```ts
export function score(answers: Answers, rules: Rules, evaluatedAt: Date): Result
```

Pure. No imports beyond types and the rules object. Returns:

```ts
type Result = {
  ruleVersion: string;
  state: 'S0' | 'S1' | 'S2' | 'S3' | 'S4';
  eligible: boolean;
  failedGates: Gate[];
  monthsToEligible: number | null;   // null for S0
  nextWindowHint: string | null;
  dimensions: {
    documentation: number;      // 0..1
    supportStructure: number;
    outcomeCoverage: number;
    administrative: number;
  };
  blockers: Blocker[];           // ordered, most severe first
  notes: Note[];                 // e.g. TEO relaxation available
};
```

Order of evaluation:

1. Education route. If `individual_assessment` or `unknown`, return **S0**
   immediately. No months-to-eligible, no bands.
2. Duration gates. Compute `monthsSinceQualification` from the qualification
   date, **not** from first employment (R-01 §5.4).
3. Level E gate.
4. Evidence dimensions.
5. Map to state per `docs/ecsa-rules-v1.md` §6.1.

### 1.3 `lib/scoring.test.ts`

Minimum coverage, one test each:

- S0 via individual assessment route
- S0 via unknown evaluation status
- S1 — 18 months post-qualification, nothing documented
- S2 — 24 months post-qualification, TERs drafted and signed as they went
- S3 — 5 years, 2 years at Level E, no ER, no referees identified
- S4 — everything present, referee is a registered Pr Eng, strong on C6/D8/D9
- S4 → S3 demotion — everything present but no registered Pr Eng referee
- Boundary: exactly 36 months, exactly 12 months at Level E (both should pass)
- Boundary: 35 months / 12 months at E (fail on duration only)
- `monthsToEligible` returns the larger of the two remaining gaps
- TEO relaxation note fires at 10+ years with 3+ at Level E

**Acceptance:** all tests pass; `score()` has no imports from `next`,
`@supabase/*`, or React.

---

## Phase 2 — Questions as data

`lib/questions.ts`. Target **12–18 questions**. Every question must either change
the verdict or change the lead segment. If it does neither, cut it.

Working set:

**Eligibility**
1. Qualification held (options mapped to education routes; include "not sure")
2. Institution and year the qualification was obtained
3. Whether the qualification appears on ECSA's accredited list (with a link)

**Experience and responsibility**
4. Career phases: for each, dates plus self-placed responsibility level. Show the
   full A–E ladder with ECSA's descriptors and let them place each phase. Do not
   ask "are you at Level E" directly — people over-rate themselves, and the phase
   structure gives you a partial TES as a byproduct.
5. Current role: are they responsible for the outcomes of significant parts of
   complex engineering activities (the Outcome 10 range statement, in plain
   language)?

**Evidence**
6. TES compiled?
7. TERs written per phase? (none / some / most / all)
8. TERs signed by the supervisor at the time?
9. Engineering Report started? (not started / outline / draft / complete)
10. IPD record maintained?

**Support structure**
11. Can they name two referees with personal knowledge of their work?
12. Is at least one of them registered as Pr Eng or Pr Cert Eng?
13. Is a mentor available to verify the application before submission?

**Outcome coverage** (self-rate, weak-to-strong)
14. Evidence of recognising and addressing foreseeable impacts (C6)
15. Evidence of ethical conduct in engineering decisions (D8)
16. Evidence of exercising sound judgement (D9)
17. Record of professional development activities (E11)

**Segmentation only**
18. Discipline, and employer type (consultancy / contractor / government /
    parastatal / mining / other)

**Acceptance:** questions render from data; changing wording touches only this
file.

---

## Phase 3 — Flow and result UI

Routes: `/` landing, `/assessment`, `/result/[sessionId]`.

- Client-side state during the flow. One submit at the end.
- Progress indicator. Back navigation preserves answers.
- **Result page shows the verdict band and the top blocker immediately, ungated.**
- Detailed breakdown, dimension scores, months-to-eligible, and the action plan
  sit **behind the email gate**. Gating everything kills completion; gating
  nothing kills conversion.
- Disclaimer visible on the result page, not only in the footer.
- Mobile first. Most of this traffic will arrive from LinkedIn on a phone.

**Acceptance:** full flow completes on a 375px viewport; refresh on `/result/[id]`
re-renders from the stored result rather than client state.

---

## Phase 4 — Persistence

Supabase, four tables:

```sql
assessment_sessions (
  id uuid primary key,
  created_at timestamptz default now(),
  completed_at timestamptz,
  utm_source text, utm_medium text, utm_campaign text, referrer text
)

responses (
  id bigserial primary key,
  session_id uuid references assessment_sessions(id),
  question_key text not null,
  value jsonb not null,
  created_at timestamptz default now()
)

results (
  session_id uuid primary key references assessment_sessions(id),
  rule_version text not null,
  state text not null,
  eligible boolean not null,
  months_to_eligible int,
  dimensions jsonb not null,
  blockers jsonb not null,
  created_at timestamptz default now()
)

leads (
  id uuid primary key,
  session_id uuid references assessment_sessions(id),
  email text not null,
  consent_at timestamptz not null,
  consent_text_version text not null,
  discipline text, employer_type text,
  follow_up_date date,
  created_at timestamptz default now()
)
```

Leads are deliberately separate from responses so a POPIA deletion request can
drop the lead row without destroying anonymised analytics.

`/api/submit` scores server-side and writes session, responses and result.
`/api/lead` writes the lead. Both use the **service role key, server-side only**.
RLS on, with no public policies — nothing is reachable from the browser.

Validate all input with a schema (zod) at the route boundary. Rate-limit both
routes.

**Acceptance:** the anon key does not appear anywhere in `/app` client
components; a direct browser request to Supabase returns nothing.

---

## Phase 5 — Compliance and copy

- Consent checkbox with explicit purpose and retention wording. Store the
  consent text version on the lead row so you can prove what was agreed to.
- Non-affiliation disclaimer per `CLAUDE.md`.
- Privacy page. Working unsubscribe path.
- Verify the open items in `docs/ecsa-rules-v1.md` §7 before going live.

---

## Explicitly out of scope for the MVP

Deferred, in rough priority order. Do not build these without a decision:

- Technologist, Technician and Certificated Engineer categories
- User accounts or saved progress
- PDF export of the result
- Session handoff into the Engineering Companion app (needs a signed token or a
  shared key across origins — decide the key strategy now, build later)
- Any LLM-generated narrative in the report
- Admin dashboard (query Supabase directly for the MVP)
- Payment or checkout of any kind
