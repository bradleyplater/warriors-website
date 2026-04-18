import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { Text } from "@wonderflow/react-components";
import "@wonderflow/react-components/core.css";
import "@wonderflow/themes";

import type { Route } from "./+types/root";
import "./app.css";

import { DataProvider } from "./contexts/DataContext";
import { NavBar } from "./components/NavBar";

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
    <html lang="en" data-theme="light">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>

      <body className="min-h-screen bg-gray-50 flex flex-col">
        <NavBar />
        <main className="flex-grow">{children}</main>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <DataProvider>
      <Outlet />
    </DataProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <Layout>
      <div className="pt-16 p-4 container mx-auto">
        <Text variant="heading-1">Error</Text>
        <Text variant="body-1" className="mt-2 mb-4">Something went wrong.</Text>
      </div>
    </Layout>
  );
}
