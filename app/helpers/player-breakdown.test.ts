import { describe, it, expect } from "vitest";
import type { Result } from "../data/types";
import {
  getBreakdownSeasons,
  getDuos,
  getLinemates,
  getPlayerBreakdown,
  percent,
  perGame,
  sortOpponents,
} from "./player-breakdown";

const goal = (playerId: string, assists: string[] = [], type: "EVEN" | "PP" | "SH" | "SO" = "EVEN") =>
  ({ playerId, minute: 1, second: 0, type, assists });

const period = (goals: ReturnType<typeof goal>[] = []) => ({
  warriorsScore: goals.length,
  opponentScore: 0,
  goals,
  opponentGoals: [],
  penalties: [],
  opponentPenalties: [],
});

function game(
  opponent: string,
  season: string,
  opts: { p1?: ReturnType<typeof goal>[]; p2?: ReturnType<typeof goal>[]; p3?: ReturnType<typeof goal>[]; so?: ReturnType<typeof goal>[]; roster?: string[] } = {},
): Result {
  return {
    opponentTeam: opponent,
    date: "2025-10-01T19:00:00Z",
    location: "HOME",
    roster: opts.roster ?? ["A", "B", "C"],
    seasonId: season,
    score: {
      warriorsScore: 0,
      opponentScore: 0,
      period: { one: period(opts.p1), two: period(opts.p2), three: period(opts.p3) },
      ...(opts.so && { shootout: { warriorsScore: opts.so.length, opponentScore: 0, goals: opts.so, opponentGoals: [] } }),
    },
  } as Result;
}

const results: Result[] = [
  game("Slough Jets", "24/25", { p1: [goal("A", ["B", "C"])], p3: [goal("B", ["A"])] }),
  game("Slough Jets", "25/26", { p2: [goal("A"), goal("C", ["B", "A"])] }),
  game("Slough Jets", "25/26", { p2: [goal("A", ["C"])] }),
  game("Invicta Dynamos", "25/26", { p1: [goal("C", ["A"])], so: [goal("A", [], "SO")] }),
  game("Bracknell Hornets", "24/25", { roster: ["A", "B"] }),
  game("Bracknell Hornets", "25/26", { roster: ["A", "B"] }),
  game("Bracknell Hornets", "25/26", { roster: ["B", "C"], p1: [goal("B")] }),
];

describe("getPlayerBreakdown", () => {
  it("splits scoring by period with primary and secondary assists", () => {
    const { periods, total } = getPlayerBreakdown(results, "A");
    expect(periods.map((p) => [p.label, p.goals, p.primaryAssists, p.secondaryAssists, p.points])).toEqual([
      ["1st", 1, 1, 0, 2],
      ["2nd", 2, 0, 1, 3],
      ["3rd", 0, 1, 0, 1],
    ]);
    // Totals include the shootout goal, matching the career line.
    expect(total).toMatchObject({ games: 6, goals: 4, primaryAssists: 2, secondaryAssists: 1, assists: 3, points: 7 });
  });

  it("keeps shootout scoring outside the periods", () => {
    expect(getPlayerBreakdown(results, "A").shootout).toMatchObject({ goals: 1, points: 1, games: 6 });
    expect(getPlayerBreakdown(results, "B").shootout).toBeNull();
  });

  it("only counts games the player was rostered for", () => {
    expect(getPlayerBreakdown(results, "A").total.games).toBe(6);
    expect(getPlayerBreakdown(results, "C").total.games).toBe(5);
  });

  it("narrows to one season", () => {
    const { total, opponents, other } = getPlayerBreakdown(results, "A", "24/25");
    expect(total).toMatchObject({ games: 2, goals: 1, assists: 1, points: 2 });
    expect(opponents).toEqual([]);
    expect(other).toMatchObject({ name: "Other", games: 2, points: 2 });
  });

  it("groups opponents met only once as Other", () => {
    const { opponents, other } = getPlayerBreakdown(results, "A");
    expect(opponents).toEqual([
      expect.objectContaining({ name: "Slough Jets", games: 3, goals: 3, assists: 2, points: 5 }),
      expect.objectContaining({ name: "Bracknell Hornets", games: 2, points: 0, pointsPerGame: 0 }),
    ]);
    expect(other).toMatchObject({ name: "Other", games: 1, goals: 1, assists: 1, points: 2, pointsPerGame: 2 });
  });

  it("returns empty lines for a player with no games", () => {
    const breakdown = getPlayerBreakdown(results, "Z");
    expect(breakdown.total.games).toBe(0);
    expect(breakdown.opponents).toEqual([]);
    expect(breakdown.other).toBeNull();
  });
});

