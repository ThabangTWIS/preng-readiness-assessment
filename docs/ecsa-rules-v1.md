# ECSA Rules Spec — v1

**Scope:** Registration as a **Professional Engineer (Pr Eng)** only. Technologist,
Technician and Certificated Engineer are out of scope for v1.

**Rule version:** `v1`
**Derived from:**

- **R-01-POL-PC** — Policy on Registration in Candidate and Professional
  Categories, Revision 5, effective 12/02/2025, next review 12/02/2029.
- **R-03-PRO-PC** — Processing of Applications for Registration of Candidates and
  Professionals, Revision 4, effective 12/02/2025, next review 12/02/2029.

> **Verification duty.** Every rule below carries its clause reference. Before
> shipping, check each one against the source PDF. If ECSA revises either
> document, create `v2` of this spec and `lib/rules/v2.ts`. Never edit v1 in
> place — stored results reference it.

---

## 1. Educational requirement

R-01 §5.1.1 gives four routes to satisfying the educational requirement. They
apply identically to candidate and professional registration (R-01 §5.2).

| Route | Description | Clause |
|---|---|---|
| (a) | Holds an accredited qualification, or an acceptable combination, prescribed for the category | R-01 §5.1.1(a) |
| (b) | Holds a qualification recognised under an international academic agreement relevant to the category | R-01 §5.1.1(b) |
| (c) | Qualification determined by case-by-case evaluation to be substantially equivalent to an accredited qualification | R-01 §5.1.1(c) |
| (d) | A combination of evidence determined by Council to be equivalent, assessed individually | R-01 §5.1.1(d) |

For Pr Eng, the relevant standards are **E-02-PE**, or **E-22-PE plus either
E-09-PT or E-09-PGDip (cognate)** (R-01 Schedule 1). The relevant international
accord is the **Washington Accord** (R-01 Schedule 2). An accredited BTech (with
a prerequisite accredited National Diploma or equivalent) and an accredited
National Diploma both continue to be recognised as meeting ECSA educational
requirements (R-01 Schedule 1, note).

Routes (c) and (d) are handled under **E-17-PRO** (R-01 §5.1.3). Applicants on
route (d) may be required to undergo further assessment, including oral or
written examination.

**Product decision.** Route (d), and route (c) where the applicant does not know
their evaluation status, produce a **distinct outcome state**, not a band on the
readiness scale. See §6.

### 1.1 Special provision — 10 years' practice

An applicant on route (a), (b) or (c) who provides evidence of being
continuously in training or practice in the relevant category for at least
**10 years since graduation**, with claims verified by a summary of training and
experience, may be evaluated against the prevailing educational standards as
having completed the educational qualification (R-01 §5.2, Special provisions).

**Product decision.** Do not attempt to score this. Flag it as a note in the
report where `years_since_graduation >= 10` and the education route is uncertain.

---

## 2. Duration gates

### 2.1 Minimum training and experience

Normal minimum for Pr Eng: **4 years education + 3 years training and
experience** (R-01 Schedule 4).

The required period **starts no earlier than the date of meeting the
qualifications requirement** for applicants on routes (a), (b) or (c)
(R-01 §5.4, Period of training). It does not start at first employment.

ECSA does not normally consider an application unless this period is complete
(R-01 §5.4).

### 2.2 Degree of Responsibility

R-03 §4.1.3 defines five levels, from R-04-T&M-GUIDE-PC:

| Level | Descriptor |
|---|---|
| A | Being exposed |
| B | Assisting |
| C | Participating |
| D | Contributing |
| E | Performing |

**Level E means performing at the level required for registration.** It
corresponds to the range statement in Outcome 10 of the Competency Standard,
which requires responsibility "for the outcomes of significant parts of one or
more complex engineering activities" (R-03 §4.1.3).

TERs covering **at least one year at Level E** must be submitted
(R-03 §4.1.4(1)). Those phases need not be the most recent.

### 2.3 The premature test

R-03 §4.1.4, verbatim in substance:

