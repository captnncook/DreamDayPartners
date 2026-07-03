import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(150deg, var(--ink) 0%, var(--ink-mid) 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "3rem", textDecoration: "none" }}>
        <Image src="/images/logo-wit.svg" alt="DreamDay Platform" width={28} height={28} />
        <span style={{ fontWeight: 700, fontSize: "0.9rem", letterSpacing: "-0.02em", color: "var(--ink-text)" }}>
          DreamDay<span className="font-serif" style={{ color: "var(--gold)" }}> Platform</span>
        </span>
      </Link>

      <div className="font-serif" style={{ fontSize: "6rem", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--gold)", lineHeight: 1, marginBottom: "1rem" }}>
        404
      </div>
      <h1 className="font-serif" style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--ink-text)", letterSpacing: "-0.01em", marginBottom: "0.75rem" }}>
        Deze pagina bestaat niet
      </h1>
      <p style={{ fontSize: "1rem", color: "var(--ink-muted)", lineHeight: 1.65, maxWidth: "360px", marginBottom: "2.5rem" }}>
        De pagina die je zoekt is verplaatst of bestaat niet meer.
      </p>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
        <Link
          href="/"
          className="ddp-btn-gold"
          style={{ background: "var(--gold)", color: "var(--ink)", fontWeight: 700, padding: "0.75rem 1.75rem", fontSize: "0.9375rem", borderRadius: "var(--radius-full)", textDecoration: "none", display: "inline-block" }}
        >
          Terug naar home
        </Link>
        <Link
          href="/leveranciers"
          className="ddp-btn-outline-ink"
          style={{ background: "transparent", border: "1px solid var(--ink-line)", color: "var(--ink-text)", fontWeight: 600, padding: "0.75rem 1.75rem", fontSize: "0.9375rem", borderRadius: "var(--radius-full)", textDecoration: "none" }}
        >
          Vind leveranciers
        </Link>
      </div>
    </div>
  );
}
