/**
 * A code-rendered stand-in for an AI-generated image ($0) — a warm generative
 * "dusk" scene (gradient field + ridge contours + a glowing sun + grain) so the
 * AIContentLabel sits on believable media instead of an abstract box.
 */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function SampleMedia() {
  return (
    <div
      className="relative aspect-[4/3] w-full overflow-hidden"
      role="img"
      aria-label="Sample AI-generated image"
    >
      {/* base warm-dusk gradient */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(157deg,#211a14 0%,#33201a 42%,#5a2f14 76%,#7d3a10 100%)' }}
      />
      {/* the sun / focal bloom — the one orange moment */}
      <div
        className="absolute"
        style={{
          left: '64%',
          top: '55%',
          width: '46%',
          height: '46%',
          transform: 'translate(-50%,-50%)',
          background: 'radial-gradient(circle,#ffbe7a 0%,#f26c0d 32%,transparent 68%)',
          filter: 'blur(2px)',
        }}
      />
      {/* ink depth in the foreground */}
      <div
        className="absolute"
        style={{
          left: '8%',
          top: '88%',
          width: '80%',
          height: '55%',
          background: 'radial-gradient(circle,#120d0a 0%,transparent 68%)',
          filter: 'blur(5px)',
        }}
      />
      {/* ridge contours — the "generated landscape" read */}
      <svg viewBox="0 0 200 150" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <g fill="none" stroke="#f5f2ed" strokeOpacity="0.16" strokeWidth="0.6">
          <path d="M0 92 Q52 74 104 90 T200 84" />
          <path d="M0 106 Q60 90 122 104 T200 100" />
          <path d="M0 120 Q44 106 112 118 T200 114" />
          <path d="M0 134 Q72 120 132 132 T200 128" />
        </g>
      </svg>
      {/* grain */}
      <div className="absolute inset-0" style={{ opacity: 0.08, backgroundImage: GRAIN }} />
    </div>
  );
}
