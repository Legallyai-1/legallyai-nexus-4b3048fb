import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Home, MessageSquare } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { GlowScales } from "@/components/brand/GlowScales";
import { Button } from "@/components/ui/button";
import { TOOL_CATALOG } from "@/lib/toolCatalog";
import { TOOL_ICONS } from "@/components/layout/toolIcons";
import { NOT_FOUND_SEO } from "@/lib/staticPages";

// Branded 404. RouteSeo already marks unknown paths noindex; this applies the same NOT_FOUND_SEO
// title and description the build uses for the static 404.html, and drops the canonical link.
const SUGGESTED = ["/chat", "/generate", "/ai-assistants", "/custody", "/marriage-divorce", "/tickets-defense", "/lawyers", "/pricing", "/support"];
const suggestions = SUGGESTED.map((path) => TOOL_CATALOG.find((t) => t.path === path)).filter((t): t is NonNullable<typeof t> => Boolean(t));

function useNotFoundMeta() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = NOT_FOUND_SEO.title;
    const set = (name: string, content: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };
    set("robots", "noindex, follow");
    set("description", NOT_FOUND_SEO.description);
    document.head.querySelector('link[rel="canonical"]')?.remove();
  }, [pathname]);
}

export default function NotFoundPage() {
  const { pathname } = useLocation();
  useNotFoundMeta();

  return (
    <Layout>
      <div className="hub-theme hub-bg text-foreground">
        <section className="px-4 pt-12 pb-8 sm:pt-20" aria-labelledby="nf-heading">
          <div className="container mx-auto max-w-3xl text-center">
            <div className="glass-panel rounded-3xl px-6 py-10 sm:px-10">
              <GlowScales className="mx-auto h-14 w-14" />
              <p className="mt-5 font-display text-6xl sm:text-7xl font-bold gold-text" aria-hidden="true">404</p>
              <h1 id="nf-heading" className="mt-2 font-display text-2xl sm:text-4xl font-bold">We couldn't find that page</h1>
              <p className="mt-3 text-muted-foreground">
                <code className="rounded-md bg-white/70 px-1.5 py-0.5 text-sm break-all text-foreground">{pathname}</code>{" "}
                doesn't exist or may have moved. Try one of the links below, or ask Lee what you were looking for.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
                <Button asChild size="lg" className="gold-tile border-0 font-semibold">
                  <Link to="/chat"><MessageSquare className="mr-1.5 h-4 w-4" aria-hidden="true" />Ask Lee</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-white/70">
                  <Link to="/"><Home className="mr-1.5 h-4 w-4" aria-hidden="true" />Go to the home page</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pt-4 pb-14" aria-labelledby="nf-links-heading">
          <div className="container mx-auto max-w-5xl">
            <h2 id="nf-links-heading" className="font-display text-xl sm:text-2xl font-bold">Popular places to go</h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {suggestions.map((tool) => {
                const Icon = TOOL_ICONS[tool.icon];
                return (
                  <Link key={tool.path} to={tool.path} className="metal-card rounded-2xl p-4 flex items-center gap-3">
                    <span className="metal-icon-well h-10 w-10 shrink-0"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{tool.title}</span>
                      <span className="block text-sm text-[hsl(218_22%_30%)]">{tool.description}</span>
                    </span>
                    <ArrowRight className="metal-icon h-4 w-4 shrink-0" aria-hidden="true" />
                  </Link>
                );
              })}
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              LegallyAI provides legal information, not legal advice, and is not a law firm.{" "}
              <Link to="/disclaimer" className="underline">Read the disclaimer</Link> ·{" "}
              <Link to="/contact" className="underline">Contact us</Link>
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
}
