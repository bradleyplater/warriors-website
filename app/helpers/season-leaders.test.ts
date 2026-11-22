import { describe, it, expect } from "vitest";
import type { Player, Result, UpcomingGame } from "../data/types";
import { buildCompetitionLeaders, competitionName } from "./season-leaders";

const goal = (playerId: string, assists: string[] = []) =>
  ({ playerId, minute: 1, second: 0, type: "EVEN" as const, assists });
const penalty = (offender: string, duration = 2) =>
  ({ offender, minute: 1, second: 0, duration, type: "HOOK" });

function game(
  competition: string,
  season: string,
  opts: { goals?: ReturnType<typeof goal>[]; penalties?: ReturnType<typeof penalty>[]; so?: ReturnType<typeof goal>[] } = {},
): Result {
  const empty = { warriorsScore: 0, opponentScore: 0, goals: [], opponentGoals: [], penalties: [], opponentPenalties: [] };
  return {
    opponentTeam: "Slough Jets",
    date: "2026-10-01T19:00:00Z",
    location: "HOME",
    roster: [],
    seasonId: season,
    competition,
    score: {
      warriorsScore: 0,
      opponentScore: 0,
      period: {
        one: { ...empty, goals: opts.goals ?? [], penalties: opts.penalties ?? [] },
        two: empty,
        three: empty,
      },
      ...(opts.so && { shootout: { warriorsScore: 1, opponentScore: 0, goals: opts.so, opponentGoals: [] } }),
    },
  } as Result;
}

const player = (id: string, name: string, number: number): Player =>
  ({ id, name, number, position: "F", stats: [] });

const players = [player("A", "Alex Able", 3), player("B", "Ben Baker", 82), player("C", "Cal Cole", 4), player("D", "Dan Dee", 9)];

const fixture = (gameType: string) => ({ gameType }) as UpcomingGame;

describe("buildCompetitionLeaders", () => {
  const results = [
    game("LLIHC", "26/27", { goals: [goal("A", ["B"]), goal("A", ["C", "B"])], penalties: [penalty("D", 4)] }),
    game("LLIHC", "26/27", { goals: [goal("B")], so: [goal("C", ["A"])] }),
    game("BOTBC", "26/27", { goals: [goal("C")] }),
    game("LLIHC", "25/26", { goals: [goal("D"), goal("D"), goal("D")] }),
  ];

  it("splits the season by competition, busiest first, with fixtures still to start", () => {
    const leaders = buildCompetitionLeaders(results, players, "26/27", [fixture("Challenge"), fixture("LLIHC")]);
    expect(leaders.map((c) => [c.code, c.name, c.gamesPlayed])).toEqual([
      ["LLIHC", "Lamp Lighters", 2],
      ["BOTBC", "Bottom Of The Barrel", 1],
      ["Challenge", "Challenge", 0],
    ]);
    expect(leaders[2]!.categories).toEqual([]);
  });

  it("ranks goals, assists and PIMs within a competition, counting shootout goals", () => {
    const [llihc] = buildCompetitionLeaders(results, players, "26/27");
    const byStat = Object.fromEntries(
      llihc!.categories.map((c) => [c.stat, c.entries.map((e) => [e.name, e.value])]),
    );
    expect(byStat.goals).toEqual([["Alex Able", 2], ["Ben Baker", 1], ["Cal Cole", 1]]);
    expect(byStat.assists).toEqual([["Ben Baker", 2], ["Alex Able", 1], ["Cal Cole", 1]]);
    expect(byStat.pims).toEqual([["Dan Dee", 4]]);
  });

  it("leaves out stats from other seasons and unknown players", () => {
    const [llihc] = buildCompetitionLeaders(
      [...results, game("LLIHC", "26/27", { goals: [goal("Z")] })],
      players,
      "26/27",
    );
    const goals = llihc!.categories.find((c) => c.stat === "goals")!.entries;
    expect(goals.map((e) => e.id)).not.toContain("D");
    expect(goals.map((e) => e.id)).not.toContain("Z");
  });

  it("drops categories with nobody on the board", () => {
    const [botbc] = buildCompetitionLeaders([game("BOTBC", "26/27", { goals: [goal("C")] })], players, "26/27");
    expect(botbc!.categories.map((c) => c.stat)).toEqual(["goals"]);
  });
});

describe("competitionName", () => {
  it("falls back to the code for competitions without a display name", () => {
    expect(competitionName("NIHC")).toBe("NIHC");
  });
});