> An applicant whose training and experience history is less than 3 years **and**
> who has less than one year working at the Degree of Responsibility Level E
> (Performing) will be notified that the application is premature and will be
> invited to submit further TESs as they become available and be placed in
> abeyance for a minimum period of reaching the required experience post
> benchmark qualification or 12 months.

**Ambiguity, flagged deliberately.** The clause reads as a conjunction, which
would mean an applicant failing only one of the two conditions is not caught by
this specific paragraph. However, R-01 Schedule 4 independently requires 3 years,
and R-03 §4.1.4(1) independently requires TERs covering one year at Level E.

**Product decision.** Treat the two as **separate hard gates**. Failing either
one makes the applicant not-yet-eligible. This is the conservative reading and
the one that protects the user. Do not present the conjunction reading as a
route through.

### 2.4 The 10-year relaxation on TERs

An applicant with **at least 10 years** of engineering training and experience
after completing the educational requirement, who reports **at least 3 years at
Level E** in detail in supervisor-signed TERs, may submit **Training and
Experience Outlines (TEOs)** for the remaining periods or groups of related
periods (R-03 §4.1.4(2)).

This reduces documentation burden. It does not change eligibility. Treat it as a
**report note**, not a gate.

---

## 3. Required artefacts

From R-03 Table 2 (Forms and documents), column "For registration as a
professional engineer", plus §§4.1.3–4.1.9.

| Ref | Artefact | Notes |
|---|---|---|
| — | Online application form | Submitted via ECSA applications portal |
| — | Declaration signed by applicant and **Commissioner of Oaths** | |
| — | Proof of identity | SA ID book / SA ID card / foreign passport |
| — | Qualification certificates | If not already submitted |
| AR | Academic Record / transcript | Subjects, marks if available, year obtained (R-03 §4.1.7) |
| TES | Training and Experience Summary | Every phase, with Level of Responsibility (R-03 §4.1.3) |
| TER / TEO | Training and Experience Reports | One per phase from graduation to application; **each TER signed by the supervisor**; TEOs where permitted (R-03 §4.1.4) |
| ER | Engineering Report (incorporating self-assessment) | R-03 §4.1.5 |
| RR | Referee Reports (2) | R-03 §4.1.6 and Table 2 |
| IPD | Record of IPD (pre-registration CPD) | R-03 §4.1.8 |
| — | Supervisor's checklist | Appendix J for Pr Eng (R-03 §4.1.9) |
| — | Proof of Voluntary Association (VA) membership | Certificate or letter |

Note: the **EDR (Educational Development Report)** in Table 2 applies to
technologist and technician alternative-route applicants only, and is voluntary.
Not applicable to Pr Eng. Do not ask about it.

### 3.1 TER constraints

- Written in the **first person**, proper paragraphs (R-03 Table 3).
- **Do not exceed 2,000 words in total across all TERs** (R-03 Table 3, Length
  limit). This is a total, not a per-report limit. Candidates routinely
  misread it.
- Organogram required showing supervisors, co-workers and persons supervised,
  two levels above and below where possible.
- **Mandatory fields** (marked \* in R-03 Table 3):
  - Objective of training or major work phase
  - Nature of problem(s) addressed
  - Method of analysis
  - Method used in developing solution
  - Criteria used in evaluating solution
  - The applicant's contribution to the task
  - Nature of the applicant's responsibility (in addition to levels A–E)
- A phase ends when: work environment changes, type of work changes,
  responsibilities or level of function change (promotion, change of employer),
  or training/employment is interrupted (R-03 Table 3).

### 3.2 Engineering Report constraints

R-03 §4.1.5:

- Written **specifically for the application**. Not a project report.
- **Reflective rather than purely narrative.**
- **First person, English.**
- Body including headings and sub-headings: **approximately 6,000 words**.
- Diagrams, tables and pictures: **maximum 4 A4 pages in total**.
- Explicitly a test of written communication from a structural, stylistic and
  linguistic aspect; must demonstrate logical development.
