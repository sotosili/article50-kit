import { useState } from 'react';
import AIDisclosureBadge, { type AIDisclosureVariant } from '../kit/AIDisclosureBadge';
import { Segmented, Toggle, ControlPanel, Stage } from './controls';

export default function AIDisclosureBadgeDemo() {
  const [variant, setVariant] = useState<AIDisclosureVariant>('chip');
  const [withLink, setWithLink] = useState(false);

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Stage>
        {/* A mock assistant message so the badge is seen in context */}
        <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-full bg-ink text-xs font-bold text-paper">A</span>
            <AIDisclosureBadge
              variant={variant}
              infoHref={withLink ? '#how-it-works' : undefined}
            />
          </div>
          <p className="text-sm leading-relaxed text-ink">
            Your appointment is booked for Thursday at 10:00. Would you like a reminder the day before?
          </p>
        </div>
      </Stage>

      <ControlPanel>
        <Segmented<AIDisclosureVariant>
          label="Variant"
          value={variant}
          onChange={setVariant}
          options={[
            { value: 'chip', label: 'Chip' },
            { value: 'inline', label: 'Inline' },
            { value: 'banner', label: 'Banner' },
          ]}
        />
        <Toggle label={'Show "How this works" link'} checked={withLink} onChange={setWithLink} />
      </ControlPanel>
    </div>
  );
}
