"use client";

import Link from "next/link";
import { useLang } from "@/components/LangProvider";

type Thread = {
  id: string;
  type: string;
  subject: string | null;
  weddingId: string | null;
  wedding: { title: string } | null;
  messages: { content: string; createdAt: string; sender: { name: string } }[];
};

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

export default function AllMessagesClient({ threads }: { threads: Thread[] }) {
  const { t } = useLang();
  const tm = t.messages;
  const THREAD_LABELS: Record<string, string> = { internal: tm.typeInternal, couple: tm.typeCouple, vendor: tm.typeVendor };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif" style={{ fontSize: "var(--text-6xl)", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--foreground)" }}>{tm.allMessagesTitle}</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{threads.length} {threads.length !== 1 ? tm.conversationPlural : tm.conversationSingular}</p>
      </div>

      {threads.length === 0 ? (
        <p className="text-sm py-16 text-center" style={{ color: "var(--muted)", borderTop: "1px solid var(--border)" }}>
          {tm.noMessagesYet}
        </p>
      ) : (
        <div style={{ borderTop: "1px solid var(--border)" }}>
          {threads.map((thread) => {
            const lastMsg = thread.messages[0];
            return (
              <Link key={thread.id} href={`/weddings/${thread.weddingId}/messages`} className="dash-row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-sm" style={{ fontWeight: 600, color: "var(--foreground)" }}>
                      {thread.subject ?? THREAD_LABELS[thread.type] ?? thread.type}
                    </span>
                    <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted-light)" }}>
                      {THREAD_LABELS[thread.type] ?? thread.type}
                    </span>
                    {thread.wedding && (
                      <span className="font-serif text-xs" style={{ fontWeight: 700, color: "var(--muted)" }}>{thread.wedding.title}</span>
                    )}
                  </div>
                  {lastMsg && (
                    <p className="text-xs truncate mt-0.5" style={{ color: "var(--muted)" }}>
                      <span style={{ fontWeight: 600 }}>{lastMsg.sender.name}:</span> {lastMsg.content}
                    </p>
                  )}
                </div>
                {lastMsg && <span className="text-xs flex-shrink-0" style={{ color: "var(--muted-light)" }}>{formatTime(lastMsg.createdAt)}</span>}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
