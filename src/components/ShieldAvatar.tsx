const SHIELD_PATH = "M50 4 L92 20 L92 62 C92 88 72 108 50 118 C28 108 8 88 8 62 L8 20 Z";

// Kleine versie van het DreamTeam-schildje, herbruikbaar overal waar een
// leverancier wordt getoond (o.a. DM-gesprekken) — met foto indien bekend,
// anders het DreamDay-logo als placeholder.
export default function ShieldAvatar({
  photoUrl, clipId, size = 32,
}: {
  photoUrl?: string | null;
  clipId: string;
  size?: number;
}) {
  return (
    <svg viewBox="0 0 100 120" width={size} height={size * 1.2} style={{ flexShrink: 0 }}>
      <defs>
        <clipPath id={`shield-avatar-${clipId}`}>
          <path d={SHIELD_PATH} />
        </clipPath>
      </defs>
      <path d={SHIELD_PATH} fill="#1a1a1a" stroke="var(--gold)" strokeWidth="2" />
      {photoUrl ? (
        <image
          href={photoUrl}
          x="8" y="4" width="84" height="114"
          clipPath={`url(#shield-avatar-${clipId})`}
          preserveAspectRatio="xMidYMid slice"
        />
      ) : (
        <image href="/images/logo-wit.svg" x="35" y="48" width="30" height="30" opacity={0.85} />
      )}
    </svg>
  );
}
