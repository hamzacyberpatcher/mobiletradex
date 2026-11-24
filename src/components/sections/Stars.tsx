const STAR = "M12 2.2l2.9 6.1 6.7.8-4.9 4.6 1.3 6.6L12 17l-6 3.3 1.3-6.6L2.4 9.1l6.7-.8L12 2.2z";

function Row({ size, className }: { size: number; className: string }) {
  return (
    <span className={`flex ${className}`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d={STAR} />
        </svg>
      ))}
    </span>
  );
}

/** Star rating that supports fractions (4.8 fills 96% of the row). Colours follow the theme. */
export default function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="relative inline-flex" role="img" aria-label={`${value} out of 5 stars`}>
      <Row size={size} className="text-ink/20" />
      <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${(value / 5) * 100}%` }}>
        <Row size={size} className="text-deep" />
      </span>
    </span>
  );
}
