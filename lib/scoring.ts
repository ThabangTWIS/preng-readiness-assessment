import type { EducationRoute, ResponsibilityLevelCode, Rules } from './rules/v1';

/**
 * Pure scoring function. No I/O, no framework imports, no Date.now() — the
 * evaluation date is always passed in. This is the only part of the app
 * that must be right; see CLAUDE.md.
 */

export interface CareerPhase {
  /** ISO date (yyyy-mm-dd). */
  startDate: string;
  /** ISO date (yyyy-mm-dd), or null if this phase is ongoing. */
  endDate: string | null;
  level: ResponsibilityLevelCode;
}

export type GradeLevel = 'none' | 'weak' | 'moderate' | 'strong';
export type ArtefactProgress = 'not_started' | 'outline' | 'draft' | 'complete';
export type TerCoverage = 'none' | 'some' | 'most' | 'all';

export interface Answers {
  educationRoute: EducationRoute;
  /** ISO date (yyyy-mm-dd) the educational requirement was met. */
  qualificationDate: string;
  careerPhases: CareerPhase[];

  tesCompiled: boolean;
  terCoverage: TerCoverage;
  tersSignedBySupervisor: boolean;
  erStatus: ArtefactProgress;
  ipdRecordMaintained: boolean;

  refereesIdentifiedCount: 0 | 1 | 2;
  hasRegisteredPrEngReferee: boolean;
  supervisorWillingToSign: boolean;
  mentorAvailable: boolean;

  outcomeStrength: {
    c6: GradeLevel;
    d8: GradeLevel;
    d9: GradeLevel;
    e11: GradeLevel;
  };

  academicRecordAvailable: boolean;
  qualificationCertificatesAvailable: boolean;
  idDocumentAvailable: boolean;
  vaMembershipProof: boolean;
  declarationSigned: boolean;
}

export type GateId = 'education_route' | 'duration_since_qualification' | 'duration_at_level_e';

export interface Gate {
  id: GateId;
  message: string;
}

export type BlockerSeverity = 'critical' | 'high' | 'medium';

export interface Blocker {
  code: string;
  message: string;
  severity: BlockerSeverity;
}

export interface Note {
  code: string;
  message: string;
}

export type State = 'S0' | 'S1' | 'S2' | 'S3' | 'S4';

export interface Dimensions {
  documentation: number;
  supportStructure: number;
  outcomeCoverage: number;
  administrative: number;
}

export interface Result {
  ruleVersion: string;
  state: State;
  eligible: boolean;
  failedGates: Gate[];
  monthsToEligible: number | null;
  nextWindowHint: string | null;
  dimensions: Dimensions;
  blockers: Blocker[];
  notes: Note[];
}

/** Whole calendar months elapsed from `from` to `to`. Never negative. */
function wholeMonthsBetween(from: Date, to: Date): number {
  let months =
    (to.getUTCFullYear() - from.getUTCFullYear()) * 12 + (to.getUTCMonth() - from.getUTCMonth());
  if (to.getUTCDate() < from.getUTCDate()) {
    months -= 1;
  }
  return Math.max(0, months);
}

function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function monthsAtLevelE(careerPhases: CareerPhase[], evaluatedAt: Date): number {
  return careerPhases
    .filter((phase) => phase.level === 'E')
    .reduce((total, phase) => {
      const start = parseIsoDate(phase.startDate);
      const end = phase.endDate ? parseIsoDate(phase.endDate) : evaluatedAt;
      return total + wholeMonthsBetween(start, end);
    }, 0);
}

const GRADE_LEVEL_SCORE: Record<GradeLevel, number> = {
  none: 0,
  weak: 1 / 3,
  moderate: 2 / 3,
  strong: 1,
};

const ARTEFACT_PROGRESS_SCORE: Record<ArtefactProgress, number> = {
  not_started: 0,
  outline: 1 / 3,
  draft: 2 / 3,
  complete: 1,
};

const TER_COVERAGE_SCORE: Record<TerCoverage, number> = {
  none: 0,
  some: 1 / 3,
  most: 2 / 3,
  all: 1,
};

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function computeDimensions(answers: Answers): Dimensions {
  const documentation = average([
    answers.tesCompiled ? 1 : 0,
    TER_COVERAGE_SCORE[answers.terCoverage],
    answers.tersSignedBySupervisor ? 1 : 0,
    ARTEFACT_PROGRESS_SCORE[answers.erStatus],
    answers.ipdRecordMaintained ? 1 : 0,
  ]);

  const supportStructure = average([
    answers.refereesIdentifiedCount / 2,
    answers.hasRegisteredPrEngReferee ? 1 : 0,
    answers.supervisorWillingToSign ? 1 : 0,
    answers.mentorAvailable ? 1 : 0,
  ]);

  const outcomeCoverage = average([
    GRADE_LEVEL_SCORE[answers.outcomeStrength.c6],
    GRADE_LEVEL_SCORE[answers.outcomeStrength.d8],
    GRADE_LEVEL_SCORE[answers.outcomeStrength.d9],
    GRADE_LEVEL_SCORE[answers.outcomeStrength.e11],
  ]);

  const administrative = average([
    answers.academicRecordAvailable ? 1 : 0,
    answers.qualificationCertificatesAvailable ? 1 : 0,
    answers.idDocumentAvailable ? 1 : 0,
    answers.vaMembershipProof ? 1 : 0,
    answers.declarationSigned ? 1 : 0,
  ]);

  return { documentation, supportStructure, outcomeCoverage, administrative };
}

