/**
 * toneAnalyzer — the simulated "model" behind the accountable-AI demo.
 * -------------------------------------------------------------------
 * This is a small, deterministic lexicon classifier, NOT a live LLM. It exists
 * so the demo can prove the accountable *interface* loop — streaming, a real
 * confidence signal, human review of low-confidence cases, and honest refusal
 * on garbage input — at $0 and with no key to leak or credits to drain. It is
 * also more useful as a teaching harness than a real API: it lets the UI trigger
 * the "low confidence" and "unreadable" states on demand, deterministically.
 *
 * Swapping in a real Claude/OpenAI call means replacing `analyzeTone` with a
 * server call that returns the same `ToneAnalysis` shape. The UI never changes.
 */

export type ToneId = 'positive' | 'neutral' | 'frustrated' | 'angry' | 'sad' | 'anxious';

export const TONE_LABEL: Record<ToneId, string> = {
  positive: 'Positive',
  neutral: 'Neutral',
  frustrated: 'Frustrated',
  angry: 'Angry',
  sad: 'Sad',
  anxious: 'Anxious',
};

/** Ordered for a consistent, human-pickable list in the override control. */
export const TONE_ORDER: ToneId[] = ['positive', 'neutral', 'frustrated', 'angry', 'sad', 'anxious'];

export interface ToneScore {
  id: ToneId;
  label: string;
  /** Share of the total emotional signal, 0..1. */
  score: number;
}

export type AnalysisOutcome = 'confident' | 'low-confidence' | 'unreadable';

export interface ToneAnalysis {
  outcome: AnalysisOutcome;
  primary: ToneScore | null;
  /** Ranked, normalised. Empty when unreadable. */
  distribution: ToneScore[];
  /** 0..1. Undefined meaning when unreadable (kept at 0). */
  confidence: number;
  /** Plain-language explanation — this is the text that streams into the UI. */
  reasoning: string;
  /** The words that actually drove the call, shown as evidence. */
  evidence: string[];
  wordCount: number;
}

// ── Lexicon ────────────────────────────────────────────────────────────────
// Weighted word lists. Strong words carry more (1.5); ordinary cues carry 1.
const LEXICON: Record<Exclude<ToneId, 'neutral'>, [string, number][]> = {
  positive: [
    ['love', 1.5], ['loved', 1.3], ['amazing', 1.5], ['wonderful', 1.4], ['fantastic', 1.5],
    ['brilliant', 1.4], ['excellent', 1.3], ['perfect', 1.3], ['great', 1], ['good', 1],
    ['happy', 1.2], ['glad', 1], ['delighted', 1.4], ['thrilled', 1.5], ['grateful', 1.3],
    ['thank', 1.1], ['thanks', 1.1], ['appreciate', 1.2], ['awesome', 1.3], ['enjoy', 1.1],
    ['enjoyed', 1.1], ['excited', 1.2], ['pleased', 1.1], ['beautiful', 1.1], ['best', 1],
    ['nice', 0.9], ['kind', 0.9], ['hopeful', 1], ['smooth', 0.9], ['helpful', 1],
  ],
  frustrated: [
    ['frustrated', 1.5], ['frustrating', 1.5], ['annoying', 1.3], ['annoyed', 1.3], ['ugh', 1.2],
    ['again', 0.8], ['still', 0.7], ['stuck', 1.1], ['broken', 1.2], ['useless', 1.4],
    ['disappointing', 1.3], ['tedious', 1.1], ['hassle', 1.2], ['slow', 1], ['confusing', 1.1],
    ['unclear', 1], ['ridiculous', 1.3], ['seriously', 0.9], ['pointless', 1.3], ['waste', 1.2],
  ],
  angry: [
    ['angry', 1.5], ['furious', 1.6], ['hate', 1.5], ['hated', 1.4], ['outrageous', 1.5],
    ['unacceptable', 1.5], ['disgusting', 1.5], ['appalled', 1.4], ['livid', 1.5], ['terrible', 1.2],
    ['awful', 1.2], ['worst', 1.3], ['scam', 1.4], ['insulting', 1.4], ['disrespectful', 1.4],
    ['fuming', 1.5], ['enraged', 1.6],
  ],
  sad: [
    ['sad', 1.4], ['unhappy', 1.3], ['sorry', 0.9], ['miss', 1], ['missed', 1], ['lonely', 1.4],
    ['heartbroken', 1.6], ['crying', 1.4], ['grief', 1.5], ['hurt', 1.1], ['down', 0.9],
    ['lost', 1], ['gloomy', 1.3], ['regret', 1.2], ['unfortunately', 0.9], ['disappointed', 1.2],
    ['devastated', 1.6],
  ],
  anxious: [
    ['worried', 1.4], ['worry', 1.3], ['anxious', 1.5], ['nervous', 1.3], ['scared', 1.4],
    ['afraid', 1.4], ['fear', 1.3], ['panic', 1.5], ['stressed', 1.4], ['overwhelmed', 1.4],
    ['uneasy', 1.2], ['concerned', 1.1], ['unsure', 1], ['urgent', 1.1], ['asap', 1],
    ['deadline', 0.9], ['dreading', 1.4],
  ],
};

const NEGATORS = new Set([
  'not', 'no', 'never', 'cant', 'cannot', 'dont', 'doesnt', 'isnt', 'wasnt',
  'arent', 'wont', 'without', 'hardly', 'barely',
]);

