import { useState } from 'react';
import AIContentLabel, {
  type AIContentStatus,
  type AIMediaType,
  type AIContentVariant,
} from '../kit/AIContentLabel';
import { Segmented, ControlPanel, Stage } from './controls';
import SampleMedia from './SampleMedia';

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
            <SampleMedia mediaType={mediaType} />
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