- Must cover: knowledge and understanding applied; theoretical and practical
  methods of analysis and solution; planning, organising, leading and
  controlling of resources; regulatory, ethical and societal obligations; risks
  and uncertainties; recommendations, judgement calls and leadership; nature of
  responsibility carried and persons responsible for.

Work need not be project-based. Operational problem solving and engineering
management can supply the evidence.

### 3.3 Referee requirements — the structural blocker

For **Professional Engineers**, from R-03 Table 2:

- **Two referees**, with personal knowledge of the applicant's professional
  performance and engineering experience.
- **At least one must be registered with ECSA as a Professional Engineer or
  Professional Certificated Engineer** (BSc or BEng degree in engineering).
- Foreign equivalents may be accepted under certain circumstances.
- The applicant must supply names and addresses with the referees' permission.

R-01 defines a **Referee** as a mentor registered with ECSA or a supervisor who
can attest to competence in a **concomitant Category and Discipline**.

The referee rates or comments on: problem analysis and solution synthesis at the
complex level; knowledge of engineering principles and wider context;
engineering management ability; communication; management of regulatory,
economic, social and environmental issues; ethics; judgement and acceptance of
responsibility; willingness and capacity to accept responsibility; commitment to
competency and career development (R-03 §4.1.6).

**Why this matters to the product.** A candidate whose reporting line contains no
registered Pr Eng has a problem that takes 12+ months to solve. It is invisible
until submission. This is one of the highest-value questions in the assessment.

### 3.4 Supervisor and mentor

- A candidate must work under the **supervision of a registered person**;
  supervision need not be direct but the supervisor must take responsibility from
  a fully informed position (R-01 §5.4). Both supervisor and mentor must be
  registered in an appropriate Professional Category.
- **The applicant's mentor is required to verify the completeness and quality of
  the application before ECSA will screen it** (R-01 §5.6.1). This came into
  effect for cycle 2 submissions in 2025.

---

## 4. Outcome coverage

