import { useId, useState } from 'react';
import { Eye, Check, Info } from 'lucide-react';

/**
 * EmotionRecognitionNotice — EU AI Act Article 50(3)
 * -------------------------------------------------------------
 * Informs a natural person that they are exposed to an emotion-recognition or
 * biometric-categorisation system, and what it processes — BEFORE it acts on them.
 *
 * Accessibility (WCAG 2.1 AA):
 * - Rendered as a labelled region with a heading; not a modal, so it never traps focus.
 * - Acknowledgement is a real button; on acknowledge it collapses to a persistent,
 *   still-visible indicator (the obligation to inform does not end on dismissal).
 * - Status changes are announced via aria-live.
 */
export interface EmotionRecognitionNoticeProps {
  /** Name of the system doing the recognition. */
  system?: string;
  /** What the system processes, e.g. ["facial expression", "tone of voice"]. */
  dataProcessed?: string[];
  /** Whether the system is currently active. */
  active?: boolean;
  /** Optional link to a fuller explanation / privacy notice. */
  infoHref?: string;
  /** Controlled acknowledged state. If omitted, the component manages its own. */
  acknowledged?: boolean;
  onAcknowledge?: () => void;
  className?: string;
}

export default function EmotionRecognitionNotice({
  system = 'This service',
  dataProcessed = ['facial expression', 'tone of voice'],
  active = true,
  infoHref,
  acknowledged,
  onAcknowledge,
  className = '',
}: EmotionRecognitionNoticeProps) {
  const headingId = useId();
  const [internalAck, setInternalAck] = useState(false);
  const isAck = acknowledged ?? internalAck;

  const handleAck = () => {
    setInternalAck(true);
    onAcknowledge?.();
  };

  const list =
    dataProcessed.length <= 1
      ? dataProcessed.join('')
      : `${dataProcessed.slice(0, -1).join(', ')} and ${dataProcessed[dataProcessed.length - 1]}`;

  if (!active) return null;

  // Collapsed persistent indicator — still informs after acknowledgement.
  if (isAck) {
    return (
      <p
        role="status"
        className={`inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink ${className}`}
      >
        <Eye aria-hidden="true" size={14} strokeWidth={2.25} className="text-orange" />
        Emotion recognition is active
      </p>
    );
  }

  return (
    <section
      role="region"
      aria-labelledby={headingId}
      className={`rounded-xl border border-line bg-surface p-5 ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-orange-soft">
          <Eye aria-hidden="true" size={18} strokeWidth={2.25} className="text-orange" />
        </span>
        <div className="min-w-0">
          <h2 id={headingId} className="font-display text-lg font-semibold text-ink">
            Emotion recognition is active
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-ink">
            {system} uses an AI system that reads {list} to estimate how you are feeling. You are being
            told this so you can decide how to proceed.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleAck}
              className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper transition-colors hover:bg-orange"
            >
              <Check aria-hidden="true" size={16} strokeWidth={2.5} />
              I understand
            </button>
            {infoHref ? (
              <a
                href={infoHref}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-blue underline underline-offset-2 hover:text-ink"
              >
                <Info aria-hidden="true" size={15} strokeWidth={2.25} />
                What is collected and why
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
