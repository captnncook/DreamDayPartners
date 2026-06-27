import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "3rem", textDecoration: "none" }}>
        <Image src="/logo.png" alt="DreamDay Partners" width={28} height={28} />
        <span style={{ fontWeight: 700, fontSize: "0.9rem", letterSpacing: "-0.03em", color: "var(--foreground)" }}>
          DreamDay<span style={{ color: "var(--primary)" }}> Partners</span>
        </span>
      </Link>

      <div style={{ fontSize: "6rem", fontWeight: 700, letterSpacing: "-0.06em", color: "var(--foreground)", lineHeight: 1, marginBottom: "1rem" }}>
        404
      </div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.03em", marginBottom: "0.75rem" }}>
        Deze pagina bestaat niet
      </h1>
      <p style={{ fontSize: "1rem", color: "var(--muted)", lineHeight: 1.65, maxWidth: "360px", marginBottom: "2.5rem" }}>
        De pagina die je zoekt is verplaatst of bestaat niet meer.
      </p>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/" className="ddp-btn-primary" style={{ padding: "0.75rem 1.75rem", fontSize: "0.9375rem" }}>
          Terug naar home
        </Link>
        <Link href="/leveranciers" className="ddp-btn-secondary" style={{ padding: "0.75rem 1.75rem", fontSize: "0.9375rem" }}>
          Vind leveranciers
        </Link>
      </div>
    </div>
  );
}