function evidenceBand(dimensions: Dimensions, rules: Rules): 'low' | 'medium' | 'high' {
  const weakest = Math.min(
    dimensions.documentation,
    dimensions.supportStructure,
    dimensions.outcomeCoverage,
    dimensions.administrative,
  );
  if (weakest >= rules.evidenceBands.highMin) return 'high';
  if (weakest >= rules.evidenceBands.mediumMin) return 'medium';
  return 'low';
}

function buildBlockers(
  failedGates: Gate[],
  answers: Answers,
  dimensions: Dimensions,
  rules: Rules,
): Blocker[] {
  const blockers: Blocker[] = [];

  for (const gate of failedGates) {
    blockers.push({ code: gate.id, message: gate.message, severity: 'critical' });
  }

  if (answers.refereesIdentifiedCount < 2) {
    blockers.push({
      code: 'referees_missing',
      message: 'Two referees with personal knowledge of your work have not both been identified.',
      severity: 'high',
    });
  } else if (!answers.hasRegisteredPrEngReferee) {
    blockers.push({
      code: 'referee_not_registered',
      message:
        'At least one referee must be registered with ECSA as a Professional Engineer or Professional Certificated Engineer.',
      severity: 'high',
    });
  }

  const weakOutcomes = (
    Object.entries(answers.outcomeStrength) as [keyof Answers['outcomeStrength'], GradeLevel][]
  ).filter(([, grade]) => grade === 'none' || grade === 'weak');
  if (weakOutcomes.length > 0) {
    blockers.push({
      code: 'thin_evidence_outcomes',
      message: `Evidence is thin for outcomes ECSA says may not be covered by TERs: ${weakOutcomes
        .map(([key]) => key.toUpperCase())
        .join(', ')}.`,
      severity: 'medium',
    });
  }

  if (dimensions.documentation < rules.evidenceBands.mediumMin) {
    blockers.push({
      code: 'documentation_thin',
      message: 'Core documentation (TES, TERs, ER, IPD record) is largely missing.',
      severity: 'medium',
    });
  }

  return blockers;
}

function buildNotes(monthsSinceQualification: number, monthsAtE: number, rules: Rules): Note[] {
  const notes: Note[] = [];
  const teoMinMonths = rules.duration.teoRelaxationMinYears * 12;
  const teoMinMonthsAtE = rules.duration.teoRelaxationMinYearsAtE * 12;
  if (monthsSinceQualification >= teoMinMonths && monthsAtE >= teoMinMonthsAtE) {
    notes.push({
      code: 'teo_relaxation_available',
      message:
        'With 10+ years of training and experience and 3+ years at Level E detailed in signed TERs, remaining periods may be submitted as Training and Experience Outlines (TEOs) instead of full TERs.',
    });
  }
  return notes;
}

export function score(answers: Answers, rules: Rules, evaluatedAt: Date): Result {
  const resolvedRoutes: readonly string[] = rules.resolvedEducationRoutes;
  if (!resolvedRoutes.includes(answers.educationRoute)) {
    return {
      ruleVersion: rules.ruleVersion,
      state: 'S0',
      eligible: false,
      failedGates: [
        {
          id: 'education_route',
          message:
            'Your educational route requires an individual case-by-case assessment by ECSA (E-17-PRO) before a readiness verdict is possible.',
        },
      ],
      monthsToEligible: null,
      nextWindowHint: null,
      dimensions: { documentation: 0, supportStructure: 0, outcomeCoverage: 0, administrative: 0 },
      blockers: [],
      notes: [],
    };
  }

  const qualificationDate = parseIsoDate(answers.qualificationDate);
  const monthsSinceQualification = wholeMonthsBetween(qualificationDate, evaluatedAt);
  const monthsAtE = monthsAtLevelE(answers.careerPhases, evaluatedAt);

  const failedGates: Gate[] = [];
  if (monthsSinceQualification < rules.duration.minMonthsSinceQualification) {
    failedGates.push({
      id: 'duration_since_qualification',
      message: `At least ${rules.duration.minMonthsSinceQualification} months of training and experience since meeting the educational requirement are needed; ${monthsSinceQualification} have passed.`,
    });
  }
  if (monthsAtE < rules.duration.minMonthsAtLevelE) {
    failedGates.push({
      id: 'duration_at_level_e',
      message: `At least ${rules.duration.minMonthsAtLevelE} months at Degree of Responsibility Level E (Performing) must be documented; ${monthsAtE} are.`,
    });
  }
  const eligible = failedGates.length === 0;

  const dimensions = computeDimensions(answers);
  const band = evidenceBand(dimensions, rules);

  const state: State = eligible
    ? band === 'high'
      ? 'S4'
      : 'S3'
    : band === 'low'
      ? 'S1'
      : 'S2';

  const monthsToEligible = eligible
    ? null
    : Math.max(
        rules.duration.minMonthsSinceQualification - monthsSinceQualification,
        rules.duration.minMonthsAtLevelE - monthsAtE,
        0,
      );

  return {
    ruleVersion: rules.ruleVersion,
    state,
    eligible,
    failedGates,
    monthsToEligible,
    nextWindowHint: rules.nextApplicationWindow
      ? `${rules.nextApplicationWindow.opensAt} – ${rules.nextApplicationWindow.closesAt}`
      : null,
    dimensions,
    blockers: buildBlockers(failedGates, answers, dimensions, rules),
    notes: buildNotes(monthsSinceQualification, monthsAtE, rules),
  };
}
