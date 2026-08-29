/**
 * ECSA rules constants — v1.
 *
 * Every constant here traces to a clause in docs/ecsa-rules-v1.md, which in
 * turn traces to R-01-POL-PC Rev 5 or R-03-PRO-PC Rev 4. Do not add a number
 * here (or anywhere else in the app) that isn't sourced that way, except
 * where explicitly marked "Product decision" below — those govern
 * commercial segmentation, not ECSA eligibility, and are not sourced from
 * either policy document.
 *
 * Never edit this file's exported values in place once results reference
 * `RULE_VERSION`. If ECSA revises R-01 or R-03, add lib/rules/v2.ts instead.
 */

export const RULE_VERSION = 'v1' as const;

export const DURATION = {
  /** R-01 Schedule 4 — 3 years training and experience after qualification. */
  minMonthsSinceQualification: 36,
  /** R-03 §4.1.4(1) — at least one year of TERs at Level E. */
  minMonthsAtLevelE: 12,
  /** R-03 §4.1.4(2) — TEO relaxation threshold, years since qualification. */
  teoRelaxationMinYears: 10,
  /** R-03 §4.1.4(2) — TEO relaxation threshold, years at Level E. */
  teoRelaxationMinYearsAtE: 3,
} as const;

/** R-03 §4.1.3, from R-04-T&M-GUIDE-PC. */
export const RESPONSIBILITY_LEVELS = [
  { code: 'A', label: 'Being exposed' },
  { code: 'B', label: 'Assisting' },
  { code: 'C', label: 'Participating' },
  { code: 'D', label: 'Contributing' },
  { code: 'E', label: 'Performing' },
] as const;

/**
 * R-01 §5.1.1(a)-(d). `unknown` is not a clause route — it is the product's
 * catch-all for an applicant who cannot say which route applies, which is
 * handled identically to route (d) per ecsa-rules-v1.md §1 "Product
 * decision" (a distinct outcome state, not a band on the readiness scale).
 */
export const EDUCATION_ROUTES = [
  'accredited',
  'washington_accord',
  'substantially_equivalent',
  'individual_assessment',
  'unknown',
] as const;

/**
 * Education routes that satisfy the educational requirement without further
 * case-by-case evaluation — routes (a), (b) and (c). Route (d) and an
 * unresolved route (c) do not, and short-circuit to state S0.
 * ecsa-rules-v1.md §1, §6.1.
 */
export const RESOLVED_EDUCATION_ROUTES = [
  'accredited',
  'washington_accord',
  'substantially_equivalent',
] as const;

/** R-03 Table 2, "For registration as a professional engineer" column. */
export const ARTEFACTS = [
  { code: 'application_form', label: 'Online application form' },
  { code: 'declaration', label: 'Declaration signed by applicant and Commissioner of Oaths' },
  { code: 'proof_of_identity', label: 'Proof of identity (SA ID / foreign passport)' },
  { code: 'qualification_certificates', label: 'Qualification certificates' },
  { code: 'academic_record', label: 'Academic Record / transcript' },
  { code: 'tes', label: 'Training and Experience Summary' },
  { code: 'ter', label: 'Training and Experience Reports (or TEOs where permitted)' },
  { code: 'er', label: 'Engineering Report (incorporating self-assessment)' },
  { code: 'referee_reports', label: 'Referee Reports (2)' },
  { code: 'ipd_record', label: 'Record of IPD (pre-registration CPD)' },
  { code: 'supervisor_checklist', label: "Supervisor's checklist (Appendix J)" },
  { code: 'va_membership', label: 'Proof of Voluntary Association membership' },
] as const;

/**
 * R-03 Appendix B — outcomes ECSA states "may not be covered" (C6, D8, D9)
 * or is "not covered" (E11) by the Training and Experience Reports. These
 * ride on the Engineering Report, IPD record, Referee Reports and the
 * Professional Review interview instead. ecsa-rules-v1.md §4.
 */
export const THIN_EVIDENCE_OUTCOMES = ['C6', 'D8', 'D9', 'E11'] as const;

/**
 * Product decision — not sourced from an ECSA clause. Governs how the four
 * evidence dimensions (each scored 0..1) collapse into Low / Medium / High
 * for commercial segmentation (S1 vs S2, S3 vs S4 in ecsa-rules-v1.md §6.1).
 *
 * The banding uses the *weakest* dimension, not an average, because ECSA
 * evaluates artefact-by-artefact: one missing registered-Pr-Eng referee or
 * one undocumented Level E year blocks the application regardless of how
 * strong everything else is (ecsa-rules-v1.md §3.3, "structural blocker").
 * This is why "everything present except an unregistered referee" demotes
 * from S4 to S3 rather than averaging out to a high score.
 */
export const EVIDENCE_BANDS = {
  highMin: 0.85,
  mediumMin: 0.4,
} as const;

/**
 * TO VERIFY before launch — ecsa-rules-v1.md §7 open item: current ECSA
 * Registration Application Calendar window dates. Left null rather than
 * invented; nextWindowHint in the scoring result is null until this is set.
 */
export const NEXT_APPLICATION_WINDOW: { opensAt: string; closesAt: string } | null = null;

export type EducationRoute = (typeof EDUCATION_ROUTES)[number];
export type ResponsibilityLevelCode = (typeof RESPONSIBILITY_LEVELS)[number]['code'];
export type ArtefactCode = (typeof ARTEFACTS)[number]['code'];
export type ThinEvidenceOutcome = (typeof THIN_EVIDENCE_OUTCOMES)[number];

export interface Rules {
  ruleVersion: typeof RULE_VERSION;
  duration: typeof DURATION;
  responsibilityLevels: typeof RESPONSIBILITY_LEVELS;
  educationRoutes: typeof EDUCATION_ROUTES;
  resolvedEducationRoutes: typeof RESOLVED_EDUCATION_ROUTES;
  artefacts: typeof ARTEFACTS;
  thinEvidenceOutcomes: typeof THIN_EVIDENCE_OUTCOMES;
  evidenceBands: typeof EVIDENCE_BANDS;
  nextApplicationWindow: { opensAt: string; closesAt: string } | null;
}

export const RulesV1: Rules = {
  ruleVersion: RULE_VERSION,
  duration: DURATION,
  responsibilityLevels: RESPONSIBILITY_LEVELS,
  educationRoutes: EDUCATION_ROUTES,
  resolvedEducationRoutes: RESOLVED_EDUCATION_ROUTES,
  artefacts: ARTEFACTS,
  thinEvidenceOutcomes: THIN_EVIDENCE_OUTCOMES,
  evidenceBands: EVIDENCE_BANDS,
  nextApplicationWindow: NEXT_APPLICATION_WINDOW,
};
