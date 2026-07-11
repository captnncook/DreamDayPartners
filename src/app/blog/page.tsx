import type { Metadata } from "next";
import Link from "next/link";
import PublicPageShell from "@/components/PublicPageShell";
import { BLOG_POSTS } from "@/lib/blogPosts";

export const metadata: Metadata = {
  title: "Blog",
  description: "Praktische artikelen over bruiloften plannen: draaiboeken, budgetten, leveranciers kiezen en de lessen van honderden trouwdagen.",
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}

export default function BlogPage() {
  return (
    <PublicPageShell
      title="Blog"
      intro="Praktische artikelen over bruiloften plannen, geschreven vanuit wat er op echte trouwdagen goed en fout gaat."
    >
      <div style={{ borderTop: "1px solid var(--border)" }}>
        {BLOG_POSTS.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="dash-row" style={{ padding: "1.375rem 0.25rem", alignItems: "flex-start" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="ddp-section-label" style={{ marginBottom: "0.375rem" }}>{post.category}</div>
              <h2 className="font-serif" style={{ fontSize: "1.25rem", fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.3, margin: 0 }}>
                {post.title}
              </h2>
              <p className="text-sm mt-1.5" style={{ color: "var(--muted)", lineHeight: 1.6, margin: "0.375rem 0 0" }}>
                {post.excerpt}
              </p>
              <div className="text-xs mt-2" style={{ color: "var(--muted-light)" }}>
                {formatDate(post.date)} · {post.readingMinutes} min leestijd
              </div>
            </div>
          </Link>
        ))}
      </div>
    </PublicPageShell>
  );
}
