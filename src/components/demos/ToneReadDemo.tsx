import { useEffect, useRef, useState } from 'react';
import { Radar, ShieldQuestion, PenLine, RotateCcw } from 'lucide-react';
import AIDisclosureBadge from '../kit/AIDisclosureBadge';
import EmotionRecognitionNotice from '../kit/EmotionRecognitionNotice';
import HumanReviewGate from '../kit/HumanReviewGate';
import AIContentLabel from '../kit/AIContentLabel';
import { Segmented } from './controls';
import { analyzeTone, TONE_LABEL, TONE_ORDER, type ToneAnalysis, type ToneId } from '../../lib/toneAnalyzer';

const SAMPLES: { label: string; text: string }[] = [
  {
    label: 'Warm',
    text: "Honestly, thank you so much - this update is fantastic and the team has been wonderful to work with.",
  },
  {
    label: 'Frustrated',
    text: "This is the third time I've reported the same bug and it's still broken. Really frustrating, and a waste of my time.",
  },
  {
    label: 'Ambiguous',
    text: 'ok fine, whatever works i guess',
  },
  {
    label: 'Unreadable',
    text: '$$$ 99!!! ??? ###',
  },
];

type Phase = 'idle' | 'streaming' | 'done';

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/** The evidence + distribution + AI label shown inside the review gate. */
function VerdictBody({ analysis, override }: { analysis: ToneAnalysis; override: ToneId | null }) {
  const bars = analysis.distribution.filter((t) => t.score > 0.001).slice(0, 3);
  return (
    <div>
      {override ? (
        <p className="mb-3 text-sm font-medium text-ink">
          You set this to <span className="font-semibold">{TONE_LABEL[override]}</span>.{' '}
          <span className="text-muted">The AI had proposed {analysis.primary?.label}.</span>
        </p>
      ) : null}

      <p className="text-sm text-muted">
        {analysis.evidence.length
          ? <>Strongest signals: <span className="text-ink">{analysis.evidence.join(', ')}</span></>
          : 'No strong emotional cues were found.'}
      </p>

      {bars.length > 1 ? (
        <dl className="mt-3 flex flex-col gap-2">
          {bars.map((t) => (
            <div key={t.id} className="grid grid-cols-[5.5rem_1fr_2.5rem] items-center gap-3">
              <dt className="text-sm text-ink">{t.label}</dt>
              <dd className="h-1.5 overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-ink" style={{ width: `${Math.round(t.score * 100)}%` }} />
              </dd>
              <dd className="text-right text-xs tabular-nums text-muted">{Math.round(t.score * 100)}%</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <div className="mt-4">
        <AIContentLabel status="ai-generated" mediaType="text" variant="caption" detail="tone analysis" />
      </div>
    </div>
  );
}

export default function ToneReadDemo() {
  const [input, setInput] = useState('');
  const [analysis, setAnalysis] = useState<ToneAnalysis | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [shown, setShown] = useState('');
  const [runId, setRunId] = useState(0);
  const [editing, setEditing] = useState(false);
  const [override, setOverride] = useState<ToneId | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  function run(text: string) {
    if (timer.current) clearInterval(timer.current);
    const a = analyzeTone(text);
    setAnalysis(a);
    setOverride(null);
    setEditing(false);
    setShown('');
    setPhase('streaming');
    setRunId((n) => n + 1);
  }

  function useSample(text: string) {
    setInput(text);
    run(text);
  }

  function reset() {
    if (timer.current) clearInterval(timer.current);
    setInput('');
    setAnalysis(null);
    setPhase('idle');
    setShown('');
    setOverride(null);
    setEditing(false);
  }

  // Stream the reasoning word by word (or all at once for reduced motion).
  useEffect(() => {
    if (phase !== 'streaming' || !analysis) return;
    const full = analysis.reasoning;
    if (prefersReducedMotion()) {
      setShown(full);
      setPhase('done');
      return;
    }
    const words = full.split(' ');
    let i = 0;
    timer.current = setInterval(() => {
      i += 1;
      setShown(words.slice(0, i).join(' '));
      if (i >= words.length) {
        if (timer.current) clearInterval(timer.current);
        setPhase('done');
      }
    }, 42);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId]);

  const readable = analysis && analysis.outcome !== 'unreadable' && analysis.primary;

  return (
    <div className="flex flex-col gap-6">
      {/* Art. 50(1) — you're talking to AI */}
      <AIDisclosureBadge
        variant="banner"
        description="You're using an AI tone-analysis system. It estimates emotional tone from your words, it can be wrong, and a human makes the final call. It's a simulated model - no message leaves your browser."
      />

      {/* Art. 50(3) — this is emotion recognition, and you're being told */}
      <EmotionRecognitionNotice system="Tone Read" dataProcessed={['the words in your message']} />

      {/* Input */}
      <div className="rounded-xl border border-line bg-paper p-5">
        <label htmlFor="tone-input" className="text-sm font-medium text-ink">
          Your message
        </label>
        <textarea
          id="tone-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          placeholder="Paste a message and I'll read its tone."
          className="mt-2 w-full resize-y rounded-lg border border-line bg-surface px-3 py-2.5 text-sm leading-relaxed text-ink placeholder:text-muted focus-visible:border-orange"
        />

        <div className="mt-3">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Try one</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {SAMPLES.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => useSample(s.text)}
                className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-orange-soft"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => run(input)}
            disabled={input.trim() === '' || phase === 'streaming'}
            className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper transition-colors hover:bg-flame disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-ink"
          >
            <Radar aria-hidden="true" size={16} strokeWidth={2.25} />
            {phase === 'streaming' ? 'Reading…' : 'Read the tone'}
          </button>
          {analysis ? (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-paper px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface"
            >
              <RotateCcw aria-hidden="true" size={15} strokeWidth={2.25} />
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {/* Output */}
      {analysis ? (
        <div className="rounded-xl border border-line bg-surface/50 p-5">
          {/* The model "thinking out loud" — streamed */}
          <div className="flex items-center gap-2">
            <AIDisclosureBadge variant="chip" label="AI" />
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              {phase === 'streaming' ? 'Analysing' : 'Analysis'}
            </span>
          </div>
          <p
            aria-hidden={phase === 'streaming'}
            className="mt-3 text-[0.95rem] leading-relaxed text-ink"
          >
            {shown}
            {phase === 'streaming' ? (
              <span
                aria-hidden="true"
                className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[0.15em] animate-pulse bg-flame"
              />
            ) : null}
          </p>

          {/* One clean screen-reader announcement of the outcome */}
          {phase === 'done' ? (
            <p role="status" className="sr-only">
              {analysis.outcome === 'unreadable'
                ? 'Analysis complete. No reliable tone could be read. Nothing was decided; this is left to you.'
                : `Analysis complete. Proposed tone ${analysis.primary?.label}, ${Math.round(
                    analysis.confidence * 100,
                  )} percent confidence${
                    analysis.outcome === 'low-confidence' ? ', low confidence, flagged for human review' : ''
                  }. You can approve, override, or reject.`}
            </p>
          ) : null}

          {/* The proposal — only after the stream finishes */}
          {phase === 'done' && readable ? (
            <div className="mt-5">
              <HumanReviewGate
                key={runId}
                title={`Proposed tone: ${analysis.primary!.label}`}
                confidence={analysis.confidence}
                requireReasonOnReject={false}
                onEdit={() => setEditing(true)}
              >
                {editing ? (
                  <div>
                    <Segmented<ToneId>
                      label="Set the correct tone"
                      value={override ?? analysis.primary!.id}
                      onChange={(t) => {
                        setOverride(t);
                        setEditing(false);
                      }}
                      options={TONE_ORDER.map((id) => ({ value: id, label: TONE_LABEL[id] }))}
                    />
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                      <PenLine aria-hidden="true" size={13} strokeWidth={2.25} />
                      Your correction overrides the AI. This is the override path.
                    </p>
                  </div>
                ) : (
                  <VerdictBody analysis={analysis} override={override} />
                )}
              </HumanReviewGate>
            </div>
          ) : null}

          {/* Graceful degradation — no fake verdict, no confidence, no gate */}
          {phase === 'done' && !readable ? (
            <div className="mt-5 flex items-start gap-3 rounded-lg border border-line bg-paper p-4">
              <ShieldQuestion aria-hidden="true" size={20} strokeWidth={2} className="mt-0.5 shrink-0 text-ink" />
              <div>
                <p className="text-sm font-semibold text-ink">Nothing was decided.</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  When the input is too thin to read, the system refuses to guess instead of returning a
                  confident-sounding answer. That refusal is the feature.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
