import type { AIMediaType } from '../kit/AIContentLabel';

/**
 * A code-rendered stand-in for AI media ($0) that adapts to the media TYPE
 * (image / video / audio / text) so the AIContentLabel sits on believable media.
 * It intentionally does NOT change with status — status is provenance, not appearance.
 */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const WAVE = [14, 26, 42, 58, 74, 50, 30, 64, 88, 68, 44, 78, 96, 64, 36, 58, 84, 50, 26, 46, 72, 92, 60, 34, 20, 44, 30, 16];

function Frame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden" role="img" aria-label={`Sample AI ${label}`}>
      {children}
    </div>
  );
}

/** The warm "dusk" scene reused for image + video. */
function Dusk() {
  return (
    <>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(157deg,#211a14 0%,#33201a 42%,#5a2f14 76%,#7d3a10 100%)' }} />
      <div
        className="absolute"
        style={{ left: '64%', top: '55%', width: '46%', height: '46%', transform: 'translate(-50%,-50%)', background: 'radial-gradient(circle,#ffbe7a 0%,#f26c0d 32%,transparent 68%)', filter: 'blur(2px)' }}
      />
      <div
        className="absolute"
        style={{ left: '8%', top: '88%', width: '80%', height: '55%', background: 'radial-gradient(circle,#120d0a 0%,transparent 68%)', filter: 'blur(5px)' }}
      />
      <svg viewBox="0 0 200 150" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <g fill="none" stroke="#f5f2ed" strokeOpacity="0.16" strokeWidth="0.6">
          <path d="M0 92 Q52 74 104 90 T200 84" />
          <path d="M0 106 Q60 90 122 104 T200 100" />
          <path d="M0 120 Q44 106 112 118 T200 114" />
          <path d="M0 134 Q72 120 132 132 T200 128" />
        </g>
      </svg>
      <div className="absolute inset-0" style={{ opacity: 0.08, backgroundImage: GRAIN }} />
    </>
  );
}

export default function SampleMedia({ mediaType = 'image' }: { mediaType?: AIMediaType }) {
  if (mediaType === 'video') {
    return (
      <Frame label="video">
        <Dusk />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-ink/55 backdrop-blur-sm">
            <svg width="16" height="18" viewBox="0 0 16 18" fill="#f5f2ed" aria-hidden="true"><path d="M0 0 L16 9 L0 18 Z" /></svg>
          </span>
        </div>
        <div className="absolute inset-x-4 bottom-3 h-1 rounded-full bg-paper/25">
          <div className="h-full w-1/3 rounded-full bg-orange" />
        </div>
      </Frame>
    );
  }

  if (mediaType === 'audio') {
    return (
      <Frame label="audio">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(157deg,#211a14,#33201a)' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-1/2 w-full items-center justify-center gap-[3px] px-8">
            {WAVE.map((h, i) => (
              <span
                key={i}
                className="w-1.5 rounded-full"
                style={{ height: `${h}%`, background: i < WAVE.length * 0.4 ? '#f26c0d' : 'rgba(245,242,237,0.45)' }}
              />
            ))}
          </div>
        </div>
        <div className="absolute inset-0" style={{ opacity: 0.06, backgroundImage: GRAIN }} />
      </Frame>
    );
  }

  if (mediaType === 'text') {
    return (
      <Frame label="text">
        <div className="absolute inset-0 bg-surface" />
        <div className="absolute inset-0 flex flex-col justify-center gap-3 px-8">
          <span className="h-3 w-2/5 rounded-full bg-orange/70" />
          <span className="h-2.5 w-11/12 rounded-full bg-ink/15" />
          <span className="h-2.5 w-full rounded-full bg-ink/15" />
          <span className="h-2.5 w-10/12 rounded-full bg-ink/15" />
          <span className="h-2.5 w-full rounded-full bg-ink/15" />
          <span className="h-2.5 w-3/5 rounded-full bg-ink/15" />
        </div>
        <div className="absolute inset-0" style={{ opacity: 0.05, backgroundImage: GRAIN }} />
      </Frame>
    );
  }

  // image (default)
  return (
    <Frame label="image">
      <Dusk />
    </Frame>
  );
}
