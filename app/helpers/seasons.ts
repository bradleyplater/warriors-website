import type { SeasonsFile } from "~/data/types";

/** "26/27" → 26. Anything unparseable ("Unknown") sorts last. */
function startYear(season: string): number {
  const year = parseInt(season.split("/")[0], 10);
  return Number.isNaN(year) ? -Infinity : year;
}

/**
 * Season chips, newest first: every season the portal published plus any
 * season the results mention, so a new season shows before its first game
 * and a season missing from seasons.json is never hidden.
 */
export function seasonOptions(file: SeasonsFile | null, fromResults: string[]): string[] {
  const all = new Set([...(file?.seasons ?? []), ...fromResults]);
  return [...all].sort((a, b) => startYear(b) - startYear(a));
}

/**
 * The season pages open on: the portal's active season, or — when
 * seasons.json is unavailable or names none — the newest season with data.
 */
export function currentSeason(file: SeasonsFile | null, fromResults: string[]): string | undefined {
  return file?.activeSeason ?? seasonOptions(null, fromResults)[0];
}

/** "26/27" → "2026/27 season". */
export function seasonHeading(season: string): string {
  const match = /^(\d{2})\/(\d{2})$/.exec(season);
  return match ? `20${match[1]}/${match[2]} season` : `${season} season`;
}
