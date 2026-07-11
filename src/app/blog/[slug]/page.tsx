import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PublicPageShell from "@/components/PublicPageShell";
import { BLOG_POSTS, getBlogPost } from "@/lib/blogPosts";

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Artikel niet gevonden" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt, type: "article" },
  };
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <PublicPageShell title={post.title}>
      <p className="ddp-prose-meta" style={{ marginTop: "-1rem" }}>
        {post.category} · {formatDate(post.date)} · {post.readingMinutes} min leestijd
      </p>

      {post.content.map((block, i) =>
        block.startsWith("## ") ? (
          <h2 key={i}>{block.slice(3)}</h2>
        ) : (
          <p key={i}>{block}</p>
        )
      )}

      <div className="mt-10 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
        <Link href="/blog" style={{ fontWeight: 600 }}>← Alle artikelen</Link>
      </div>

      <div className="dash-hero mt-6" style={{ padding: "1.5rem", textAlign: "center" }}>
        <h2 className="font-serif" style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--ink-text)", margin: 0 }}>
          Zelf aan de slag met jullie bruiloft?
        </h2>
        <p className="text-sm mt-1 mb-4" style={{ color: "var(--ink-muted)" }}>
          Draaiboek, gastenlijst, budget en leveranciers op één plek. Gratis voor bruidsparen.
        </p>
        <Link
          href="/aanmelden"
          className="ddp-btn-gold"
          style={{ display: "inline-flex", background: "var(--gold)", color: "var(--ink)", fontWeight: 700, fontSize: "0.8125rem", padding: "0.65rem 1.375rem", borderRadius: "var(--radius-full)", textDecoration: "none" }}
        >
          Begin gratis
        </Link>
      </div>
    </PublicPageShell>
  );
}
