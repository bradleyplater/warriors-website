import type { Goal, Result } from "~/data/types";
import { getShootoutGoals } from "./game-helpers";

/** Scoring split by where a point came from. A1 is the primary assist (the
 *  first name on the goal), A2 the secondary. */
export type ScoringLine = {
  games: number;
  goals: number;
  primaryAssists: number;
  secondaryAssists: number;
  assists: number;
  points: number;
};

export type PeriodLine = ScoringLine & { label: string };
export type OpponentLine = ScoringLine & { name: string; pointsPerGame: number };

export type PlayerBreakdown = {
  total: ScoringLine;
  /** 1st, 2nd and 3rd, always present. */
  periods: PeriodLine[];
  /** Shootout scoring sits outside the periods; null when there was none. */
  shootout: PeriodLine | null;
  /** Opponents met at least OTHER_THRESHOLD times, unsorted. */
  opponents: OpponentLine[];
  /** Everyone met fewer times, grouped; null when there are none. */
  other: OpponentLine | null;
};

export const ALL_TIME = "all";

/** Opponents with fewer games than this are grouped as "Other". */
export const OTHER_THRESHOLD = 2;

function emptyLine(): ScoringLine {
  return { games: 0, goals: 0, primaryAssists: 0, secondaryAssists: 0, assists: 0, points: 0 };
}

function addGoals(line: ScoringLine, goals: Goal[], playerId: string) {
  for (const goal of goals) {
    if (goal.playerId === playerId) line.goals++;
    if (goal.assists[0] === playerId) line.primaryAssists++;
    if (goal.assists[1] === playerId) line.secondaryAssists++;
  }
  line.assists = line.primaryAssists + line.secondaryAssists;
  line.points = line.goals + line.assists;
}

/** The player's games, optionally narrowed to one season. */
export function getPlayerGames(results: Result[], playerId: string, season = ALL_TIME): Result[] {
  return results.filter(
    (r) =>
      Array.isArray(r.roster) &&
      r.roster.includes(playerId) &&
      (season === ALL_TIME || r.seasonId === season),
  );
}

/** Seasons the player has a game in, newest first. */
export function getBreakdownSeasons(results: Result[], playerId: string): string[] {
  const seasons = new Set(getPlayerGames(results, playerId).map((r) => r.seasonId as string));
  return [...seasons].sort(
    (a, b) => parseInt(b.split("/")[0], 10) - parseInt(a.split("/")[0], 10),
  );
}

export function getPlayerBreakdown(
  results: Result[],
  playerId: string,
  season = ALL_TIME,
): PlayerBreakdown {
  const games = getPlayerGames(results, playerId, season);
  const total = emptyLine();
  const periods: PeriodLine[] = [
    { label: "1st", ...emptyLine() },
    { label: "2nd", ...emptyLine() },
    { label: "3rd", ...emptyLine() },
  ];
  const shootout: PeriodLine = { label: "SO", ...emptyLine() };
  const byOpponent = new Map<string, ScoringLine>();

  for (const game of games) {
    const { one, two, three } = game.score.period;
    const so = getShootoutGoals(game);
    const all = [...one.goals, ...two.goals, ...three.goals, ...so];

    total.games++;
    addGoals(total, all, playerId);
    [one, two, three].forEach((p, i) => {
      periods[i].games++;
      addGoals(periods[i], p.goals, playerId);
    });
    shootout.games++;
    addGoals(shootout, so, playerId);

    const opponent = byOpponent.get(game.opponentTeam) ?? emptyLine();
    opponent.games++;
    addGoals(opponent, all, playerId);
    byOpponent.set(game.opponentTeam, opponent);
  }

  const opponents: OpponentLine[] = [];
  const other = emptyLine();
  for (const [name, line] of byOpponent) {
    if (line.games >= OTHER_THRESHOLD) {
      opponents.push({ name, ...line, pointsPerGame: line.points / line.games });
    } else {
      other.games += line.games;
      other.goals += line.goals;
      other.primaryAssists += line.primaryAssists;
      other.secondaryAssists += line.secondaryAssists;
      other.assists += line.assists;
      other.points += line.points;
    }
  }

  return {
    total,
    periods,
    shootout: shootout.points > 0 ? shootout : null,
    opponents,
    other:
      other.games > 0 ? { name: "Other", ...other, pointsPerGame: other.points / other.games } : null,
  };
}

export type OpponentSort = "ppg" | "points" | "name";

export function sortOpponents(lines: OpponentLine[], sort: OpponentSort): OpponentLine[] {
  return [...lines].sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "points") return b.points - a.points || b.pointsPerGame - a.pointsPerGame;
    return b.pointsPerGame - a.pointsPerGame || b.points - a.points;
  });
}

export function perGame(points: number, games: number): string {
  return games > 0 ? (points / games).toFixed(2) : "-";
}

/** Whole-number share, or 0 when there is nothing to share. */
export function percent(part: number, whole: number): number {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}
