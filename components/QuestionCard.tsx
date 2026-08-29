'use client';

import type { ReactNode } from 'react';
import type { CareerPhase } from '@/lib/scoring';
import type { Question, SelectOption } from '@/lib/questions';

interface QuestionCardProps {
  question: Question;
  form: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  /**
   * Called (with the same key/value just passed to onChange) after a
   * single_select/boolean answer that doesn't reveal a text field, so the
   * caller can auto-advance. Takes key/value rather than relying on the
   * caller's own state, since that state won't reflect this change yet
   * (React batches the onChange update).
   */
  onAutoAdvance?: (key: string, value: unknown) => void;
}

const INPUT_CLASS =
  'rounded-lg border border-zinc-300 px-4 py-3 text-sm text-foreground focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/40';

const LEVEL_ORDER: CareerPhase['levels'] = ['A', 'B', 'C', 'D', 'E'];

function currentMonthValue(): string {
  return new Date().toISOString().slice(0, 7);
}

function isoToMonthInput(iso: unknown): string {
  return typeof iso === 'string' ? iso.slice(0, 7) : '';
}

function monthInputToIso(month: string): string {
  return month ? `${month}-01` : '';
}

function emptyPhase(previous: CareerPhase | undefined): CareerPhase {
  return { startDate: previous?.endDate ?? '', endDate: null, levels: [] };
}

/** Toggles `clicked` in/out of `current`, keeping the result contiguous on the A-E ladder. */
function toggleLevel(
  current: CareerPhase['levels'],
  clicked: CareerPhase['levels'][number],
): CareerPhase['levels'] {
  if (current.length === 0) return [clicked];

  const indices = current.map((level) => LEVEL_ORDER.indexOf(level));
  const min = Math.min(...indices);
  const max = Math.max(...indices);
  const clickedIndex = LEVEL_ORDER.indexOf(clicked);

  if (current.includes(clicked)) {
    if (clickedIndex === min || clickedIndex === max) {
      return current.filter((level) => level !== clicked);
    }
    return current;
  }

  if (clickedIndex === min - 1 || clickedIndex === max + 1) {
    const newMin = Math.min(min, clickedIndex);
    const newMax = Math.max(max, clickedIndex);
    return LEVEL_ORDER.slice(newMin, newMax + 1);
  }

  return [clicked];
}

export function isQuestionAnswered(question: Question, form: Record<string, unknown>): boolean {
  switch (question.type) {
    case 'single_select': {
      const value = form[question.key];
      if (value === undefined || value === '') return false;
      const selected = question.options.find((option) => option.value === value);
      if (selected?.revealSelect) {
        const nestedValue = form[selected.revealSelect.key];
        return nestedValue !== undefined && nestedValue !== '';
      }
      return true;
    }
    case 'boolean':
      return form[question.key] !== undefined;
    case 'month':
      return typeof form[question.key] === 'string' && form[question.key] !== '';
    case 'text':
    case 'checklist':
      return true;
    case 'group':
      return question.fields.every(
        (field) => field.type === 'text' || (form[field.key] !== undefined && form[field.key] !== ''),
      );
    case 'phase_list': {
      const phases = (form[question.key] as CareerPhase[] | undefined) ?? [];
      return phases.length > 0 && phases.every((phase) => phase.startDate !== '' && phase.levels.length > 0);
    }
    default:
      return true;
  }
}

function QuestionExtras({ question }: { question: Question }) {
  return (
    <>
      {question.notice && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
          <p className="text-sm text-amber-900">{question.notice}</p>
        </div>
      )}
      {question.helpText && <p className="text-sm text-navy/70">{question.helpText}</p>}
      {question.helpBullets && (
        <ul className="list-disc space-y-1 pl-5 text-sm text-navy/70">
          {question.helpBullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      )}
      {question.examples && (
        <div className="flex flex-col gap-2 rounded-lg bg-navy-tint p-3">
          {question.examples.map((example) => (
            <p key={example.label} className="text-xs text-navy/80">
              <span className="font-medium">{example.label}:</span> {example.text}
            </p>
          ))}
        </div>
      )}
      {question.learnMoreText && <p className="text-xs text-navy/40">{question.learnMoreText}</p>}
    </>
  );
}

