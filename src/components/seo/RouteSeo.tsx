import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getRouteSeo, OG_IMAGE } from "@/lib/seo";

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

// Keeps the document title, description, canonical and share tags in sync with the route.
export function RouteSeo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const seo = getRouteSeo(pathname);
    document.title = seo.title;
    setMeta("name", "description", seo.description);
    setMeta("name", "robots", seo.indexable ? "index, follow" : "noindex, follow");
    setMeta("property", "og:title", seo.title);
    setMeta("property", "og:description", seo.description);
    setMeta("property", "og:url", seo.canonical);
    setMeta("property", "og:image", OG_IMAGE);
    setMeta("name", "twitter:title", seo.title);
    setMeta("name", "twitter:description", seo.description);
    setMeta("name", "twitter:image", OG_IMAGE);

    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = seo.canonical;
  }, [pathname]);

  return null;
}

export default RouteSeo;
