import { Link } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { GlowScales } from "@/components/brand/GlowScales";
import { GuideFooter } from "@/components/guides/GuideFooter";
import { GUIDES, guidePath } from "@/lib/guides";

export default function GuidesIndexPage() {
  return (
    <Layout>
      <div className="hub-theme hub-bg text-foreground">
        <section className="px-4 pt-10 pb-14 sm:pt-16" aria-labelledby="guides-heading">
          <div className="container mx-auto max-w-6xl min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full metal-card px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              <GlowScales className="h-4 w-4" sparkles={false} /> Legal guides
            </p>
            <h1 id="guides-heading" className="mt-4 font-display text-3xl sm:text-5xl font-bold leading-tight break-words">
              Plain-English legal guides, <span className="gold-text">step by step</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
              General information on common legal situations, with official court and government sources to read next.
              Rules vary by state; check with your local court or a licensed attorney.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {GUIDES.map((g) => (
                <Link key={g.slug} to={guidePath(g.slug)} className="metal-card rounded-3xl p-5 flex flex-col">
                  <span className="metal-icon-well h-10 w-10"><BookOpen className="h-5 w-5" aria-hidden="true" /></span>
                  <h2 className="mt-3 font-display text-lg font-bold">{g.title}</h2>
                  <p className="mt-1 text-sm text-[hsl(218_22%_30%)] flex-1">{g.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[hsl(36_85%_30%)]">
                    Read the guide <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
            <GuideFooter />
          </div>
        </section>
      </div>
    </Layout>
  );
}
