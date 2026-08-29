import { describe, expect, it } from 'vitest';
import { RulesV1 } from './rules/v1';
import { score, type Answers, type CareerPhase } from './scoring';

const EVALUATED_AT = new Date(Date.UTC(2026, 0, 15));

function makeAnswers(overrides: Partial<Answers> = {}): Answers {
  return {
    educationRoute: 'accredited',
    qualificationDate: '2020-01-15',
    careerPhases: [],
    tesCompiled: false,
    terCoverage: 'none',
    tersSignedBySupervisor: false,
    erStatus: 'not_started',
    ipdRecordMaintained: false,
    refereesIdentifiedCount: 0,
    hasRegisteredPrEngReferee: false,
    supervisorWillingToSign: false,
    mentorAvailable: false,
    outcomeStrength: { c6: 'none', d8: 'none', d9: 'none', e11: 'none' },
    academicRecordAvailable: false,
    qualificationCertificatesAvailable: false,
    idDocumentAvailable: false,
    vaMembershipProof: false,
    declarationSigned: false,
    ...overrides,
  };
}

function levelEPhase(startDate: string, endDate: string | null): CareerPhase {
  return { startDate, endDate, level: 'E' };
}

describe('score', () => {
  it('returns S0 for the individual assessment education route', () => {
    const result = score(makeAnswers({ educationRoute: 'individual_assessment' }), RulesV1, EVALUATED_AT);
    expect(result.state).toBe('S0');
    expect(result.eligible).toBe(false);
    expect(result.monthsToEligible).toBeNull();
  });

  it('returns S0 for an unresolved (unknown) evaluation status', () => {
    const result = score(makeAnswers({ educationRoute: 'unknown' }), RulesV1, EVALUATED_AT);
    expect(result.state).toBe('S0');
    expect(result.eligible).toBe(false);
    expect(result.monthsToEligible).toBeNull();
  });

  it('S1 — 18 months post-qualification, nothing documented', () => {
    const result = score(
      makeAnswers({
        qualificationDate: '2024-07-15',
        careerPhases: [{ startDate: '2024-07-15', endDate: null, level: 'A' }],
      }),
      RulesV1,
      EVALUATED_AT,
    );
    expect(result.eligible).toBe(false);
    expect(result.state).toBe('S1');
  });

  it('S2 — 24 months post-qualification, TERs drafted and signed as they went', () => {
    const result = score(
      makeAnswers({
        qualificationDate: '2024-01-15',
        careerPhases: [
          { startDate: '2024-01-15', endDate: '2025-07-15', level: 'C' },
          levelEPhase('2025-07-15', null),
        ],
        tesCompiled: true,
        terCoverage: 'all',
        tersSignedBySupervisor: true,
        erStatus: 'not_started',
        ipdRecordMaintained: true,
        refereesIdentifiedCount: 2,
        supervisorWillingToSign: true,
        mentorAvailable: true,
        outcomeStrength: { c6: 'moderate', d8: 'moderate', d9: 'moderate', e11: 'moderate' },
        academicRecordAvailable: true,
        qualificationCertificatesAvailable: true,
        idDocumentAvailable: true,
        declarationSigned: true,
      }),
      RulesV1,
      EVALUATED_AT,
    );
    expect(result.eligible).toBe(false);
    expect(result.state).toBe('S2');
  });

  it('S3 — 5 years, 2 years at Level E, no ER, no referees identified', () => {
    const result = score(
      makeAnswers({
        qualificationDate: '2021-01-15',
        careerPhases: [
          levelEPhase('2021-01-15', '2023-01-15'),
          { startDate: '2023-01-15', endDate: null, level: 'D' },
        ],
        tesCompiled: true,
        terCoverage: 'most',
        tersSignedBySupervisor: true,
        erStatus: 'not_started',
        ipdRecordMaintained: true,
        refereesIdentifiedCount: 0,
        supervisorWillingToSign: true,
        mentorAvailable: true,
        outcomeStrength: { c6: 'moderate', d8: 'moderate', d9: 'moderate', e11: 'moderate' },
        academicRecordAvailable: true,
        qualificationCertificatesAvailable: true,
        idDocumentAvailable: true,
        vaMembershipProof: true,
        declarationSigned: true,
      }),
      RulesV1,
      EVALUATED_AT,
    );
    expect(result.eligible).toBe(true);
    expect(result.state).toBe('S3');
  });

  it('S4 — everything present, referee is a registered Pr Eng, strong on C6/D8/D9', () => {
    const result = score(
      makeAnswers({
        qualificationDate: '2021-01-15',
        careerPhases: [levelEPhase('2021-01-15', null)],
        tesCompiled: true,
        terCoverage: 'all',
        tersSignedBySupervisor: true,
        erStatus: 'complete',
        ipdRecordMaintained: true,
        refereesIdentifiedCount: 2,
        hasRegisteredPrEngReferee: true,
        supervisorWillingToSign: true,
        mentorAvailable: true,
        outcomeStrength: { c6: 'strong', d8: 'strong', d9: 'strong', e11: 'strong' },
        academicRecordAvailable: true,
        qualificationCertificatesAvailable: true,
        idDocumentAvailable: true,
        vaMembershipProof: true,
        declarationSigned: true,
      }),
      RulesV1,
      EVALUATED_AT,
    );
    expect(result.eligible).toBe(true);
    expect(result.state).toBe('S4');
  });

  it('demotes S4 to S3 when everything is present but no referee is a registered Pr Eng', () => {
    const result = score(
      makeAnswers({
        qualificationDate: '2021-01-15',
        careerPhases: [levelEPhase('2021-01-15', null)],
        tesCompiled: true,
        terCoverage: 'all',
        tersSignedBySupervisor: true,
        erStatus: 'complete',
        ipdRecordMaintained: true,
        refereesIdentifiedCount: 2,
        hasRegisteredPrEngReferee: false,
        supervisorWillingToSign: true,
        mentorAvailable: true,
        outcomeStrength: { c6: 'strong', d8: 'strong', d9: 'strong', e11: 'strong' },
        academicRecordAvailable: true,
        qualificationCertificatesAvailable: true,
        idDocumentAvailable: true,
        vaMembershipProof: true,
        declarationSigned: true,
      }),
      RulesV1,
      EVALUATED_AT,
    );
    expect(result.eligible).toBe(true);
    expect(result.state).toBe('S3');
  });

  it('boundary: exactly 36 months since qualification and exactly 12 months at Level E both pass', () => {
    const result = score(
      makeAnswers({
        qualificationDate: '2023-01-15',
        careerPhases: [levelEPhase('2025-01-15', null)],
      }),
      RulesV1,
      EVALUATED_AT,
    );
    expect(result.failedGates).toHaveLength(0);
    expect(result.eligible).toBe(true);
  });

  it('boundary: 35 months since qualification with 12 months at Level E fails on duration only', () => {
    const result = score(
      makeAnswers({
        qualificationDate: '2023-02-15',
        careerPhases: [levelEPhase('2025-01-15', null)],
      }),
      RulesV1,
      EVALUATED_AT,
    );
    expect(result.eligible).toBe(false);
    expect(result.failedGates.map((gate) => gate.id)).toEqual(['duration_since_qualification']);
  });

  it('monthsToEligible returns the larger of the two remaining gaps', () => {
    const result = score(
      makeAnswers({
        qualificationDate: '2023-07-15', // 30 months elapsed -> gap of 6
        careerPhases: [levelEPhase('2025-05-15', null)], // 8 months at E -> gap of 4
      }),
      RulesV1,
      EVALUATED_AT,
    );
    expect(result.monthsToEligible).toBe(6);
  });

  it('fires the TEO relaxation note at 10+ years since qualification with 3+ years at Level E', () => {
    const result = score(
      makeAnswers({
        qualificationDate: '2016-01-15', // 120 months
        careerPhases: [levelEPhase('2023-01-15', null)], // 36 months at E
      }),
      RulesV1,
      EVALUATED_AT,
    );
    expect(result.notes.some((note) => note.code === 'teo_relaxation_available')).toBe(true);
  });
});
