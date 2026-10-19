import type { Config } from "@react-router/dev/config";

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: false,
  // Static HTML for every page without a URL parameter, so search engines get
  // each page's title, description and heading without running JavaScript.
  // Player and game pages fall back to the __spa-fallback shell (public/_redirects).
  prerender: true,
} satisfies Config;
