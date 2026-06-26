"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageCircle, Pencil, Search, X } from "lucide-react";

type Conv = {
  id: string;
  updatedAt: string;
  participants: { userId: string; user: { id: string; name: string; role: string } }[];
  messages: { content: string; createdAt: string; sender: { id: string; name: string } }[];
};

type Recipient = { userId: string; name: string; role: string; category?: string };

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Zojuist";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}u`;
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short" }).format(new Date(iso));
}

export default function DmListPage() {
  const router = useRouter();
  const [convs, setConvs] = useState<Conv[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Recipient[]>([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/dm/conversations").then(r => r.json()),
      fetch("/api/auth/me").then(r => r.json()),
    ]).then(([convData, meData]) => {
      setConvs(convData.conversations ?? []);
      setCurrentUserId(meData.user?.id ?? "");
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (composing) setTimeout(() => searchRef.current?.focus(), 50);
  }, [composing]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const res = await fetch(`/api/dm/search-recipients?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.recipients ?? []);
      setSearching(false);
    }, 250);
  }, [query]);

  async function startConversation(userId: string) {
    setCreating(true);
    const res = await fetch("/api/dm/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otherUserId: userId }),
    });
    const data = await res.json();
    if (data.conversation?.id) {
      router.push(`/dm/${data.conversation.id}`);
    }
    setCreating(false);
  }

  return (
    <div style={{ padding: "1.5rem", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <h1 style={{ fontWeight: 700, fontSize: "1.25rem", letterSpacing: "-0.02em" }}>Berichten</h1>
        <button
          onClick={() => { setComposing(true); setQuery(""); setResults([]); }}
          style={{
            display: "flex", alignItems: "center", gap: "0.375rem",
            padding: "0.5rem 1rem", borderRadius: "9999px",
            background: "var(--primary)", color: "white",
            border: "none", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600,
          }}
        >
          <Pencil className="w-3.5 h-3.5" />
          Nieuw bericht
        </button>
      </div>

      {/* Compose modal */}
      {composing && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 50,
          display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "5rem 1rem",
        }}>
          <div style={{
            background: "white", borderRadius: "16px", width: "100%", maxWidth: "480px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)", overflow: "hidden",
          }}>
            <div style={{ padding: "1.25rem 1.25rem 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, fontSize: "1rem" }}>Nieuw bericht</span>
              <button onClick={() => setComposing(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex" }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--muted)", flexShrink: 0 }}>Aan:</span>
              <div style={{ position: "relative", flex: 1 }}>
                <Search className="w-4 h-4" style={{ position: "absolute", left: "0.625rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Zoek op naam of bedrijf…"
                  style={{
                    width: "100%", paddingLeft: "2rem", paddingRight: "0.75rem",
                    paddingTop: "0.5rem", paddingBottom: "0.5rem",
                    border: "1px solid var(--border)", borderRadius: "8px",
                    fontSize: "0.875rem", outline: "none", background: "var(--accent)",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div style={{ maxHeight: "320px", overflowY: "auto" }}>
              {searching ? (
                <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--muted)", fontSize: "0.875rem" }}>Zoeken…</div>
              ) : results.length === 0 && query.trim() ? (
                <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--muted)", fontSize: "0.875rem" }}>Geen resultaten voor &ldquo;{query}&rdquo;</div>
              ) : results.length === 0 ? (
                <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--muted)", fontSize: "0.875rem" }}>
                  Begin te typen om leveranciers of planners te zoeken
                </div>
              ) : (
                results.map(r => (
                  <button
                    key={r.userId}
                    onClick={() => !creating && startConversation(r.userId)}
                    disabled={creating}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: "0.75rem",
                      padding: "0.875rem 1.25rem", border: "none", background: "none",
                      cursor: "pointer", textAlign: "left", borderBottom: "1px solid var(--border)",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "var(--accent)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "none")}
                  >
                    <div style={{
                      width: "2.5rem", height: "2.5rem", borderRadius: "50%",
                      background: "var(--blush-soft)", display: "flex", alignItems: "center",
                      justifyContent: "center", fontWeight: 700, fontSize: "0.9375rem",
                      color: "var(--primary)", flexShrink: 0,
                    }}>
                      {r.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--charcoal)" }}>{r.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "capitalize" }}>
                        {r.category ?? r.role}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted)", fontSize: "0.875rem" }}>Laden…</div>
      ) : convs.length === 0 ? (
        <div className="ddp-card" style={{ textAlign: "center", padding: "3rem 1.5rem", color: "var(--muted)" }}>
          <MessageCircle className="w-8 h-8" style={{ margin: "0 auto 0.75rem", color: "var(--border)" }} />
          <p style={{ fontSize: "0.9375rem" }}>Nog geen gesprekken</p>
          <p style={{ fontSize: "0.8125rem", marginTop: "0.375rem" }}>Stuur een bericht via de knop rechtsboven</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.5rem" }}>
          {convs.map((conv) => {
            const other = conv.participants.find(p => p.userId !== currentUserId)?.user;
            const lastMsg = conv.messages[0];
            return (
              <Link key={conv.id} href={`/dm/${conv.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="ddp-card" style={{ display: "flex", alignItems: "center", gap: "0.875rem", padding: "0.875rem 1rem" }}>
                  <div style={{
                    width: "2.75rem", height: "2.75rem", borderRadius: "50%",
                    background: "var(--blush-soft)", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "1rem", fontWeight: 700,
                    color: "var(--primary)", flexShrink: 0,
                  }}>
                    {other?.name?.charAt(0) ?? "?"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{other?.name ?? "Onbekend"}</div>
                    {lastMsg && (
                      <div style={{ fontSize: "0.8125rem", color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {lastMsg.sender.id === currentUserId ? "Jij: " : ""}{lastMsg.content}
                      </div>
                    )}
                  </div>
                  {lastMsg && (
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)", flexShrink: 0 }}>
                      {timeAgo(lastMsg.createdAt)}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