export function QuestionCard({ question, form, onChange, onAutoAdvance }: QuestionCardProps) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-heading text-lg font-bold text-navy">{question.label}</h2>
      <QuestionExtras question={question} />

      {question.type === 'single_select' && (
        <SingleSelectGroup
          optionsKey={question.key}
          options={question.options}
          form={form}
          onChange={onChange}
          onAutoAdvance={onAutoAdvance}
        />
      )}

      {question.type === 'boolean' && (
        <div className="flex gap-2">
          {[
            { value: true, label: 'Yes' },
            { value: false, label: 'No' },
          ].map((option) => (
            <button
              key={String(option.value)}
              type="button"
              onClick={() => {
                onChange(question.key, option.value);
                onAutoAdvance?.(question.key, option.value);
              }}
              className={`flex-1 rounded-lg border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue/40 ${
                form[question.key] === option.value
                  ? 'border-navy bg-navy text-white'
                  : 'border-zinc-300 bg-white text-foreground hover:border-blue'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {question.type === 'month' && (
        <input
          type="month"
          value={isoToMonthInput(form[question.key])}
          max={currentMonthValue()}
          onChange={(event) => onChange(question.key, monthInputToIso(event.target.value))}
          className={INPUT_CLASS}
        />
      )}

      {question.type === 'text' && (
        <input
          type="text"
          value={(form[question.key] as string) ?? ''}
          onChange={(event) => onChange(question.key, event.target.value)}
          className={INPUT_CLASS}
        />
      )}

      {question.type === 'checklist' && (
        <div className="flex flex-col gap-2">
          {question.items.map((item) => (
            <label
              key={item.key}
              className="flex min-h-16 items-start gap-3 rounded-lg border border-zinc-300 px-4 py-3 text-sm leading-snug text-foreground"
            >
              <input
                type="checkbox"
                checked={Boolean(form[item.key])}
                onChange={(event) => onChange(item.key, event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-navy"
              />
              {item.label}
            </label>
          ))}
        </div>
      )}

      {question.type === 'group' && (
        <div className="flex flex-col gap-3">
          {question.fields.map((field) => (
            <div key={field.key} className="flex flex-col gap-1">
              <label className="text-xs font-medium text-navy/70">{field.label}</label>
              {field.type === 'text' && (
                <input
                  type="text"
                  value={(form[field.key] as string) ?? ''}
                  onChange={(event) => onChange(field.key, event.target.value)}
                  className={INPUT_CLASS}
                />
              )}
              {field.type === 'month' && (
                <input
                  type="month"
                  value={isoToMonthInput(form[field.key])}
                  max={currentMonthValue()}
                  onChange={(event) => onChange(field.key, monthInputToIso(event.target.value))}
                  className={INPUT_CLASS}
                />
              )}
              {field.type === 'single_select' && (
                <select
                  value={(form[field.key] as string) ?? ''}
                  onChange={(event) => onChange(field.key, event.target.value)}
                  className={INPUT_CLASS}
                >
                  <option value="" disabled>
                    Select…
                  </option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>
      )}

      {question.type === 'phase_list' && (
        <PhaseListInput
          value={(form[question.key] as CareerPhase[] | undefined) ?? []}
          levelOptions={question.levelOptions}
          onChange={(phases) => onChange(question.key, phases)}
        />
      )}
    </div>
  );
}

function SingleSelectGroup({
  optionsKey,
  options,
  form,
  onChange,
  onAutoAdvance,
}: {
  optionsKey: string;
  options: SelectOption[];
  form: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  onAutoAdvance?: (key: string, value: unknown) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((option) => (
        <SingleSelectOption
          key={option.value}
          option={option}
          selected={form[optionsKey] === option.value}
          revealValue={option.revealTextField ? (form[option.revealTextField.key] as string) : undefined}
          onSelect={() => {
            onChange(optionsKey, option.value);
            if (!option.revealTextField && !option.revealSelect) onAutoAdvance?.(optionsKey, option.value);
          }}
          onRevealChange={
            option.revealTextField ? (value) => onChange(option.revealTextField!.key, value) : undefined
          }
          revealPlaceholder={option.revealTextField?.placeholder}
        >
          {option.revealSelect && (
            <div className="mt-2 pl-3">
              <SingleSelectGroup
                optionsKey={option.revealSelect.key}
                options={option.revealSelect.options}
                form={form}
                onChange={onChange}
                onAutoAdvance={onAutoAdvance}
              />
            </div>
          )}
        </SingleSelectOption>
      ))}
    </div>
  );
}

function SingleSelectOption({
  option,
  selected,
  revealValue,
  onSelect,
  onRevealChange,
  revealPlaceholder,
  children,
}: {
  option: SelectOption;
  selected: boolean;
  revealValue: string | undefined;
  onSelect: () => void;
  onRevealChange: ((value: string) => void) | undefined;
  revealPlaceholder: string | undefined;
  children?: ReactNode;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onSelect}
        className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue/40 ${
          selected ? 'border-navy bg-navy text-white' : 'border-zinc-300 bg-white text-foreground hover:border-blue'
        }`}
      >
        <div>{option.label}</div>
        {option.helpText && (
          <div className={`mt-1 text-xs ${selected ? 'text-white/70' : 'text-navy/60'}`}>{option.helpText}</div>
        )}
      </button>
      {selected && onRevealChange && (
        <input
          type="text"
          value={revealValue ?? ''}
          onChange={(event) => onRevealChange(event.target.value)}
          placeholder={revealPlaceholder}
          className={`${INPUT_CLASS} mt-2 w-full`}
        />
      )}
      {selected && children}
    </div>
  );
}

function PhaseListInput({
  value,
  levelOptions,
  onChange,
}: {
  value: CareerPhase[];
  levelOptions: SelectOption[];
  onChange: (phases: CareerPhase[]) => void;
}) {
  function updatePhase(index: number, patch: Partial<CareerPhase>) {
    onChange(value.map((phase, i) => (i === index ? { ...phase, ...patch } : phase)));
  }

  function removePhase(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-4">
      {value.map((phase, index) => (
        <div key={index} className="flex flex-col gap-2 rounded-lg border border-zinc-300 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-navy/70">Period {index + 1}</span>
            <button
              type="button"
              onClick={() => removePhase(index)}
              className="text-xs text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>
          <div className="flex gap-2">
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-xs text-navy/70">Start</label>
              <input
                type="month"
                value={isoToMonthInput(phase.startDate)}
                max={currentMonthValue()}
                onChange={(event) => updatePhase(index, { startDate: monthInputToIso(event.target.value) })}
                className={INPUT_CLASS}
              />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-xs text-navy/70">End (blank = ongoing)</label>
              <input
                type="month"
                value={isoToMonthInput(phase.endDate)}
                max={currentMonthValue()}
                onChange={(event) =>
                  updatePhase(index, { endDate: event.target.value ? monthInputToIso(event.target.value) : null })
                }
                className={INPUT_CLASS}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-navy/70">
              Responsibility level(s): select one or more next to each other
            </label>
            <div className="flex flex-col gap-1">
              {levelOptions.map((option) => {
                const code = option.value as CareerPhase['levels'][number];
                const selected = phase.levels.includes(code);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updatePhase(index, { levels: toggleLevel(phase.levels, code) })}
                    className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue/40 ${
                      selected
                        ? 'border-navy bg-navy text-white'
                        : 'border-zinc-300 bg-white text-foreground hover:border-blue'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, emptyPhase(value[value.length - 1])])}
        className="rounded-lg border border-dashed border-navy/40 px-4 py-3 text-sm text-navy/70 hover:border-navy focus:outline-none focus:ring-2 focus:ring-blue/40"
      >
        + Add period
      </button>
    </div>
  );
}
