import { useState } from 'react';
import HumanReviewGate from '../kit/HumanReviewGate';
import { Slider, Toggle, ControlPanel, Stage } from './controls';

export default function HumanReviewGateDemo() {
  const [confidence, setConfidence] = useState(52);
  const [requireReason, setRequireReason] = useState(true);
  const [log, setLog] = useState<string[]>([]);
  const [nonce, setNonce] = useState(0);

  const record = (entry: string) =>
    setLog((l) => [`${new Date().toLocaleTimeString()} — ${entry}`, ...l].slice(0, 5));

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Stage>
        <div className="w-full max-w-md">
          <HumanReviewGate
            key={nonce}
            title="Send refund of €240 to customer"
            confidence={confidence / 100}
            requireReasonOnReject={requireReason}
            onApprove={() => record('Approved the refund')}
            onReject={(reason) => record(`Rejected${reason ? ` — "${reason}"` : ''}`)}
            onEdit={() => record('Opened for editing')}
          >
            The customer reported a duplicate charge on 28 June. The model matched two identical
            transactions and proposes refunding the second one.
          </HumanReviewGate>
        </div>
      </Stage>

      <ControlPanel>
        <Slider
          label="AI confidence"
          value={confidence}
          onChange={setConfidence}
          display={`${confidence}%`}
        />
        <Toggle label="Require a reason to reject" checked={requireReason} onChange={setRequireReason} />
        <button
          type="button"
          onClick={() => setNonce((n) => n + 1)}
          className="w-fit rounded-lg border border-line bg-paper px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface"
        >
          Reset proposal
        </button>
        <div>
          <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-muted">Decision log</span>
          {log.length === 0 ? (
            <p className="mt-2 text-sm text-muted">No decisions yet. Approve or reject the proposal.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm text-ink">
              {log.map((entry, i) => (
                <li key={i} className="tabular-nums">
                  {entry}
                </li>
              ))}
            </ul>
          )}
        </div>
      </ControlPanel>
    </div>
  );
}
