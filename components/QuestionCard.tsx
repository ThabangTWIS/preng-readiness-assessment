'use client';

import type { CareerPhase } from '@/lib/scoring';
import type { Question } from '@/lib/questions';

interface QuestionCardProps {
  question: Question;
  form: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
}

const INPUT_CLASS =
  'rounded-lg border border-zinc-300 px-4 py-3 text-sm text-foreground focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/40';

function isoToMonthInput(iso: unknown): string {
  return typeof iso === 'string' ? iso.slice(0, 7) : '';
}

function monthInputToIso(month: string): string {
  return month ? `${month}-01` : '';
}

function emptyPhase(): CareerPhase {
  return { startDate: '', endDate: null, level: 'A' };
}

export function isQuestionAnswered(question: Question, form: Record<string, unknown>): boolean {
  switch (question.type) {
    case 'single_select':
      return form[question.key] !== undefined && form[question.key] !== '';
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
      return phases.length > 0 && phases.every((phase) => phase.startDate !== '');
    }
    default:
      return true;
  }
}

export function QuestionCard({ question, form, onChange }: QuestionCardProps) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-heading text-lg font-bold text-navy">{question.label}</h2>
      {question.helpText && <p className="text-sm text-navy/70">{question.helpText}</p>}

      {question.type === 'single_select' && (
        <div className="flex flex-col gap-2">
          {question.options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(question.key, option.value)}
              className={`rounded-lg border px-4 py-3 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue/40 ${
                form[question.key] === option.value
                  ? 'border-navy bg-navy text-white'
                  : 'border-zinc-300 bg-white text-foreground hover:border-blue'
              }`}
            >
              <div>{option.label}</div>
              {option.helpText && (
                <div
                  className={`mt-1 text-xs ${
                    form[question.key] === option.value ? 'text-white/70' : 'text-navy/60'
                  }`}
                >
                  {option.helpText}
                </div>
              )}
            </button>
          ))}
        </div>
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
              onClick={() => onChange(question.key, option.value)}
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
              className="flex items-center gap-3 rounded-lg border border-zinc-300 px-4 py-3 text-sm text-foreground"
            >
              <input
                type="checkbox"
                checked={Boolean(form[item.key])}
                onChange={(event) => onChange(item.key, event.target.checked)}
                className="h-4 w-4 accent-navy"
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

function PhaseListInput({
  value,
  levelOptions,
  onChange,
}: {
  value: CareerPhase[];
  levelOptions: { value: string; label: string }[];
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
            <span className="text-xs font-medium text-navy/70">Phase {index + 1}</span>
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
                onChange={(event) => updatePhase(index, { startDate: monthInputToIso(event.target.value) })}
                className={INPUT_CLASS}
              />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-xs text-navy/70">End (blank = ongoing)</label>
              <input
                type="month"
                value={isoToMonthInput(phase.endDate)}
                onChange={(event) =>
                  updatePhase(index, { endDate: event.target.value ? monthInputToIso(event.target.value) : null })
                }
                className={INPUT_CLASS}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-navy/70">Responsibility level</label>
            <select
              value={phase.level}
              onChange={(event) => updatePhase(index, { level: event.target.value as CareerPhase['level'] })}
              className={INPUT_CLASS}
            >
              {levelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, emptyPhase()])}
        className="rounded-lg border border-dashed border-navy/40 px-4 py-3 text-sm text-navy/70 hover:border-navy focus:outline-none focus:ring-2 focus:ring-blue/40"
      >
        + Add phase
      </button>
    </div>
  );
}
