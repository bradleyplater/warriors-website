import type { MetaDescriptor } from "react-router";

/**
 * The address Google should index. The bare domain doesn't serve the site
 * (Cloudflare 522), so www is canonical until that's fixed.
 */
export const SITE_URL = "https://www.peterborough-warriors.com";

export const SITE_NAME = "Peterborough Warriors";

const SHARE_IMAGE = `${SITE_URL}/images/team/LLIHC-Team-26.jpg`;

/**
 * Title, description, canonical URL and social-share tags for one page.
 * `path` is the page's own path, so every URL has one canonical. Pre-rendered
 * pages take a trailing slash ("/results/"): Cloudflare Pages serves them from
 * results/index.html and redirects "/results" there.
 */
export function seoMeta({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): MetaDescriptor[] {
  const url = `${SITE_URL}${path}`;
  return [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:type", content: "website" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: SHARE_IMAGE },
    { property: "og:locale", content: "en_GB" },
    { name: "twitter:card", content: "summary_large_image" },
  ];
}

/** schema.org description of the club, so search results can tie the name to it. */
export const clubStructuredData = {
  "@context": "https://schema.org",
  "@type": "SportsTeam",
  name: "Peterborough Warriors Ice Hockey Club",
  alternateName: SITE_NAME,
  sport: "Ice hockey",
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/images/warriors-logo-black.png`,
  foundingDate: "2013",
  location: {
    "@type": "Place",
    name: "Planet Ice Peterborough",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Mallard Road, Bretton",
      addressLocality: "Peterborough",
      postalCode: "PE3 8YN",
      addressCountry: "GB",
    },
  },
};
