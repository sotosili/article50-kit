import { useId, type ReactNode } from 'react';

/** Small, accessible control primitives shared by the pattern playgrounds. */

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-muted">{label}</span>
      <div role="radiogroup" aria-label={label} className="mt-2 inline-flex flex-wrap gap-1 rounded-lg border border-line bg-paper p-1">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                active ? 'bg-ink text-paper' : 'text-ink hover:bg-surface'
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-ink">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-[var(--color-orange)]"
      />
      {label}
    </label>
  );
}

export function Slider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  display,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
  display?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="flex items-center justify-between text-sm font-medium text-ink">
        <span>{label}</span>
        <span className="font-semibold text-muted">{display ?? value}</span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-[var(--color-orange)]"
      />
    </div>
  );
}

export function ControlPanel({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-5 rounded-xl border border-line bg-surface/60 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Controls</p>
      {children}
    </div>
  );
}

export function Stage({ children, label = 'Preview' }: { children: ReactNode; label?: string }) {
  return (
    <div className="relative flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-xl border border-line bg-paper p-8">
      <span className="absolute left-3 top-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted">
        {label}
      </span>
      {children}
    </div>
  );
}
