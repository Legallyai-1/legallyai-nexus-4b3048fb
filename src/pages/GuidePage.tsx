import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Info } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { GuideFooter } from "@/components/guides/GuideFooter";
import { GUIDES, guidePath } from "@/lib/guides";
import { guideHeadings, headingId, renderGuideMarkdown } from "@/lib/guideMarkdown";
import NotFoundPage from "@/pages/NotFoundPage";

const BODIES = import.meta.glob("../content/guides/*.md", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

export default function GuidePage({ slug }: { slug: string }) {
  const guide = GUIDES.find((g) => g.slug === slug);
  const body = BODIES[`../content/guides/${slug}.md`];
  if (!guide || !body) return <NotFoundPage />;
  const sections = guideHeadings(body).filter((h) => h !== "Sources and further reading");
  const related = GUIDES.filter((g) => g.slug !== slug).slice(0, 3);

  return (
    <Layout>
      <div className="hub-theme hub-bg text-foreground">
        <article className="px-4 pt-8 pb-14 sm:pt-12" aria-labelledby="guide-heading">
          <div className="container mx-auto max-w-3xl min-w-0">
            <Link to="/guides" className="flex w-fit items-center gap-1 text-sm font-semibold text-[hsl(36_85%_30%)] hover:underline">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All guides
            </Link>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full metal-card px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              <BookOpen className="h-4 w-4" aria-hidden="true" /> Legal guide
            </p>
            <h1 id="guide-heading" className="mt-3 font-display text-3xl sm:text-5xl font-bold leading-tight break-words">{guide.title}</h1>
            <p className="mt-3 text-lg text-muted-foreground">{guide.description}</p>
            <p className="mt-5 glass-panel rounded-2xl p-4 text-sm flex gap-2">
              <Info className="metal-icon h-5 w-5 shrink-0" aria-hidden="true" />
              <span>
                Legal information, not legal advice. LegallyAI is not a law firm. Rules vary by state; check with your local
                court or a licensed attorney. <Link to="/disclaimer" className="underline font-medium">Disclaimer</Link>
              </span>
            </p>
            {sections.length > 3 && (
              <nav aria-label="On this page" className="mt-6 glass-panel rounded-2xl p-4">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">On this page</h2>
                <ul className="mt-2 grid gap-1 sm:grid-cols-2 text-sm">
                  {sections.map((h) => (
                    <li key={h}><a href={`#${headingId(h)}`} className="guide-link">{h}</a></li>
                  ))}
                </ul>
              </nav>
            )}
            <div className="guide-prose mt-8 glass-panel rounded-3xl p-5 sm:p-8">{renderGuideMarkdown(body)}</div>
            <GuideFooter />
            <section className="mt-10" aria-labelledby="more-guides">
              <h2 id="more-guides" className="font-display text-xl font-bold">More guides</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {related.map((g) => (
                  <Link key={g.slug} to={guidePath(g.slug)} className="metal-card rounded-2xl p-4 font-semibold">{g.title}</Link>
                ))}
              </div>
            </section>
          </div>
        </article>
      </div>
    </Layout>
  );
}
