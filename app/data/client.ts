import type { SeasonsFile } from "./types";

/**
 * Base URL for the published stats JSON (S3 bucket behind CloudFront).
 * Hardcoded rather than an env var — this SPA has no server at runtime,
 * so the value is baked into the static build either way. See KAN-39.
 */
export const DATA_BASE_URL = "https://d20z7zill67968.cloudfront.net";

/**
 * URL for an S3 object key the portal publishes (e.g. an opponent's
 * `logoImage`). The same distribution serves the JSON and the images.
 */
export function assetUrl(key: string): string {
  return `${DATA_BASE_URL}/${key}`;
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${DATA_BASE_URL}/${path}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

const cache = new Map<string, Promise<unknown>>();

function cached<T>(path: string): Promise<T> {
  if (!cache.has(path)) {
    cache.set(path, fetchJson<T>(path));
  }
  return cache.get(path) as Promise<T>;
}

export function getPlayers<T = unknown>(): Promise<T> {
  return cached<T>("players.json");
}

export function getResults<T = unknown>(): Promise<T> {
  return cached<T>("results.json");
}

export function getRosterConfig<T = unknown>(): Promise<T> {
  return cached<T>("roster-config.json");
}

export function getUpcomingGames<T = unknown>(): Promise<T> {
  return cached<T>("upcoming-games.json");
}

/**
 * seasons.json: the portal's active season and every season name. Resolves
 * null if it can't be fetched (e.g. the site deploys before the portal first
 * publishes it), so pages fall back to the newest season with games.
 */
export function getSeasons(): Promise<SeasonsFile | null> {
  return cached<SeasonsFile>("seasons.json").catch(() => null);
}
