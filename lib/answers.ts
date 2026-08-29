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
 * Q3 ("is your qualification on ECSA's accredited list?") only bears on the
 * self-reported 'accredited' route (R-01 Schedule 1 / §5.1.1(a)) — a
 * Washington Accord or case-by-case-equivalent route isn't checked against
 * that list. An applicant who isn't sure their qualification is on the list
 * hasn't established route (a), so they fall back to 'unknown' rather than
 * scoring as if they had.
 */
function resolveEducationRoute(form: FormState): EducationRoute {
  const selfReport = form.educationRouteSelfReport as EducationRoute | undefined;
  if (selfReport === 'accredited') {
    return form.onAccreditedList === 'yes' ? 'accredited' : 'unknown';
  }
  return selfReport ?? 'unknown';
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