const WORD_TONE = new Map<string, { tone: ToneId; w: number }>();
for (const key of Object.keys(LEXICON) as Exclude<ToneId, 'neutral'>[]) {
  for (const [word, weight] of LEXICON[key]) WORD_TONE.set(word, { tone: key, w: weight });
}

// ── Helpers ──────────────────────────────────────────────────────────────
function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/n['’]t\b/g, ' not').match(/[a-z']+/g) ?? [];
}
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const round2 = (n: number) => Math.round(n * 100) / 100;

function quoteList(words: string[]): string {
  const q = words.map((w) => `'${w}'`);
  if (q.length === 1) return q[0];
  if (q.length === 2) return `${q[0]} and ${q[1]}`;
  return `${q.slice(0, -1).join(', ')}, and ${q[q.length - 1]}`;
}

function unreadable(reasoning: string, wordCount: number): ToneAnalysis {
  return { outcome: 'unreadable', primary: null, distribution: [], confidence: 0, reasoning, evidence: [], wordCount };
}

// ── The classifier ─────────────────────────────────────────────────────────
export function analyzeTone(text: string): ToneAnalysis {
  const trimmed = text.trim();
  const nonSpace = trimmed.replace(/\s/g, '').length;
  const letters = (trimmed.match(/[a-zA-Z]/g) ?? []).length;
  const tokens = tokenize(trimmed);
  const alphaTokens = tokens.filter((t) => t.replace(/'/g, '').length >= 2);
  const wordCount = alphaTokens.length;

  // ── Graceful degradation: refuse rather than fabricate a reading ──
  if (nonSpace === 0) {
    return unreadable("There's nothing to read yet. Add a message and I'll take a look.", 0);
  }
  if (alphaTokens.length < 2 || letters / nonSpace < 0.45) {
    return unreadable(
      "I can't find enough real language here to read a tone. Rather than guess, I'm flagging this as unreadable and leaving the call to you.",
      wordCount,
    );
  }

  const scores: Record<ToneId, number> = {
    positive: 0, neutral: 0, frustrated: 0, angry: 0, sad: 0, anxious: 0,
  };
  const evidence: string[] = [];
  let matchedWeight = 0;

  for (let i = 0; i < tokens.length; i++) {
    const hit = WORD_TONE.get(tokens[i]);
    if (!hit) continue;
    const negated = tokens.slice(Math.max(0, i - 2), i).some((t) => NEGATORS.has(t));
    const w = negated ? hit.w * 0.25 : hit.w; // a nearby negator damps the signal
    scores[hit.tone] += w;
    matchedWeight += w;
    if (!negated && evidence.length < 5 && !evidence.includes(tokens[i])) evidence.push(tokens[i]);
  }

  // ── No emotional signal: read as neutral, confidence scales with length ──
  if (matchedWeight === 0) {
    const confidence = round2(clamp(0.32 + 0.32 * Math.min(1, wordCount / 12), 0.2, 0.7));
    const primary: ToneScore = { id: 'neutral', label: TONE_LABEL.neutral, score: 1 };
    return {
      outcome: confidence < 0.6 ? 'low-confidence' : 'confident',
      primary,
      distribution: [primary],
      confidence,
      reasoning:
        confidence < 0.6
          ? `Reading ${wordCount} words. There are no clear emotional cues, and there's too little text to be sure it's simply neutral. I'll leave this call to you.`
          : `Reading ${wordCount} words. Nothing leans clearly warm or negative here. This reads as a neutral, matter of fact message.`,
      evidence: [],
      wordCount,
    };
  }

  // ── Rank the tones that fired ──
  const ranked = TONE_ORDER
    .map((id) => ({ id, raw: scores[id] }))
    .filter((t) => t.raw > 0)
    .sort((a, b) => b.raw - a.raw);
  const total = ranked.reduce((s, t) => s + t.raw, 0);
  const distribution: ToneScore[] = ranked.map((t) => ({ id: t.id, label: TONE_LABEL[t.id], score: t.raw / total }));
  const primary = distribution[0];
  const second = distribution[1];
  const tie = !!second && primary.score - second.score < 0.15;

  const clarity = primary.score;                       // how dominant the winner is
  const volume = Math.min(1, matchedWeight / 3);       // is there enough evidence
  const lengthFactor = Math.min(1, wordCount / 6);     // is there enough text
  let confidence = clarity * 0.5 + volume * 0.3 + lengthFactor * 0.2;
  if (tie) confidence *= 0.8;                           // a near-tie is inherently uncertain
  confidence = round2(clamp(confidence, 0.18, 0.97));

  const evidenceSentence = evidence.length
    ? `The signals that stand out are ${quoteList(evidence)}.`
    : 'The emotional signal here is faint.';
  const tieClause = tie ? `, with a real thread of ${second.label.toLowerCase()} alongside it` : '';
  const closer =
    confidence < 0.6
      ? "The signal is thin, so I'm flagging this for you to confirm rather than deciding on my own."
      : "The evidence is consistent, so I'll propose that. You still make the final call.";

  return {
    outcome: confidence < 0.6 ? 'low-confidence' : 'confident',
    primary,
    distribution,
    confidence,
    reasoning: `Reading ${wordCount} words. ${evidenceSentence} They point to a ${primary.label.toLowerCase()} tone${tieClause}. ${closer}`,
    evidence,
    wordCount,
  };
}
