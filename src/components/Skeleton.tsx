export function SkeletonBlock({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={className}
      style={{
        background: "linear-gradient(90deg, var(--accent) 25%, #e8e8e8 50%, var(--accent) 75%)",
        backgroundSize: "200% 100%",
        animation: "skeleton-shimmer 1.5s infinite",
        borderRadius: "8px",
        ...style,
      }}
    />
  );
}

export function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <div className="ddp-card space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonBlock key={i} style={{ height: "1rem", width: i === 0 ? "60%" : "100%" }} />
      ))}
    </div>
  );
}
