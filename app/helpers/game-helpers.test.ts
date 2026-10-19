import { describe, it, expect } from "vitest";
import type { Goal, Result } from "~/data/types";
import { getAssistsForOneGame, getGameWinningGoalScorerId, getGoalsForOneGame } from "./game-helpers";

const goal = (playerId: string, minute: number, assists: string[] = [], type: Goal["type"] = "EVEN"): Goal =>
  ({ playerId, minute, second: 0, type, assists });

const period = (goals: Goal[] = []) => ({
  warriorsScore: goals.length,
  opponentScore: 0,
  goals,
  opponentGoals: [],
  penalties: [],
  opponentPenalties: [],
});

// 1-1 after regulation, won 2-1 on B's shootout goal (assisted by A).
const shootoutWin = {
  opponentTeam: "Tribase Lightning",
  date: "2026-10-18T00:00:00.000Z",
  location: "HOME",
  roster: ["A", "B"],
  seasonId: "26/27",
  score: {
    warriorsScore: 2,
    opponentScore: 1,
    period: { one: period([goal("A", 5)]), two: period(), three: period() },
    shootout: { warriorsScore: 1, opponentScore: 0, goals: [goal("B", 65, ["A"], "SO")], opponentGoals: [] },
  },
} as Result;

describe("game helpers with a shootout", () => {
  it("counts shootout goals and assists alongside regulation ones", () => {
    expect(getGoalsForOneGame(shootoutWin, "A")).toBe(1);
    expect(getGoalsForOneGame(shootoutWin, "B")).toBe(1);
    expect(getAssistsForOneGame(shootoutWin, "A")).toBe(1);
  });

  it("awards no game-winning goal for a shootout win", () => {
    expect(getGameWinningGoalScorerId(shootoutWin)).toBeNull();
  });
});
