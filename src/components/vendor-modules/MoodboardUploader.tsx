"use client";

interface Props {
  intakeData: Record<string, unknown>;
  onUpdate: (data: Record<string, unknown>) => void;
  isVendor: boolean;
}

export default function MoodboardUploader({ intakeData, onUpdate, isVendor }: Props) {
  const moodboardUrl = intakeData?.moodboardUrl as string | undefined;
  const moodboardNotes = intakeData?.moodboardNotes as string | undefined;

  if (!isVendor && !moodboardUrl && !moodboardNotes) return null;

  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <h3 className="text-sm font-semibold" style={{ color: "var(--muted)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Moodboard & Stijl</h3>

      {moodboardUrl && (
        <a href={moodboardUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem", color: "var(--primary)", marginBottom: "0.75rem" }}>
          🎨 Moodboard bekijken
        </a>
      )}

      {moodboardNotes && (
        <p style={{ fontSize: "0.875rem", color: "var(--charcoal)", lineHeight: 1.6, background: "var(--blush-soft)", padding: "0.75rem", borderRadius: "0.5rem" }}>
          {moodboardNotes}
        </p>
      )}

      {isVendor && !moodboardUrl && !moodboardNotes && (
        <p style={{ fontSize: "0.875rem", color: "var(--muted)", fontStyle: "italic" }}>Nog geen moodboard gedeeld.</p>
      )}
    </div>
  );
}
