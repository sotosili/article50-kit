import { useState } from 'react';
import EmotionRecognitionNotice from '../kit/EmotionRecognitionNotice';
import { Toggle, ControlPanel, Stage } from './controls';

export default function EmotionRecognitionNoticeDemo() {
  const [active, setActive] = useState(true);
  const [withVoice, setWithVoice] = useState(true);
  // Remount key lets the "Reset" toggle clear the acknowledged state for the demo.
  const [nonce, setNonce] = useState(0);

  const data = withVoice ? ['facial expression', 'tone of voice'] : ['facial expression'];

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Stage>
        <div className="w-full max-w-md">
          {active ? (
            <EmotionRecognitionNotice
              key={nonce}
              system="Bright Support"
              dataProcessed={data}
              infoHref="#privacy"
            />
          ) : (
            <p className="text-sm text-muted">System is off - no notice is shown.</p>
          )}
        </div>
      </Stage>

      <ControlPanel>
        <Toggle label="Emotion recognition active" checked={active} onChange={setActive} />
        <Toggle label="Also reads tone of voice" checked={withVoice} onChange={setWithVoice} />
        <button
          type="button"
          onClick={() => setNonce((n) => n + 1)}
          className="w-fit rounded-lg border border-line bg-paper px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface"
        >
          Reset acknowledgement
        </button>
        <p className="text-sm leading-relaxed text-muted">
          After &ldquo;I understand&rdquo;, the notice collapses to a persistent indicator - the duty to
          inform does not end when the banner is dismissed.
        </p>
      </ControlPanel>
    </div>
  );
}
