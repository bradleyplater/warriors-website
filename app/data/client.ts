/**
 * Base URL for the published stats JSON (S3 bucket behind CloudFront).
 * Hardcoded rather than an env var — this SPA has no server at runtime,
 * so the value is baked into the static build either way. See KAN-39.
 */
export const DATA_BASE_URL = "https://d20z7zill67968.cloudfront.net";

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