The 11 outcomes for Pr Eng (R-03 Appendix B, "Sources of evidence against
outcomes for professional engineers"). "Complex" is the level identifier for the
Pr Eng category.

| No. | Outcome | Covered by TERs? |
|---|---|---|
| A1 | Define, investigate and analyse complex engineering problems | Factual / Verified |
| A2 | Design or develop solutions to complex engineering problems | Factual / Verified |
| A3 | Comprehend and apply advanced knowledge comprising principles and specialist, jurisdictional and local knowledge | Factual / Verified |
| B4 | Manage part or all of one or more complex engineering activities | Factual / Verified |
| B5 | Communicate clearly with others in the course of engineering activities | Tests concise writing |
| C6 | Recognise and address the reasonably foreseeable impacts of complex engineering activities | **May not be covered** |
| C7 | Meet all legal and regulatory requirements and protect health and safety of persons | Factual / Verified |
| D8 | Conduct engineering activities ethically | **May not be covered** |
| D9 | Exercise sound judgement in the course of complex engineering activities | **May not be covered** |
| D10 | Be responsible for making decisions on part or all of complex engineering activities | Factual / Verified |
| E11 | Undertake professional development activities sufficient to maintain and extend competence | Not covered by TERs; carried by IPD, ER and Referee Reports |

**Product decision — the differentiator.** ECSA states in its own procedure that
**C6, D8 and D9 may not be covered by the Training and Experience Reports**, and
E11 is not covered by them at all. These four ride on the Engineering Report,
the IPD record, the Referee Reports and the Professional Review interview.

This is where technically strong applicants get placed in abeyance. The
assessment should probe these four specifically, and the report should call them
out by name. Nobody else in this market is telling candidates this.

---

## 5. Process and timing context

Used for report content and for the follow-up date on the lead record, not for
scoring.

- Applications may only be submitted through the ECSA applications portal
  **during the two annual application windows** of the Registration Application
  Calendar (R-01 §5.6.1). **TO VERIFY: current window dates from ecsa.co.za before launch, and set a reminder to re-check annually.**
- **Stage 1 — Experience Appraisal (EA):** documentary desktop assessment by no
  fewer than **two Assessors** from the VPM pool. Covers TERs, ER, IPD records
  and Referee Reports (R-01 §5.6.2, §5.6.3). Outcome is Competence Indicated (CI)
  or Competence Not Indicated (CNI).
- **Stage 2 — Professional Review (PR):** integrative assessment via
  comprehensive review of evidence plus an **interview**, by up to three
  Reviewers, virtual or in person, recorded with consent (R-01 §5.6.3).
- **Abeyance:** where evidence is unclear against part of the standard, the
  application may be placed in abeyance. The applicant may submit additional
  evidence on a maximum of **two occasions** within the **subsequent two
  consecutive application windows**, at **no further application fee**. If the
  period lapses, the fee is forfeited, the application is closed as CNI, and an
  **Experience Appraisal Demurral (EAD)** letter is issued. A new application and
  fee are then required (R-01 Definitions; §5.6.3 Applications in Abeyance).
- **Refusal:** a compulsory advisory interview is granted, and must be attended
  before any appeal. The file is closed; a new application is required and
  evidence in the closed file is not carried over (R-01 §5.6.3 Refusal).
- **Plagiarism:** submitting someone else's work, or work previously submitted by
  another applicant, may result in **disqualification for a minimum of 3 years**
  (R-01 §6).
- **Candidate registration** is recommended but not obligatory before applying
  professionally. It becomes required at implementation of the Identification of
  Engineering Work Regulations (R-01 §5.1).

---

## 6. Verdict model

Two independent axes. Do not collapse them into a single score.

**Axis 1 — Eligibility (hard gates).** All must pass:

1. Educational requirement met via route (a), (b) or (c).
2. `months_since_qualification >= 36`.
3. `months_at_level_E >= 12`.

**Axis 2 — Evidence readiness (graded).** Weighted dimensions:

| Dimension | Inputs |
|---|---|
| Documentation | TES exists; TERs drafted per phase; TERs supervisor-signed; ER drafted; IPD record maintained |
| Support structure | 2 referees identified; at least one is a registered Pr Eng / Pr Cert Eng; supervisor willing to sign; mentor available to verify |
| Outcome coverage | Self-rated evidence strength on C6, D8, D9, E11 |
| Administrative | Academic record, qualification certificates, ID, VA membership, commissioner-signed declaration |

### 6.1 States

| State | Eligibility | Evidence | Commercial action |
|---|---|---|---|
| **S0 — Education route unresolved** | Route (d), or route (c) not yet evaluated | n/a | Explain E-17-PRO individual assessment. Separate content path. Do **not** show a months-to-eligible figure. |
| **S1 — Not eligible, evidence thin** | Fail | Low | Nurture. Ebook. Long-horizon sequence with computed follow-up date. |
| **S2 — Not eligible, evidence building** | Fail | Medium/High | Urgency framing: cannot submit yet, which is exactly why to compile now. Supervisor signatures and phase detail decay. Sell the compilation product. |
| **S3 — Eligible, evidence thin** | Pass | Low/Medium | **Core client.** Highest intent. Direct to Engineering Companion, anchored to the next application window. |
| **S4 — Eligible, evidence complete** | Pass | High | Probe C6/D8/D9/E11 and referee eligibility. If the probe fails, they are really S3 and are the most motivated buyer in the funnel. If it passes: congratulate, request testimonial, ask for colleague referrals. |

### 6.2 Months to eligible

```
months_to_eligible = max(
  36 - months_since_qualification,
  12 - months_at_level_E,
  0
)
```

Present as a date, and map it to the next application window that falls after it.
Store on the lead record as the follow-up date.

---

## 7. Open items to verify before launch

- [ ] Current ECSA application window dates for the coming cycle.
- [ ] Current application fee (for the "cost of a premature application" copy).
- [ ] Whether R-01 or R-03 has been revised past Rev 5 / Rev 4 respectively.
- [ ] Wording of the non-affiliation disclaimer, reviewed for anything ECSA could
      reasonably object to.
- [ ] Confirm the C6/D8/D9 "may not be covered" reading against Appendix B in the
      PDF directly, since it is the basis of the product's main insight.
