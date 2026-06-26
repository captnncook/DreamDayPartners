"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";

interface DmMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string; avatar?: string | null };
}

interface Props {
  conversationId: string;
  currentUserId: string;
  otherUser: { id: string; name: string; role: string };
  initialMessages: DmMessage[];
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  if (isToday) return d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(d);
}

export default function DmChat({ conversationId, currentUserId, otherUser, initialMessages }: Props) {
  const [messages, setMessages] = useState<DmMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastCreatedAt = useRef<string | null>(
    initialMessages.length > 0 ? initialMessages[initialMessages.length - 1].createdAt : null
  );

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // Mark conversation as read on mount and when new messages arrive
  useEffect(() => {
    fetch(`/api/dm/conversations/${conversationId}/read`, { method: "POST" }).catch(() => {});
  }, [conversationId, messages.length]);

  // Poll for new messages every 2.5s
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
      } catch {}
    };

    const interval = setInterval(poll, 2500);
    return () => clearInterval(interval);
  }, [conversationId]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setInput("");

    const optimistic: DmMessage = {
      id: `tmp-${Date.now()}`,
      conversationId,
      senderId: currentUserId,
      content: text,
      createdAt: new Date().toISOString(),
      sender: { id: currentUserId, name: "Jij" },
    };
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
    } catch {}
    setSending(false);
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", maxWidth: "600px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: "0.875rem",
        padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)",
        background: "var(--card)", position: "sticky", top: 0, zIndex: 10,
      }}>
        <Link href="/dm" style={{ color: "var(--muted)", display: "flex", alignItems: "center" }}>
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div style={{
          width: "2.25rem", height: "2.25rem", borderRadius: "50%",
          background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.9375rem", fontWeight: 700, color: "var(--primary)",
        }}>
          {otherUser.name.charAt(0)}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: "0.9375rem", letterSpacing: "-0.01em" }}>{otherUser.name}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", textTransform: "capitalize" }}>{otherUser.role}</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "var(--muted)", fontSize: "0.875rem", marginTop: "3rem" }}>
            Stuur een bericht om het gesprek te starten.
          </div>
        )}
        {messages.map((msg, i) => {
          const isMine = msg.senderId === currentUserId;
          const prevMsg = messages[i - 1];
          const showTime = !prevMsg || new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() > 5 * 60 * 1000;

          return (
            <div key={msg.id}>
              {showTime && (
                <div style={{ textAlign: "center", fontSize: "0.6875rem", color: "var(--muted)", margin: "0.5rem 0" }}>
                  {formatTime(msg.createdAt)}
                </div>
              )}
              <div style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "72%", padding: "0.625rem 0.875rem",
                  borderRadius: isMine ? "1.25rem 1.25rem 0.25rem 1.25rem" : "1.25rem 1.25rem 1.25rem 0.25rem",
                  background: isMine ? "var(--primary)" : "var(--accent)",
                  color: isMine ? "white" : "var(--foreground)",
                  fontSize: "0.9375rem", lineHeight: 1.4,
                  wordBreak: "break-word",
                }}>
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "0.75rem 1rem", borderTop: "1px solid var(--border)",
        background: "var(--card)", display: "flex", gap: "0.625rem", alignItems: "flex-end",
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="Bericht..."
          rows={1}
          style={{
            flex: 1, padding: "0.625rem 0.875rem", borderRadius: "1.25rem",
            border: "1px solid var(--border)", fontSize: "0.9375rem",
            resize: "none", background: "var(--accent)", color: "var(--foreground)",
            outline: "none", lineHeight: 1.4, maxHeight: "120px", overflowY: "auto",
          }}
          onInput={e => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = `${el.scrollHeight}px`;
          }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || sending}
          style={{
            width: "2.5rem", height: "2.5rem", borderRadius: "50%",
            background: input.trim() ? "var(--primary)" : "var(--border)",
            border: "none", cursor: input.trim() ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.15s", flexShrink: 0,
          }}
        >
          <Send className="w-4 h-4" style={{ color: "white" }} />
        </button>
      </div>
    </div>
  );
}
