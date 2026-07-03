import { useId, useState, type ReactNode } from 'react';
import { Check, X, Pencil, AlertTriangle, ShieldCheck, Undo2, Sparkles } from 'lucide-react';

/**
 * HumanReviewGate — the human-accountable layer
 * -------------------------------------------------------------
 * Wraps an AI-proposed action or output so a person must approve, edit, or reject
 * it before it takes effect. This is the "human-in-the-loop" control the market
 * asks for and the ethical centre of the kit: AI proposes, a named human decides.
 *
 * Accessibility (WCAG 2.1 AA):
 * - Confidence is a role="meter" with aria-valuetext, and is shown as text + a bar
 *   (never colour alone).
 * - Low confidence is flagged with an icon AND words, not just the accent colour.
 * - The resolution (approved / rejected) is announced through an aria-live region.
 * - Reject-with-reason uses a real, labelled textarea.
 */
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface HumanReviewGateProps {
  /** Short title of what is being reviewed, e.g. "Send refund of €240". */
  title: string;
  /** The AI-proposed output/action shown for review. */
  children: ReactNode;
  /** AI confidence, 0–1. Shown as a meter and used to flag low-confidence cases. */
  confidence?: number;
  /** Below this (0–1) the proposal is flagged for careful review. Default 0.6. */
  lowConfidenceThreshold?: number;
  /** Controlled status. If omitted, the component manages its own. */
  status?: ReviewStatus;
  /** Require a written reason before a rejection is confirmed. Default true. */
  requireReasonOnReject?: boolean;
  onApprove?: () => void;
  onReject?: (reason?: string) => void;
  onEdit?: () => void;
  className?: string;
}

function confidenceLevel(pct: number): { label: string; textClass: string } {
  if (pct >= 80) return { label: 'high confidence', textClass: 'text-ink' };
  if (pct >= 60) return { label: 'medium confidence', textClass: 'text-ink' };
  return { label: 'low confidence', textClass: 'text-flame' };
}

export default function HumanReviewGate({
  title,
  children,
  confidence,
  lowConfidenceThreshold = 0.6,
  status,
  requireReasonOnReject = true,
  onApprove,
  onReject,
  onEdit,
  className = '',
}: HumanReviewGateProps) {
  const liveId = useId();
  const reasonId = useId();
  const [internalStatus, setInternalStatus] = useState<ReviewStatus>('pending');
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const current = status ?? internalStatus;

  const hasConfidence = typeof confidence === 'number';
  const pct = hasConfidence ? Math.round(Math.min(1, Math.max(0, confidence!)) * 100) : 0;
  const level = confidenceLevel(pct);
  const isLow = hasConfidence && confidence! < lowConfidenceThreshold;

  const approve = () => {
    setInternalStatus('approved');
    onApprove?.();
  };
  const confirmReject = () => {
    if (requireReasonOnReject && reason.trim() === '') return;
    setInternalStatus('rejected');
    onReject?.(reason.trim() || undefined);
    setRejecting(false);
  };
  const reset = () => {
    setInternalStatus('pending');
    setRejecting(false);
    setReason('');
  };

  // ── Resolved states ─────────────────────────────────────────
  if (current !== 'pending') {
    const approved = current === 'approved';
    return (
      <div
        className={`rounded-xl border border-line bg-surface p-5 ${className}`}
        aria-labelledby={`${liveId}-title`}
      >
        <p id={liveId} role="status" className="flex items-center gap-2 text-sm font-semibold">
          {approved ? (
            <>
              <ShieldCheck aria-hidden="true" size={18} strokeWidth={2.25} className="text-ink" />
              <span className="text-ink">Approved by a human reviewer</span>
            </>
          ) : (
            <>
              <X aria-hidden="true" size={18} strokeWidth={2.5} className="text-orange" />
              <span className="text-ink">Rejected — this action will not run</span>
            </>
          )}
        </p>
        <p id={`${liveId}-title`} className="mt-2 text-sm text-muted">
          {title}
        </p>
        {!approved && reason ? <p className="mt-1 text-sm text-muted">Reason: {reason}</p> : null}
        <button
          type="button"
          onClick={reset}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-blue underline underline-offset-2 hover:text-ink"
        >
          <Undo2 aria-hidden="true" size={15} strokeWidth={2.25} />
          Undo decision
        </button>
      </div>
    );
  }

  // ── Pending: awaiting a human ───────────────────────────────
  return (
    <div className={`overflow-hidden rounded-xl border border-line bg-paper ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-line bg-surface px-5 py-3">
        <h2 className="font-display text-base font-semibold text-ink">{title}</h2>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-2.5 py-1 text-xs font-medium text-ink">
          <Sparkles aria-hidden="true" size={13} strokeWidth={2.5} className="text-orange" />
          <span aria-hidden="true">AI proposal</span>
          <span className="sr-only">This is a proposal generated by AI, awaiting human review.</span>
        </span>
      </div>

      <div className="p-5">
        <div className="rounded-lg border border-line bg-surface px-4 py-3 text-sm leading-relaxed text-ink">
          {children}
        </div>

        {hasConfidence ? (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-ink">AI confidence</span>
              <span className={`font-semibold ${level.textClass}`}>
                {pct}% · {level.label}
              </span>
            </div>
            <div
              role="meter"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuetext={`${pct} percent, ${level.label}`}
              aria-label="AI confidence"
              className="mt-2 h-2 w-full overflow-hidden rounded-full bg-line"
            >
              <div
                className={`h-full rounded-full ${isLow ? 'bg-orange' : 'bg-ink'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            {isLow ? (
              <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-flame">
                <AlertTriangle aria-hidden="true" size={15} strokeWidth={2.25} />
                Low confidence — review this carefully before approving.
              </p>
            ) : null}
          </div>
        ) : null}

        {/* Reject-with-reason */}
        {rejecting ? (
          <div className="mt-4">
            <label htmlFor={reasonId} className="text-sm font-medium text-ink">
              Reason for rejecting
              {requireReasonOnReject ? <span className="text-flame"> (required)</span> : null}
            </label>
            <textarea
              id={reasonId}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="mt-1.5 w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-muted focus-visible:border-orange"
              placeholder="Briefly, why is this being rejected?"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={confirmReject}
                disabled={requireReasonOnReject && reason.trim() === ''}
                className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper transition-colors hover:bg-orange disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-ink"
              >
                <X aria-hidden="true" size={16} strokeWidth={2.5} />
                Confirm rejection
              </button>
              <button
                type="button"
                onClick={() => setRejecting(false)}
                className="rounded-lg border border-line bg-paper px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={approve}
              className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper transition-colors hover:bg-orange"
            >
              <Check aria-hidden="true" size={16} strokeWidth={2.5} />
              Approve
            </button>
            {onEdit ? (
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-paper px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface"
              >
                <Pencil aria-hidden="true" size={16} strokeWidth={2.25} />
                Edit
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setRejecting(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-paper px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface"
            >
              <X aria-hidden="true" size={16} strokeWidth={2.5} />
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
