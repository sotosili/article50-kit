import { Sparkles, Info } from 'lucide-react';
import type { CSSProperties } from 'react';

/**
 * AIDisclosureBadge — EU AI Act Article 50(1)
 * -------------------------------------------------------------
 * Informs a natural person, in a clear and distinguishable way, that they are
 * interacting with an AI system. Use it wherever a user could mistake AI output
 * for a human (chat, voice UI, generated replies, agents).
 *
 * Accessibility (WCAG 2.1 AA):
 * - role="note" so assistive tech announces it as an aside, not decoration.
 * - The full sentence is always available to screen readers, even when the
 *   visible label is shortened to a chip.
 * - Icon is decorative (aria-hidden); meaning never depends on colour alone.
 */
export type AIDisclosureVariant = 'chip' | 'inline' | 'banner';

export interface AIDisclosureBadgeProps {
  /** Short visible label. Keep it plain. */
  label?: string;
  /** Full sentence — announced to screen readers, shown in the banner variant. */
  description?: string;
  /** Optional link to a page explaining how the AI works and how data is used. */
  infoHref?: string;
  variant?: AIDisclosureVariant;
  className?: string;
  style?: CSSProperties;
}

const DEFAULT_DESCRIPTION =
  'You are interacting with an AI system. Responses are generated automatically and may be inaccurate.';

export default function AIDisclosureBadge({
  label = 'AI',
  description = DEFAULT_DESCRIPTION,
  infoHref,
  variant = 'chip',
  className = '',
  style,
}: AIDisclosureBadgeProps) {
  const InfoLink = infoHref ? (
    <a
      href={infoHref}
      className="inline-flex items-center gap-1 font-medium text-blue underline underline-offset-2 hover:text-ink"
    >
      <Info aria-hidden="true" size={14} strokeWidth={2.25} />
      How this works
    </a>
  ) : null;

  if (variant === 'banner') {
    return (
      <aside
        role="note"
        className={`flex items-start gap-3 rounded-lg border border-line bg-surface px-4 py-3 ${className}`}
        style={style}
      >
        <Sparkles aria-hidden="true" size={18} strokeWidth={2.25} className="mt-0.5 shrink-0 text-orange" />
        <p className="text-sm leading-relaxed text-ink">
          {description}
          {InfoLink ? <> {InfoLink}</> : null}
        </p>
      </aside>
    );
  }

  if (variant === 'inline') {
    return (
      <span role="note" className={`inline-flex items-center gap-1.5 text-sm text-muted ${className}`} style={style}>
        <Sparkles aria-hidden="true" size={15} strokeWidth={2.25} className="text-orange" />
        <span>
          {label}
          <span className="sr-only"> - {description}</span>
        </span>
      </span>
    );
  }

  // chip (default)
  return (
    <span
      role="note"
      className={`inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-medium tracking-wide text-ink ${className}`}
      style={style}
    >
      <Sparkles aria-hidden="true" size={13} strokeWidth={2.5} className="text-orange" />
      <span aria-hidden="true">{label}</span>
      <span className="sr-only">{description}</span>
    </span>
  );
}