describe("getBreakdownSeasons", () => {
  it("lists the player's seasons newest first", () => {
    expect(getBreakdownSeasons(results, "A")).toEqual(["25/26", "24/25"]);
  });
});

describe("sortOpponents", () => {
  const lines = [
    { name: "B", points: 6, pointsPerGame: 1.5 },
    { name: "C", points: 6, pointsPerGame: 2 },
    { name: "A", points: 9, pointsPerGame: 1 },
  ].map((l) => ({ ...l, games: 0, goals: 0, primaryAssists: 0, secondaryAssists: 0, assists: 0 }));

  it("sorts by points per game, then points", () => {
    expect(sortOpponents(lines, "ppg").map((l) => l.name)).toEqual(["C", "B", "A"]);
  });
  it("sorts by points, then points per game", () => {
    expect(sortOpponents(lines, "points").map((l) => l.name)).toEqual(["A", "C", "B"]);
  });
  it("sorts by name", () => {
    expect(sortOpponents(lines, "name").map((l) => l.name)).toEqual(["A", "B", "C"]);
  });
});

describe("formatting", () => {
  it("guards against zero games and zero totals", () => {
    expect(perGame(3, 0)).toBe("-");
    expect(perGame(3, 2)).toBe("1.50");
    expect(percent(1, 0)).toBe(0);
    expect(percent(34, 57)).toBe(60);
  });
});

describe("getLinemates", () => {
  const results = [
    game("X", "25/26", {
      roster: ["A", "B", "C", "D"],
      // A scores from B and C; B scores from A; C scores from A and B; D scores alone.
      p1: [goal("A", ["B", "C"]), goal("B", ["A"])],
      p2: [goal("C", ["A", "B"]), goal("D")],
      so: [goal("A")],
    }),
    game("Y", "24/25", { roster: ["A", "B"], p1: [goal("B", ["A"])] }),
    game("Z", "25/26", { roster: ["B", "C"], p1: [goal("B", ["C"])] }),
  ];

  it("counts who set up whom and goals together", () => {
    const lines = getLinemates(results, "A");
    expect(lines.map((l) => l.playerId)).toEqual(["B", "C"]);
    expect(lines[0]).toEqual({ playerId: "B", games: 2, setUpBy: 1, setUp: 2, together: 4 });
    // Both assisting C's goal counts as together, but not as a set-up.
    expect(lines[1]).toEqual({ playerId: "C", games: 1, setUpBy: 1, setUp: 1, together: 2 });
  });

  it("leaves out teammates with no goals together", () => {
    expect(getLinemates(results, "A").some((l) => l.playerId === "D")).toBe(false);
    expect(getLinemates(results, "C").find((l) => l.playerId === "B")).toMatchObject({ games: 2, together: 3 });
  });

  it("narrows to one season", () => {
    expect(getLinemates(results, "A", "24/25")).toEqual([
      { playerId: "B", games: 1, setUpBy: 0, setUp: 1, together: 1 },
    ]);
  });
});

describe("getDuos", () => {
  const results = [
    game("X", "25/26", {
      roster: ["A", "B", "C", "D"],
      p1: [goal("A", ["B", "C"]), goal("B", ["A"])],
      p2: [goal("C", ["A", "B"]), goal("D")],
      so: [goal("A")],
    }),
    game("Y", "24/25", { roster: ["A", "B"], p1: [goal("B", ["A"])] }),
  ];

  it("counts each pair once, both ways, most goals together first", () => {
    expect(getDuos(results)).toEqual([
      { a: "A", b: "B", games: 2, aFromB: 1, bFromA: 2, together: 4 },
      { a: "A", b: "C", games: 1, aFromB: 1, bFromA: 1, together: 2 },
      { a: "B", b: "C", games: 1, aFromB: 0, bFromA: 1, together: 2 },
    ]);
  });

  it("agrees with the player's linemates", () => {
    const ab = getDuos(results).find((d) => d.a === "A" && d.b === "B")!;
    const b = getLinemates(results, "A").find((l) => l.playerId === "B")!;
    expect([ab.aFromB, ab.bFromA, ab.together, ab.games]).toEqual([b.setUpBy, b.setUp, b.together, b.games]);
  });

  it("narrows to one season", () => {
    expect(getDuos(results, "24/25")).toEqual([
      { a: "A", b: "B", games: 1, aFromB: 0, bFromA: 1, together: 1 },
    ]);
  });
});
