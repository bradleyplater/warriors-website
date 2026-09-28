import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

import { NavBar } from "./components/NavBar";
import { Footer } from "./components/Footer";
import { RouteLoadingFallback } from "./components/RouteLoadingFallback/RouteLoadingFallback";

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="home">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>

      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <NavBar />
        <main style={{ flexGrow: 1 }}>{children}</main>
        <Footer />

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function HydrateFallback() {
  return <RouteLoadingFallback />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <Layout>
      <div className="wrap" style={{ paddingTop: "var(--wr-space-16)", paddingBottom: "var(--wr-space-16)" }}>
        <h1 className="t-display" style={{ fontSize: "var(--wr-text-h1)" }}>Error</h1>
        <p style={{ marginTop: "var(--wr-space-2)", marginBottom: "var(--wr-space-4)", color: "var(--fg-secondary)" }}>
          Something went wrong.
        </p>
      </div>
    </Layout>
  );
}
