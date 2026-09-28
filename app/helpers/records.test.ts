import { describe, it, expect } from "vitest";
import type { Player, Result } from "~/data/types";
import { buildRecordSets } from "./records";

const goal = (playerId: string, minute: number, second = 0, assists: string[] = [], type: "EVEN" | "PP" | "SH" = "EVEN") =>
  ({ playerId, minute, second, type, assists });

const period = (goals: ReturnType<typeof goal>[] = [], penalties: { offender: string; duration: number }[] = []) => ({
  warriorsScore: goals.length,
  opponentScore: 0,
  goals,
  opponentGoals: [],
  penalties: penalties.map((p) => ({ ...p, minute: 1, second: 0, type: "HOOK" })),
  opponentPenalties: [],
});

function game(date: string, opts: { p1?: ReturnType<typeof period>; p2?: ReturnType<typeof period>; p3?: ReturnType<typeof period>; against?: number; net?: string }): Result {
  const one = opts.p1 ?? period();
  const two = opts.p2 ?? period();
  const three = opts.p3 ?? period();
  const us = one.goals.length + two.goals.length + three.goals.length;
  return {
    opponentTeam: "Slough Jets",
    logoImage: "",
    date,
    location: "HOME",
    roster: [],
    seasonId: "25/26",
    netminderPlayerId: opts.net ?? "MISSING",
    score: { warriorsScore: us, opponentScore: opts.against ?? 0, period: { one, two, three } },
  } as Result;
}

const players: Player[] = [
  { id: "A", name: "Amy Ash", number: 1, position: "Forward", stats: [{ season: "25/26", games: 2, goals: 5, assists: 1, pims: 2, points: 6 }] },
  { id: "B", name: "Ben Birch", number: 2, position: "Forward", stats: [{ season: "25/26", games: 2, goals: 1, assists: 3, pims: 0, points: 4 }] },
  { id: "G", name: "Gus Glove", number: 30, position: "Goaltender", stats: [{ season: "25/26", games: 2, goals: 0, assists: 0, pims: 0, points: 0 }] },
];

const results = [
  game("2025-10-01T19:00:00Z", {
    p1: period([goal("A", 0, 9, ["B"]), goal("A", 5, 0)], [{ offender: "A", duration: 2 }]),
    p2: period([goal("A", 25, 30, ["B"], "PP")]),
    net: "G",
  }),
  game("2025-11-01T19:00:00Z", { p1: period([goal("B", 3, 0, ["A"])]), p3: period([goal("A", 50, 0, ["B"])]), against: 2, net: "G" }),
];

const [single, season, allTime] = buildRecordSets(results, players);
const card = (set: typeof single, title: string) =>
  set.groups.flatMap((g) => g.records).find((r) => r.title === title)!;

describe("buildRecordSets", () => {
  it("ranks single-game goals with the game as context", () => {
    const top = card(single, "Goals").top;
    expect(top[0]).toMatchObject({ playerId: "A", value: "3", context: "v Slough Jets · 1 Oct 2025" });
    expect(top.map((e) => e.value)).toEqual(["3", "1", "1"]);
  });

  it("times the fastest goal from the opening face-off on the game clock", () => {
    expect(card(single, "Fastest goal").top[0]).toMatchObject({ playerId: "A", value: "0:09" });
    expect(card(single, "Fastest goal").top[0].context).toMatch(/^1st period/);
  });

  it("measures a hat-trick from first goal to third across periods without double-counting", () => {
    // 0:09 and 25:30 on the whole-game clock: 25:21 apart, 1st to 2nd period.
    expect(card(single, "Fastest hat-trick").top[0]).toMatchObject({ value: "25:21" });
    expect(card(single, "Fastest hat-trick").top[0].context).toMatch(/^1st–2nd period/);
  });

  it("counts hat-tricks, power play goals and game-winners per season from the sheets", () => {
    expect(card(season, "Hat-tricks").top[0]).toMatchObject({ playerId: "A", value: "1", context: "25/26 · 2 GP" });
    expect(card(season, "Power play goals").top[0]).toMatchObject({ playerId: "A", value: "1" });
    expect(card(season, "Game-winning goals").top[0]).toMatchObject({ playerId: "A", value: "1" });
  });

  it("credits shutouts to the recorded netminder with their games in goal", () => {
    expect(card(season, "Shutouts").top).toEqual([expect.objectContaining({ playerId: "G", value: "1", context: "25/26 · 2 GP" })]);
    expect(card(allTime, "Career shutouts").top[0]).toMatchObject({ playerId: "G", value: "1", context: "2 GP" });
  });

  it("leaves out anyone with nothing to count", () => {
    expect(card(season, "POTG awards").top).toEqual([]);
    expect(card(allTime, "Career goals").top.map((e) => e.playerId)).toEqual(["A", "B"]);
  });
});
