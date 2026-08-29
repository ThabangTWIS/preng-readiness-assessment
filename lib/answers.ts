import type { EducationRoute } from './rules/v1';
import type { Answers, ArtefactProgress, GradeLevel, TerCoverage } from './scoring';

/**
 * Maps the flat form-response bag collected during the assessment flow
 * (keyed by each question's `key`, or each group/checklist item's `key`)
 * into the `Answers` shape `score()` requires. Pure, no framework imports —
 * the flow (app/assessment) owns state and I/O, this just does the
 * translation so scoring.ts stays untouched by UI concerns.
 */
export type FormState = Record<string, unknown>;

function asGrade(value: unknown): GradeLevel {
  return value === 'weak' || value === 'moderate' || value === 'strong' ? value : 'none';
}

function asProgress(value: unknown): ArtefactProgress {
  return value === 'outline' || value === 'draft' || value === 'complete' ? value : 'not_started';
}

function asTerCoverage(value: unknown): TerCoverage {
  return value === 'some' || value === 'most' || value === 'all' ? value : 'none';
}

function asRefereeCount(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

/**
 * Picking a real institution from `institutionSelection` (sourced from
 * ECSA's E-20-PE list, see lib/rules/v1.ts ACCREDITED_INSTITUTIONS) is
 * itself the full signal for route (a) — R-01 Schedule 1 / §5.1.1(a). There
 * is deliberately no separate confirmation question; the discipline/year
 * mismatch risk this leaves uncaught is an accepted MVP limitation
 * documented alongside ACCREDITED_INSTITUTIONS, not an oversight here.
 *
 * Choosing "other" reveals `educationRouteOther`, carrying the remaining
 * routes (Washington Accord, substantially equivalent, or unknown/not sure).
 */
function resolveEducationRoute(form: FormState): EducationRoute {
  const institution = form.institutionSelection as string | undefined;
  if (institution && institution !== 'other') return 'accredited';
  return (form.educationRouteOther as EducationRoute | undefined) ?? 'unknown';
}

export function buildAnswers(form: FormState): Answers {
  return {
    educationRoute: resolveEducationRoute(form),
    qualificationDate: (form.qualificationDate as string) ?? '',
    careerPhases: (form.careerPhases as Answers['careerPhases']) ?? [],

    tesCompiled: Boolean(form.tesCompiled),
    terCoverage: asTerCoverage(form.terCoverage),
    tersSignedBySupervisor: Boolean(form.tersSignedBySupervisor),
    erStatus: asProgress(form.erStatus),
    ipdRecordMaintained: Boolean(form.ipdRecordMaintained),

    refereesIdentifiedCount: asRefereeCount(form.refereesIdentifiedCount),
    hasRegisteredPrEngReferee: form.hasRegisteredPrEngReferee === 'yes',
    supervisorWillingToSign: Boolean(form.supervisorWillingToSign),
    mentorAvailable: Boolean(form.mentorAvailable),

    outcomeStrength: {
      c6: asGrade(form['outcomeStrength.c6']),
      d8: asGrade(form['outcomeStrength.d8']),
      d9: asGrade(form['outcomeStrength.d9']),
      e11: asGrade(form['outcomeStrength.e11']),
    },

    academicRecordAvailable: Boolean(form.academicRecordAvailable),
    qualificationCertificatesAvailable: Boolean(form.qualificationCertificatesAvailable),
    idDocumentAvailable: Boolean(form.idDocumentAvailable),
    vaMembershipProof: Boolean(form.vaMembershipProof),
    declarationSigned: Boolean(form.declarationSigned),
  };
}
