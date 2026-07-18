"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, Pencil, Search, X, ArrowLeft, Send, Check, Calendar } from "lucide-react";

type Conv = {
  id: string;
  updatedAt: string;
  participants: { userId: string; user: { id: string; name: string; role: string } }[];
  messages: { content: string; createdAt: string; sender: { id: string; name: string } }[];
};

type DmMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string; avatar?: string | null };
};

type Recipient = { userId: string; name: string; role: string; category?: string };

type VendorRequestItem = {
  id: string;
  wedding: { id: string; title: string; date: string; venue?: string | null };
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}

function RequestsPanel() {
  const [requests, setRequests] = useState<VendorRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/vendor/requests")
      .then(r => r.ok ? r.json() : { requests: [] })
      .then(d => setRequests(d.requests ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function respond(id: string, action: "accept" | "decline") {
    setBusyId(id);
    const res = await fetch(`/api/vendor/requests/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) setRequests(prev => prev.filter(r => r.id !== id));
    setBusyId(null);
  }

  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center", color: "var(--muted)", fontSize: "0.875rem" }}>Laden…</div>;
  }

  if (requests.length === 0) {
    return (
      <div style={{ padding: "3rem 1.5rem", textAlign: "center", color: "var(--muted)" }}>
        <Calendar className="w-8 h-8" style={{ margin: "0 auto 0.75rem", color: "var(--border)" }} />
        <p style={{ fontSize: "0.875rem" }}>Geen openstaande verzoeken</p>
        <p style={{ fontSize: "0.8125rem", marginTop: "0.25rem" }}>Nieuwe Dream Team-uitnodigingen verschijnen hier.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.875rem", maxWidth: "560px", margin: "0 auto", width: "100%" }}>
      {requests.map(r => {
        const busy = busyId === r.id;
        return (
          <div key={r.id} style={{ borderLeft: "3px solid var(--gold)", background: "var(--sand)", borderRadius: "0 var(--radius-md) var(--radius-md) 0", padding: "1rem 1.25rem" }}>
            <div className="font-serif" style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--foreground)" }}>{r.wedding.title}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "2px" }}>
              {r.wedding.venue ? `${r.wedding.venue} · ` : ""}{formatDate(r.wedding.date)}
            </div>
            <p style={{ fontSize: "0.8125rem", color: "var(--muted)", margin: "0.625rem 0" }}>
              Je bent uitgenodigd voor het Dream Team van deze bruiloft.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => respond(r.id, "accept")}
                disabled={busy}
                className="ddp-btn-primary"
                style={{ fontSize: "0.8125rem", padding: "0.4rem 1rem" }}
              >
                <Check className="w-3.5 h-3.5" /> {busy ? "Bezig…" : "Accepteren"}
              </button>
              <button
                onClick={() => respond(r.id, "decline")}
                disabled={busy}
                className="ddp-btn-ghost"
                style={{ fontSize: "0.8125rem", padding: "0.4rem 0.875rem" }}
              >
                <X className="w-3.5 h-3.5" /> Afwijzen
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Zojuist";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}u`;
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short" }).format(new Date(iso));
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  if (isToday) return d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(d);
}

function ChatPanel({ conversationId, currentUserId, otherUser, onBack }: { conversationId: string; currentUserId: string; otherUser: { id: string; name: string; role: string }; onBack: () => void }) {
  const [messages, setMessages] = useState<DmMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastCreatedAt = useRef<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    lastCreatedAt.current = null;
    fetch(`/api/dm/conversations/${conversationId}/messages`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.messages) {
          setMessages(d.messages);
          lastCreatedAt.current = d.messages.length > 0 ? d.messages[d.messages.length - 1].createdAt : null;
        }
        setLoading(false);
      });
    fetch(`/api/dm/conversations/${conversationId}/read`, { method: "POST" }).catch(() => {});
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const poll = async () => {
      try {
        const url = lastCreatedAt.current
          ? `/api/dm/conversations/${conversationId}/messages?since=${encodeURIComponent(lastCreatedAt.current)}`
          : `/api/dm/conversations/${conversationId}/messages`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        if (data.messages?.length > 0) {
          setMessages(prev => [...prev, ...data.messages]);
          lastCreatedAt.current = data.messages[data.messages.length - 1].createdAt;
        }
      } catch { /* ignore */ }
    };
    const interval = setInterval(poll, 2500);
    return () => clearInterval(interval);
  }, [conversationId]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput("");
    const optimisticTime = new Date().toISOString();
    const optimistic: DmMessage = {
      id: `tmp-${Date.now()}`, conversationId, senderId: currentUserId,
      content: text, createdAt: optimisticTime, sender: { id: currentUserId, name: "Jij" },
    };
    lastCreatedAt.current = optimisticTime;
    setMessages(prev => [...prev, optimistic]);
    try {
      const res = await fetch(`/api/dm/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      if (res.ok) {
        const { message } = await res.json();
        setMessages(prev => prev.map(m => m.id === optimistic.id ? message : m));
        lastCreatedAt.current = message.createdAt;
      }
    } catch { /* ignore */ }
    setSending(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)", background: "white", display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
        <button
          onClick={onBack}
          className="ddp-dm-back-btn"
          style={{ background: "none", border: "none", cursor: "pointer", padding: "0.25rem", margin: "-0.25rem 0 -0.25rem -0.25rem", color: "var(--muted)" }}
          aria-label="Terug naar gesprekken"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "50%", background: "var(--color-blush-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9375rem", fontWeight: 700, color: "var(--primary)", flexShrink: 0 }}>
          {otherUser.name.charAt(0)}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: "0.9375rem" }}>{otherUser.name}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "capitalize" }}>{otherUser.role}</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem", background: "var(--background)" }}>
        {loading && <div style={{ textAlign: "center", color: "var(--muted)", marginTop: "2rem", fontSize: "0.875rem" }}>Laden…</div>}
        {!loading && messages.length === 0 && (
          <div style={{ textAlign: "center", color: "var(--muted)", fontSize: "0.875rem", marginTop: "3rem" }}>Stuur een bericht om het gesprek te starten.</div>
        )}
        {messages.map((msg, i) => {
          const isMine = msg.senderId === currentUserId;
          const prevMsg = messages[i - 1];
          const showTime = !prevMsg || new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() > 5 * 60 * 1000;
          return (
            <div key={msg.id}>
              {showTime && <div style={{ textAlign: "center", fontSize: "0.6875rem", color: "var(--muted)", margin: "0.5rem 0" }}>{formatTime(msg.createdAt)}</div>}
              <div style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "72%", padding: "0.625rem 0.875rem",
                  borderRadius: isMine ? "1.25rem 1.25rem 0.25rem 1.25rem" : "1.25rem 1.25rem 1.25rem 0.25rem",
                  background: isMine ? "var(--primary)" : "white",
                  color: isMine ? "white" : "var(--foreground)",
                  fontSize: "0.9375rem", lineHeight: 1.4, wordBreak: "break-word",
                  border: isMine ? "none" : "1px solid var(--border)",
                }}>
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div style={{ padding: "0.75rem 1rem", borderTop: "1px solid var(--border)", background: "white", display: "flex", gap: "0.625rem", alignItems: "flex-end", flexShrink: 0 }}>
        <textarea
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Bericht…" rows={1}
          style={{ flex: 1, padding: "0.625rem 0.875rem", borderRadius: "1.25rem", border: "1px solid var(--border)", fontSize: "0.9375rem", resize: "none", background: "var(--accent)", color: "var(--foreground)", outline: "none", lineHeight: 1.4, maxHeight: "120px", overflowY: "auto" }}
          onInput={e => { const el = e.currentTarget; el.style.height = "auto"; el.style.height = `${el.scrollHeight}px`; }}
        />
        <button onClick={send} disabled={!input.trim() || sending} style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", background: input.trim() ? "var(--primary)" : "var(--border)", border: "none", cursor: input.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s", flexShrink: 0 }}>
          <Send className="w-4 h-4" style={{ color: "white" }} />
        </button>
      </div>
    </div>
  );
}

export default function DmPage() {
  const [convs, setConvs] = useState<Conv[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [role, setRole] = useState("");
  const [tab, setTab] = useState<"gesprekken" | "verzoeken">("gesprekken");
  const [loading, setLoading] = useState(true);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Recipient[]>([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 5000);
    Promise.all([
      fetch("/api/dm/conversations").then(r => r.json()),
      fetch("/api/auth/me").then(r => r.json()),
    ]).then(([convData, meData]) => {
      clearTimeout(timeout);
      const list = convData.conversations ?? [];
      setConvs(list);
      setRole(meData.user?.role ?? "");
      setCurrentUserId(meData.user?.id ?? "");
      if (list.length > 0) setActiveConvId(list[0].id);
      setLoading(false);
    }).catch(() => { clearTimeout(timeout); setLoading(false); });
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
      setConvs(prev => prev.some(c => c.id === data.conversation.id) ? prev : [data.conversation, ...prev]);
      setActiveConvId(data.conversation.id);
      setComposing(false);
    }
    setCreating(false);
  }

  const activeConv = convs.find(c => c.id === activeConvId);
  const otherUser = activeConv?.participants.find(p => p.userId !== currentUserId)?.user;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 60px)", overflow: "hidden" }}>
      {role === "vendor" && (
        <div style={{ display: "flex", gap: "1.5rem", padding: "0.75rem 1.25rem 0", borderBottom: "1px solid var(--border)", background: "white", flexShrink: 0 }}>
          {([["gesprekken", "Gesprekken"], ["verzoeken", "Verzoeken"]] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "0 0 0.75rem", fontSize: "0.875rem",
                fontWeight: tab === key ? 700 : 500,
                color: tab === key ? "var(--foreground)" : "var(--muted)",
                borderBottom: tab === key ? "2px solid var(--gold)" : "2px solid transparent",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {tab === "verzoeken" && role === "vendor" ? (
        <div style={{ flex: 1, overflowY: "auto" }}>
          <RequestsPanel />
        </div>
      ) : (
      <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>
      {/* Left: conversation list — op mobiel verborgen zodra een gesprek open staat */}
      <div className={activeConvId ? "ddp-dm-list-hidden-mobile" : undefined} style={{ width: "280px", flexShrink: 0, borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", background: "white" }}>
        <div style={{ padding: "1rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 700, fontSize: "1rem" }}>Berichten</span>
          <button onClick={() => { setComposing(true); setQuery(""); setResults([]); }}
            style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.375rem 0.75rem", borderRadius: "9999px", background: "var(--primary)", color: "white", border: "none", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 }}>
            <Pencil className="w-3 h-3" /> Nieuw bericht
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading && <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--muted)", fontSize: "0.875rem" }}>Laden…</div>}
          {!loading && convs.length === 0 && (
            <div style={{ padding: "2rem 1rem", textAlign: "center", color: "var(--muted)" }}>
              <MessageCircle className="w-6 h-6" style={{ margin: "0 auto 0.5rem", color: "var(--border)" }} />
              <p style={{ fontSize: "0.8125rem" }}>Nog geen gesprekken</p>
            </div>
          )}
          {convs.map(conv => {
            const other = conv.participants.find(p => p.userId !== currentUserId)?.user;
            const lastMsg = conv.messages[0];
            const isActive = conv.id === activeConvId;
            return (
              <button key={conv.id} onClick={() => setActiveConvId(conv.id)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.875rem 1rem", border: "none", textAlign: "left", cursor: "pointer", background: isActive ? "var(--color-blush-soft)" : "transparent", borderLeft: isActive ? "3px solid var(--primary)" : "3px solid transparent", transition: "background 0.1s" }}>
                <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", fontWeight: 700, color: "var(--ink)", flexShrink: 0 }}>
                  {other?.name?.charAt(0) ?? "?"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{other?.name ?? "Onbekend"}</div>
                  {lastMsg && <div style={{ fontSize: "0.75rem", color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lastMsg.sender.id === currentUserId ? "Jij: " : ""}{lastMsg.content}</div>}
                </div>
                {lastMsg && <div style={{ fontSize: "0.6875rem", color: "var(--muted)", flexShrink: 0 }}>{timeAgo(lastMsg.createdAt)}</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: chat panel — op mobiel alleen zichtbaar als er een gesprek open staat */}
      <div className={!activeConvId ? "ddp-dm-chat-hidden-mobile" : undefined} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {!activeConvId || !otherUser ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
            <div style={{ textAlign: "center" }}>
              <MessageCircle className="w-10 h-10" style={{ margin: "0 auto 0.75rem", color: "var(--border)" }} />
              <p style={{ fontSize: "0.9375rem" }}>Selecteer een gesprek</p>
              <p style={{ fontSize: "0.8125rem", marginTop: "0.375rem" }}>of start een nieuw gesprek</p>
            </div>
          </div>
        ) : (
          <ChatPanel conversationId={activeConvId} currentUserId={currentUserId} otherUser={otherUser} onBack={() => setActiveConvId(null)} />
        )}
      </div>
      </div>
      )}

      {/* Compose modal */}
      {composing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 50, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "5rem 1rem" }}>
          <div style={{ background: "white", borderRadius: "16px", width: "100%", maxWidth: "480px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", overflow: "hidden" }}>
            <div style={{ padding: "1.25rem 1.25rem 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, fontSize: "1rem" }}>Nieuw bericht</span>
              <button onClick={() => setComposing(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex" }}><X className="w-5 h-5" /></button>
            </div>
            <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--muted)", flexShrink: 0 }}>Aan:</span>
              <div style={{ position: "relative", flex: 1 }}>
                <Search className="w-4 h-4" style={{ position: "absolute", left: "0.625rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted)", pointerEvents: "none" }} />
                <input ref={searchRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Zoek op naam of bedrijf…"
                  style={{ width: "100%", paddingLeft: "2rem", paddingRight: "0.75rem", paddingTop: "0.5rem", paddingBottom: "0.5rem", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "0.875rem", outline: "none", background: "var(--accent)", boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ maxHeight: "320px", overflowY: "auto" }}>
              {searching ? <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--muted)", fontSize: "0.875rem" }}>Zoeken…</div>
                : results.length === 0 && query.trim() ? <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--muted)", fontSize: "0.875rem" }}>Geen resultaten</div>
                : results.length === 0 ? <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--muted)", fontSize: "0.875rem" }}>Begin te typen om te zoeken</div>
                : results.map(r => (
                  <button key={r.userId} onClick={() => !creating && startConversation(r.userId)} disabled={creating}
                    className="ddp-dm-result-row"
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.875rem 1.25rem", border: "none", background: "none", cursor: "pointer", textAlign: "left", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", background: "var(--color-blush-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.9375rem", color: "var(--primary)", flexShrink: 0 }}>{r.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--charcoal)" }}>{r.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "capitalize" }}>{r.category ?? r.role}</div>
                    </div>
                  </button>
                ))
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
