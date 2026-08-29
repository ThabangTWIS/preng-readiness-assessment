import { ACCREDITED_INSTITUTIONS, RESPONSIBILITY_LEVELS, THIN_EVIDENCE_OUTCOMES } from './rules/v1';

/**
 * Question definitions as data — see build-brief.md Phase 2 and
 * ecsa-rules-v1.md §6 (the four evidence dimensions each question feeds).
 * Wording changes belong only in this file; no component should need to
 * change when copy is rewritten.
 *
 * `key` addresses the field on the assessment's answer object (see
 * lib/scoring.ts `Answers` for the scored fields; segmentation-only keys
 * are not part of `Answers` and are not passed to `score()`).
 *
 * Deviations from the illustrative build-brief.md working set, made to stay
 * faithful to the four dimensions required by ecsa-rules-v1.md §6:
 * - Q13 bundles "mentor available" with "supervisor willing to sign" (both
 *   are Support structure inputs per §6; the brief's list only named the
 *   mentor).
 * - Q18 (administrative checklist) was added — the brief's list had no
 *   question for the Administrative dimension's five inputs at all, which
 *   would otherwise always score 0 and cap every verdict at the lowest
 *   evidence band.
 *
 * Note on "period" vs "phase": the user-facing copy below says "period"
 * throughout (per user feedback). The underlying type/field names
 * (`CareerPhase`, `careerPhases`, question type `'phase_list'`) still say
 * "phase" — renaming those touches lib/scoring.ts and its tests for no
 * user-visible benefit, so only the copy changed.
 */

export type QuestionSection =
  | 'eligibility'
  | 'experience'
  | 'evidence'
  | 'support'
  | 'outcomes'
  | 'segmentation';

export interface SelectOption {
  value: string;
  label: string;
  helpText?: string;
  /** When this option is selected, reveal a free-text field writing to `key`. */
  revealTextField?: { key: string; placeholder?: string };
}

export interface QuestionExample {
  label: string;
  text: string;
}

interface QuestionBase {
  id: string;
  section: QuestionSection;
  label: string;
  helpText?: string;
  /** Rendered as a bulleted list; use instead of, or alongside, helpText. */
  helpBullets?: string[];
  /** Short worked examples shown above the answer options. */
  examples?: QuestionExample[];
  /** A "full guide" pointer that isn't a real link yet — rendered disabled/greyed. */
  learnMoreText?: string;
}

export interface SingleSelectQuestion extends QuestionBase {
  type: 'single_select';
  key: string;
  options: SelectOption[];
}

export interface BooleanQuestion extends QuestionBase {
  type: 'boolean';
  key: string;
}

export interface MonthQuestion extends QuestionBase {
  type: 'month';
  key: string;
}

export interface TextQuestion extends QuestionBase {
  type: 'text';
  key: string;
}

export interface PhaseListQuestion extends QuestionBase {
  type: 'phase_list';
  key: string;
  levelOptions: SelectOption[];
}

export interface ChecklistQuestion extends QuestionBase {
  type: 'checklist';
  items: { key: string; label: string }[];
}

export type GroupFieldType = 'text' | 'month' | 'single_select';

export interface GroupField {
  key: string;
  type: GroupFieldType;
  label: string;
  options?: SelectOption[];
}

export interface GroupQuestion extends QuestionBase {
  type: 'group';
  fields: GroupField[];
}

export type Question =
  | SingleSelectQuestion
  | BooleanQuestion
  | MonthQuestion
  | TextQuestion
  | PhaseListQuestion
  | ChecklistQuestion
  | GroupQuestion;

const YES_NO_NOT_SURE: SelectOption[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'not_sure', label: "I'm not sure" },
];

const GRADE_OPTIONS: SelectOption[] = [
  { value: 'none', label: 'Not covered at all' },
  { value: 'weak', label: 'Mentioned, but not demonstrated in detail' },
  { value: 'moderate', label: 'Demonstrated with some supporting detail' },
  { value: 'strong', label: 'Clearly demonstrated with specific examples' },
];

const OUTCOME_LABELS: Record<(typeof THIN_EVIDENCE_OUTCOMES)[number], { label: string; help: string }> = {
  C6: {
    label: 'Recognising and addressing foreseeable impacts (Outcome C6)',
    help: 'ECSA notes this outcome may not be covered by your Training and Experience Reports. It usually has to come through in the Engineering Report or interview instead.',
  },
  D8: {
    label: 'Conducting engineering activities ethically (Outcome D8)',
    help: 'ECSA notes this outcome may not be covered by your Training and Experience Reports.',
  },
  D9: {
    label: 'Exercising sound judgement on complex activities (Outcome D9)',
    help: 'ECSA notes this outcome may not be covered by your Training and Experience Reports.',
  },
  E11: {
    label: 'Undertaking professional development activities (Outcome E11)',
    help: 'Not covered by TERs at all. Carried by your IPD record, Engineering Report and Referee Reports.',
  },
};

