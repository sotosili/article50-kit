# Article 50 UI Pattern Kit

**Accessible React components for EU AI Act Article 50 transparency.** The parts of the AI Act that
live in the interface — telling people they are talking to AI, labelling AI-generated content, giving
notice of emotion recognition, and keeping a human in the loop — built to **WCAG 2.1 AA** and ready to
drop into a React or Astro product.

Article 50 becomes enforceable on **2 August 2026** - not delayed by the 2026 Digital Omnibus, which
deferred only the high-risk regime. Systems already on the market before that date get until
2 December 2026 for the machine-readable marking (50(2)) only; the visible disclosure duties apply
from day one, so the interface work is due now.

> These are engineering patterns, not legal advice. They help you meet Article 50 duties in the
> interface; confirm your specific obligations with qualified counsel.

Built by [Sotiris Iliadis](https://sotiris-portfolio.pages.dev) — product designer & design engineer,
responsible-AI and accessibility. MIT licensed.

---

## The four patterns

| Component | Article 50 | What it does |
|---|---|---|
| **`AIDisclosureBadge`** | 50(1) | Tells a person, clearly, that they are interacting with an AI system. |
| **`AIContentLabel`** | 50(2) + 50(4) | Labels AI-generated / manipulated content (incl. deepfakes) visibly; pair with embedded provenance (C2PA) for 50(2)'s machine-readable marking. |
| **`EmotionRecognitionNotice`** | 50(3) | Informs people exposed to emotion-recognition or biometric-categorisation systems. |
| **`HumanReviewGate`** | the accountable layer | Holds an AI-proposed action until a named human approves, edits, or rejects it. |

Each lives in a single self-contained file under [`src/components/kit/`](src/components/kit/) — copy one in,
or use the set.

---

## Run the docs site

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
```

Requires Node ≥ 22.12.

## Use a component

```tsx
import AIDisclosureBadge from './components/kit/AIDisclosureBadge';
import HumanReviewGate from './components/kit/HumanReviewGate';

<AIDisclosureBadge variant="banner" infoHref="/how-our-assistant-works" />

<HumanReviewGate
  title="Send refund of €240 to customer"
  confidence={0.52}
  onApprove={commitRefund}
  onReject={(reason) => logRejection(reason)}
>
  The model matched two identical charges and proposes refunding the second.
</HumanReviewGate>
```

---

## Accessibility

Every component is built to WCAG 2.1 AA — the standard the AI Act's own accessibility requirements point to:

- Semantic roles (`note`, `region`, `status`, `meter`) so assistive tech announces meaning, not decoration.
- Meaning never depends on colour alone — icons are decorative and text always carries the message.
- Visible, on-brand focus rings on every interactive element; full keyboard operation.
- Live regions announce state changes (a decision resolved, a notice acknowledged).
- Motion respects `prefers-reduced-motion`.

## Project structure

```
src/
  components/
    kit/          # the reusable library components (copy these into your app)
    demos/        # interactive playgrounds used by the docs site
  layouts/        # Base + Pattern page shells
  pages/          # landing + one page per pattern
  styles/         # brand tokens + accessibility primitives
```

## Tech

Astro · React · Tailwind CSS v4 · lucide-react.

## License

[MIT](LICENSE) © 2026 Sotiris Iliadis.
