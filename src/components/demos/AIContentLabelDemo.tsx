import { useState } from 'react';
import AIContentLabel, {
  type AIContentStatus,
  type AIMediaType,
  type AIContentVariant,
} from '../kit/AIContentLabel';
import { Segmented, ControlPanel, Stage } from './controls';

export default function AIContentLabelDemo() {
  const [status, setStatus] = useState<AIContentStatus>('ai-generated');
  const [mediaType, setMediaType] = useState<AIMediaType>('image');
  const [variant, setVariant] = useState<AIContentVariant>('overlay');

  const snippet = `<figure data-ai-content="${status}" data-ai-media="${mediaType}">
  …
  <figcaption><!-- AIContentLabel --></figcaption>
</figure>`;

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Stage>
        <figure className="w-full max-w-xs">
          <div className="relative overflow-hidden rounded-xl border border-line">
            {/* Brand node-network placeholder standing in for AI-generated media */}
            <div
              className="aspect-[4/3] w-full"
              style={{
                background:
                  'radial-gradient(120% 90% at 30% 20%, #2a2018, #1a1410 70%)',
              }}
              role="img"
              aria-label="Sample media"
            >
              <svg viewBox="0 0 200 150" className="h-full w-full opacity-70" aria-hidden="true">
                <g stroke="#5a5048" strokeWidth="0.6" fill="none">
                  <path d="M30 40 L80 70 L150 35 M80 70 L120 110 M80 70 L40 110 M150 35 L170 90" />
                </g>
                <g fill="#6b6560">
                  <circle cx="30" cy="40" r="3" />
                  <circle cx="150" cy="35" r="3" />
                  <circle cx="120" cy="110" r="3" />
                  <circle cx="40" cy="110" r="3" />
                  <circle cx="170" cy="90" r="3" />
                </g>
                <circle cx="80" cy="70" r="6" fill="#f26c0d" stroke="#f5f2ed" strokeWidth="2" />
              </svg>
            </div>
            {variant === 'overlay' ? (
              <div className="absolute left-2 top-2">
                <AIContentLabel status={status} mediaType={mediaType} variant="overlay" />
              </div>
            ) : null}
          </div>
          {variant === 'caption' ? (
            <figcaption className="mt-2">
              <AIContentLabel status={status} mediaType={mediaType} variant="caption" detail="Nano Banana" />
            </figcaption>
          ) : null}
        </figure>
      </Stage>

      <ControlPanel>
        <Segmented<AIContentStatus>
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            { value: 'ai-generated', label: 'Generated' },
            { value: 'ai-assisted', label: 'Assisted' },
            { value: 'ai-edited', label: 'Edited' },
          ]}
        />
        <Segmented<AIMediaType>
          label="Media type"
          value={mediaType}
          onChange={setMediaType}
          options={[
            { value: 'image', label: 'Image' },
            { value: 'video', label: 'Video' },
            { value: 'audio', label: 'Audio' },
            { value: 'text', label: 'Text' },
          ]}
        />
        <Segmented<AIContentVariant>
          label="Placement"
          value={variant}
          onChange={setVariant}
          options={[
            { value: 'overlay', label: 'Overlay' },
            { value: 'caption', label: 'Caption' },
          ]}
        />
        <div>
          <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-muted">Machine-readable</span>
          <pre className="code mt-2 text-[0.72rem]">{snippet}</pre>
        </div>
      </ControlPanel>
    </div>
  );
}