const OUTCOME_LEARN_MORE = 'Full guide with examples: (coming soon)';

export const QUESTIONS: Question[] = [
  // Eligibility
  {
    id: 'q1_qualification_held',
    section: 'eligibility',
    key: 'educationRouteSelfReport',
    type: 'single_select',
    label: 'Which best describes the engineering qualification you hold?',
    options: [
      {
        value: 'accredited',
        label: 'An ECSA-accredited South African qualification',
        helpText: 'E.g. an accredited BEng/BSc(Eng), or an accredited BTech built on an accredited National Diploma.',
      },
      {
        value: 'washington_accord',
        label: 'A qualification from a Washington Accord signatory country',
      },
      {
        value: 'substantially_equivalent',
        label: 'A different qualification, which ECSA has evaluated as substantially equivalent',
      },
      {
        value: 'unknown',
        label: 'Other / not sure',
        revealTextField: {
          key: 'otherQualificationName',
          placeholder: 'e.g. BSc Mechanical Engineering, University of X',
        },
      },
    ],
  },
  {
    id: 'q2_institution',
    section: 'eligibility',
    key: 'institutionSelection',
    type: 'single_select',
    label: 'Which institution did you qualify from?',
    helpText:
      "This list (from ECSA's E-20-PE) is just to help us tailor guidance. Picking one doesn't itself confirm accreditation of your specific programme and year.",
    options: [
      ...ACCREDITED_INSTITUTIONS.map((institution) => ({
        value: institution.value,
        label: institution.label,
        helpText: 'helpText' in institution ? institution.helpText : undefined,
      })),
      {
        value: 'other',
        label: 'Other / not listed',
        revealTextField: { key: 'institutionNameOther', placeholder: 'Institution name' },
      },
    ],
  },
  {
    id: 'q2b_qualification_date',
    section: 'eligibility',
    key: 'qualificationDate',
    type: 'month',
    label: 'Month and year you graduated (your qualification was formally conferred)',
    helpText:
      'ECSA counts your training and experience period from the date you met the educational requirement, not from when you started working.',
  },
  {
    id: 'q3_accredited_list_check',
    section: 'eligibility',
    key: 'onAccreditedList',
    type: 'single_select',
    label: "Have you checked that your qualification appears on ECSA's accredited list?",
    helpText: 'TODO: link to the current ECSA accredited qualifications list before launch.',
    options: YES_NO_NOT_SURE,
  },

  // Experience and responsibility
  {
    id: 'q4_career_periods',
    section: 'experience',
    key: 'careerPhases',
    type: 'phase_list',
    label: 'Break your career into periods and place each one on the responsibility ladder',
    helpBullets: [
      'Your work environment changed',
      'The type of work you did changed',
      'Your level of responsibility changed, including a promotion',
      'You changed employer, or your training/employment was interrupted',
    ],
    learnMoreText: 'Full guide to responsibility levels, with examples: (coming soon)',
    levelOptions: RESPONSIBILITY_LEVELS.map((level) => ({
      value: level.code,
      label: `${level.code}: ${level.label}`,
    })),
  },
  {
    id: 'q5_current_role_outcome10',
    section: 'experience',
    key: 'selfConfirmsComplexResponsibility',
    type: 'single_select',
    label:
      'In your current role, are you responsible for the outcomes of significant parts of one or more complex engineering activities?',
    helpText: 'This is ECSA\'s definition of "performing" at Level E, the level required for registration.',
    examples: [
      {
        label: 'Consultancy',
        text: 'You sign off a design package for a client project, with only spot-checks from a senior engineer.',
      },
      {
        label: 'Contractor',
        text: 'You take responsibility for method statements and sign-off on a site works package.',
      },
    ],
    options: YES_NO_NOT_SURE,
  },

  // Evidence
  {
    id: 'q6_tes_compiled',
    section: 'evidence',
    key: 'tesCompiled',
    type: 'boolean',
    label: 'Have you compiled a Training and Experience Summary (TES) covering every period?',
  },
  {
    id: 'q7_ter_coverage',
    section: 'evidence',
    key: 'terCoverage',
    type: 'single_select',
    label: 'How many of your periods have a written Training and Experience Report (TER)?',
    options: [
      { value: 'none', label: 'None yet' },
      { value: 'some', label: 'Some of them' },
      { value: 'most', label: 'Most of them' },
      { value: 'all', label: 'All of them' },
    ],
  },
  {
    id: 'q8_ters_signed',
    section: 'evidence',
    key: 'tersSignedBySupervisor',
    type: 'boolean',
    label: 'Have the TERs you\'ve already written been signed by the supervisor you had at the time?',
  },
  {
    id: 'q9_er_status',
    section: 'evidence',
    key: 'erStatus',
    type: 'single_select',
    label: 'How far along is your Engineering Report (ER)?',
    options: [
      { value: 'not_started', label: 'Not started' },
      { value: 'outline', label: 'Outline only' },
      { value: 'draft', label: 'Draft written' },
      { value: 'complete', label: 'Complete' },
    ],
  },
  {
    id: 'q10_ipd_maintained',
    section: 'evidence',
    key: 'ipdRecordMaintained',
    type: 'boolean',
    label: 'Have you kept an ongoing IPD (pre-registration CPD) record?',
  },

  // Support structure
  {
    id: 'q11_referees_named',
    section: 'support',
    key: 'refereesIdentifiedCount',
    type: 'single_select',
    label: 'How many referees, with personal knowledge of your work, can you name?',
    options: [
      { value: '0', label: 'None yet' },
      { value: '1', label: 'One' },
      { value: '2', label: 'Two' },
      { value: '3', label: 'Three or more' },
    ],
  },
  {
    id: 'q12_referee_registered',
    section: 'support',
    key: 'hasRegisteredPrEngReferee',
    type: 'single_select',
    label:
      'Is at least one of the referees you just named registered with ECSA as a Professional Engineer or Professional Certificated Engineer?',
    helpText: 'This is a common, invisible blocker. Worth confirming directly rather than assuming.',
    options: YES_NO_NOT_SURE,
  },
  {
    id: 'q13_mentor_and_supervisor',
    section: 'support',
    type: 'checklist',
    label: 'Which of these do you currently have in place?',
    items: [
      { key: 'mentorAvailable', label: 'A registered mentor available to verify my application before submission' },
      {
        key: 'supervisorWillingToSign',
        label: 'My current supervisor is willing to sign the Appendix J checklist and any TERs that still need it',
      },
    ],
  },

  // Outcome coverage
  ...(['C6', 'D8', 'D9', 'E11'] as const).map(
    (outcome, index): SingleSelectQuestion => ({
      id: `q${14 + index}_outcome_${outcome.toLowerCase()}`,
      section: 'outcomes',
      key: `outcomeStrength.${outcome.toLowerCase()}`,
      type: 'single_select',
      label: OUTCOME_LABELS[outcome].label,
      helpText: OUTCOME_LABELS[outcome].help,
      learnMoreText: OUTCOME_LEARN_MORE,
      options: GRADE_OPTIONS,
    }),
  ),

  // Administrative
  {
    id: 'q18_administrative_checklist',
    section: 'evidence',
    type: 'checklist',
    label: 'Which of these documents do you already have ready?',
    items: [
      { key: 'academicRecordAvailable', label: 'Academic record / transcript' },
      { key: 'qualificationCertificatesAvailable', label: 'Qualification certificate(s)' },
      { key: 'idDocumentAvailable', label: 'Proof of identity (SA ID or foreign passport)' },
      { key: 'vaMembershipProof', label: 'Proof of Voluntary Association membership' },
      { key: 'declarationSigned', label: 'Declaration signed by a Commissioner of Oaths' },
    ],
  },

  // Segmentation only — does not feed score(); used for lead segmentation.
  {
    id: 'q19_discipline_and_employer',
    section: 'segmentation',
    label: 'A little about your work, so we can tailor guidance',
    type: 'group',
    fields: [
      {
        key: 'discipline',
        type: 'single_select',
        label: 'Engineering discipline',
        options: [
          { value: 'civil', label: 'Civil' },
          { value: 'mechanical', label: 'Mechanical' },
          { value: 'electrical', label: 'Electrical' },
          { value: 'electronic', label: 'Electronic' },
          { value: 'chemical', label: 'Chemical' },
          { value: 'industrial', label: 'Industrial' },
          { value: 'mining', label: 'Mining' },
          { value: 'other', label: 'Other' },
        ],
      },
      {
        key: 'employerType',
        type: 'single_select',
        label: 'Employer type',
        options: [
          { value: 'consultancy', label: 'Consultancy' },
          { value: 'contractor', label: 'Contractor' },
          { value: 'government', label: 'Government' },
          { value: 'parastatal', label: 'Parastatal' },
          { value: 'mining', label: 'Mining' },
          { value: 'other', label: 'Other' },
        ],
      },
    ],
  },
];
