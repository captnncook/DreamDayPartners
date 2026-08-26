"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Lock, Heart, Handshake, MessageCircle } from "lucide-react";
import { useLang } from "@/components/LangProvider";

type Message = {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string; role: string };
};

type Thread = {
  id: string;
  type: string;
  vendorId?: string;
  subject?: string;
  createdAt: string;
  messages: Message[];
};

interface Props {
  weddingId: string;
  weddingTitle: string;
  threads: Thread[];
  currentUser: { id: string; name: string; role: string };
  linkedVendors?: { id: string; name: string }[];
}

const THREAD_ICONS: Record<string, React.ElementType> = { internal: Lock, couple: Heart, vendor: Handshake };

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

export default function MessagesClient({ weddingId, weddingTitle, threads: initial, currentUser, linkedVendors = [] }: Props) {
  const { t } = useLang();
  const tm = t.messages;
  const THREAD_LABELS: Record<string, string> = { internal: tm.typeInternal, couple: tm.typeCouple, vendor: tm.typeVendor };
  const [threads, setThreads] = useState<Thread[]>(initial);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(initial[0]?.id ?? null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showNewThread, setShowNewThread] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newType, setNewType] = useState("internal");
  const [newVendorId, setNewVendorId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeThread = threads.find((t) => t.id === activeThreadId);

  function threadLabel(t: Thread) {
    if (t.subject) return t.subject;
    if (t.type === "vendor" && t.vendorId) {
      const v = linkedVendors.find((lv) => lv.id === t.vendorId);
      if (v) return v.name;
    }
    return THREAD_LABELS[t.type];
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages.length]);

  async function createThread(e: React.FormEvent) {
    e.preventDefault();
    if (newType === "vendor" && !newVendorId) return;
    const res = await fetch(`/api/weddings/${weddingId}/messages/threads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: newType, subject: newSubject, vendorId: newType === "vendor" ? newVendorId : undefined }),
    });
    const data = await res.json();
    if (data.thread) {
      setThreads((prev) => [data.thread, ...prev]);
      setActiveThreadId(data.thread.id);
    }
    setNewSubject("");
    setNewVendorId("");
    setShowNewThread(false);
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || !activeThreadId) return;
    setSending(true);

    const res = await fetch(`/api/weddings/${weddingId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId: activeThreadId, content: message }),
    });
    const data = await res.json();

    if (data.message) {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === activeThreadId ? { ...t, messages: [...t.messages, data.message] } : t
        )
      );
      setMessage("");
    }
    setSending(false);
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="px-8 py-5 border-b flex items-center gap-4" style={{ borderColor: "var(--border)", background: "white" }}>
        <Link href={`/weddings/${weddingId}`} className="text-sm" style={{ color: "var(--muted)" }}>{tm.back}</Link>
        <h1 className="font-bold text-lg">{tm.title}: {weddingTitle}</h1>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="w-64 border-r flex-shrink-0 overflow-y-auto" style={{ borderColor: "var(--border)", background: "white" }}>
          <div className="p-4 space-y-1">
            <button
              onClick={() => setShowNewThread(!showNewThread)}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium mb-2 transition-colors"
              style={{ background: "var(--primary)", color: "white" }}
            >
              {tm.newThread}
            </button>
            {showNewThread && (
              <form onSubmit={createThread} className="mb-3 space-y-2">
                <input
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder={tm.subject}
                  className="w-full border rounded-lg px-2 py-1.5 text-xs"
                  style={{ borderColor: "var(--border)" }}
                />
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full border rounded-lg px-2 py-1.5 text-xs"
                  style={{ borderColor: "var(--border)" }}
                >
                  <option value="internal">{tm.typeInternal}</option>
                  <option value="couple">{tm.typeCouple}</option>
                  <option value="vendor">{tm.typeVendor}</option>
                </select>
                {newType === "vendor" && (
                  linkedVendors.length > 0 ? (
                    <select
                      required
                      value={newVendorId}
                      onChange={(e) => setNewVendorId(e.target.value)}
                      className="w-full border rounded-lg px-2 py-1.5 text-xs"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <option value="">{tm.chooseVendorPlaceholder}</option>
                      {linkedVendors.map((v) => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-xs" style={{ color: "var(--muted)" }}>{tm.noVendorsLinked}</p>
                  )
                )}
                <button type="submit" disabled={newType === "vendor" && !newVendorId} className="w-full text-xs py-1.5 rounded-lg" style={{ background: "var(--accent)", color: "var(--primary)" }}>
                  {tm.createBtn}
                </button>
              </form>
            )}
            {threads.length === 0 && (
              <p className="text-xs text-center pt-4" style={{ color: "var(--muted)" }}>{tm.noThreads}</p>
            )}
            {threads.map((thread) => {
              const lastMsg = thread.messages[thread.messages.length - 1];
              const active = activeThreadId === thread.id;
              return (
                <button key={thread.id} onClick={() => setActiveThreadId(thread.id)}
                  className="w-full text-left px-3 py-3 rounded-lg transition-colors"
                  style={{ background: active ? "var(--accent)" : "transparent" }}>
                  <div className="flex items-center gap-2 mb-1">
                    {(() => { const Icon = THREAD_ICONS[thread.type] ?? MessageCircle; return <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--muted)" }} />; })()}
                    <span className="text-xs font-semibold">{threadLabel(thread)}</span>
                  </div>
                  {lastMsg && (
                    <>
                      <div className="text-xs truncate" style={{ color: "var(--muted)" }}>{lastMsg.content}</div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--muted)", fontSize: "0.65rem" }}>{formatTime(lastMsg.createdAt)}</div>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          {!activeThread ? (
            <div className="flex-1 flex items-center justify-center" style={{ color: "var(--muted)" }}>
              <div className="text-center">
                <div className="flex justify-center mb-3"><MessageCircle className="w-10 h-10" style={{ color: "var(--accent-dark)" }} /></div>
                <p>{tm.selectThread}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 border-b" style={{ borderColor: "var(--border)", background: "white" }}>
                <div className="flex items-center gap-2">
                  {(() => { const Icon = THREAD_ICONS[activeThread.type] ?? MessageCircle; return <Icon className="w-4 h-4 flex-shrink-0" style={{ color: "var(--muted)" }} />; })()}
                  <div>
                    <div className="font-medium text-sm">{threadLabel(activeThread)}</div>
                    <div className="text-xs" style={{ color: "var(--muted)" }}>{activeThread.messages.length} {tm.messagesCountSuffix}</div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4" style={{ background: "var(--background)" }}>
                {activeThread.messages.length === 0 && (
                  <div className="text-center py-8" style={{ color: "var(--muted)" }}>
                    <p className="text-sm">{tm.noMessagesStartFirst}</p>
                  </div>
                )}
                {activeThread.messages.map((msg) => {
                  const isOwn = msg.sender.id === currentUser.id;
                  return (
                    <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                      {!isOwn && (
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 self-end"
                          style={{ background: "var(--primary)" }}>
                          {msg.sender.name.charAt(0)}
                        </div>
                      )}
                      <div style={{ maxWidth: "70%" }}>
                        {!isOwn && (
                          <div className="text-xs mb-1 ml-1" style={{ color: "var(--muted)" }}>{msg.sender.name}</div>
                        )}
                        <div className="px-4 py-2.5 rounded-2xl text-sm" style={{
                          background: isOwn ? "var(--primary)" : "white",
                          color: isOwn ? "white" : "var(--foreground)",
                          border: isOwn ? "none" : "1px solid var(--border)",
                          borderBottomRightRadius: isOwn ? "4px" : undefined,
                          borderBottomLeftRadius: !isOwn ? "4px" : undefined,
                        }}>
                          {msg.content}
                        </div>
                        <div className="text-xs mt-1 px-1" style={{ color: "var(--muted)", textAlign: isOwn ? "right" : "left", fontSize: "0.65rem" }}>
                          {formatTime(msg.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={sendMessage} className="px-6 py-4 border-t flex gap-3" style={{ borderColor: "var(--border)", background: "white" }}>
                <input value={message} onChange={(e) => setMessage(e.target.value)}
                  placeholder={tm.sendPlaceholder}
                  className="flex-1 border rounded-full px-4 py-2.5 text-sm focus:outline-none"
                  style={{ borderColor: "var(--border)" }} />
                <button type="submit" disabled={sending || !message.trim()} className="ddp-btn-primary px-5 rounded-full">
                  {sending ? tm.sendingBtn : tm.send}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
