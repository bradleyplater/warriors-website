import type { Goal, Penalty, Player, Result, UpcomingGame } from "~/data/types";
import { getShootoutGoals } from "./game-helpers";

/** Display names for the portal's competition codes; unknown codes show as-is. */
const COMPETITION_NAMES: Record<string, string> = {
  LLIHC: "Lamp Lighters",
  BOTBC: "Bottom Of The Barrel",
  Challenge: "Challenge",
};

export function competitionName(code: string): string {
  return COMPETITION_NAMES[code] ?? code;
}

export type LeaderStat = "goals" | "assists" | "pims";

export type LeaderEntry = { id: string; name: string; number: number; value: number };

export type LeaderCategory = { stat: LeaderStat; label: string; entries: LeaderEntry[] };

export type CompetitionLeaders = {
  /** The portal's code, e.g. "BOTBC". */
  code: string;
  name: string;
  gamesPlayed: number;
  /** Empty until the competition has a game with a goal, assist or penalty. */
  categories: LeaderCategory[];
};

const CATEGORIES: { stat: LeaderStat; label: string }[] = [
  { stat: "goals", label: "Goals" },
  { stat: "assists", label: "Assists" },
  { stat: "pims", label: "PIMs" },
];

/** Leader plus the next two, as in the design. */
const ROWS_PER_CATEGORY = 3;

function gameGoals(game: Result): Goal[] {
  const { one, two, three } = game.score.period;
  return [...one.goals, ...two.goals, ...three.goals, ...getShootoutGoals(game)];
}

function gamePenalties(game: Result): Penalty[] {
  const { one, two, three } = game.score.period;
  return [...one.penalties, ...two.penalties, ...three.penalties];
}

/**
 * Season leaders split by competition: every competition the season's results
 * cover, plus any still to start that appear in the upcoming fixtures. Busiest
 * competition first.
 */
export function buildCompetitionLeaders(
  results: Result[],
  players: Player[],
  season: string | undefined,
  upcomingGames: UpcomingGame[] = []
): CompetitionLeaders[] {
  const playerById = new Map(players.map((player) => [player.id, player]));
  const games = results.filter((game) => game.seasonId === season);

  const codes = new Set<string>();
  for (const game of games) codes.add(game.competition || "Other");
  for (const fixture of upcomingGames) if (fixture.gameType) codes.add(fixture.gameType);

  const competitions = [...codes].map((code): CompetitionLeaders => {
    const played = games.filter((game) => (game.competition || "Other") === code);
    const totals: Record<LeaderStat, Map<string, number>> = {
      goals: new Map(),
      assists: new Map(),
      pims: new Map(),
    };
    const add = (stat: LeaderStat, id: string, value: number) =>
      totals[stat].set(id, (totals[stat].get(id) ?? 0) + value);

    for (const game of played) {
      for (const goal of gameGoals(game)) {
        add("goals", goal.playerId, 1);
        for (const assist of goal.assists) add("assists", assist, 1);
      }
      for (const penalty of gamePenalties(game)) add("pims", penalty.offender, penalty.duration);
    }

    const categories = CATEGORIES.map(({ stat, label }) => ({
      stat,
      label,
      entries: [...totals[stat]]
        .flatMap(([id, value]) => {
          const player = playerById.get(id);
          return player && value > 0
            ? [{ id, name: player.name, number: player.number, value }]
            : [];
        })
        .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name))
        .slice(0, ROWS_PER_CATEGORY),
    })).filter((category) => category.entries.length > 0);

    return { code, name: competitionName(code), gamesPlayed: played.length, categories };
  });

  return competitions.sort(
    (a, b) => b.gamesPlayed - a.gamesPlayed || a.name.localeCompare(b.name)
  );
}
