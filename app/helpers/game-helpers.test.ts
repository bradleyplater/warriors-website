import { describe, it, expect } from "vitest";
import type { Goal, Result } from "~/data/types";
import { DATA_BASE_URL } from "../data/client";
import {
  getAssistsForOneGame,
  getGamePhotos,
  getGameWinningGoalScorerId,
  getGoalsForOneGame,
  getSeasonTallyBefore,
} from "./game-helpers";

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

describe("getGamePhotos", () => {
  it("resolves each photo's key to its CDN URL, in order, keeping its text", () => {
    const photos = getGamePhotos({
      photos: [
        { key: "games/GME1/photos/a.webp", alt: "Players celebrating", caption: "Goal celebration" },
        { key: "games/GME1/photos/b.webp", alt: "Photo 2 of 2 from Warriors v Rivals HC, 12 Oct 2026" },
      ],
    });
    expect(photos).toEqual([
      {
        src: `${DATA_BASE_URL}/games/GME1/photos/a.webp`,
        alt: "Players celebrating",
        caption: "Goal celebration",
      },
      {
        src: `${DATA_BASE_URL}/games/GME1/photos/b.webp`,
        alt: "Photo 2 of 2 from Warriors v Rivals HC, 12 Oct 2026",
        caption: undefined,
      },
    ]);
  });

  it("is empty for a game without photos, so the carousel keeps its placeholders", () => {
    expect(getGamePhotos({})).toEqual([]);
  });
});

describe("getSeasonTallyBefore", () => {
  const game = (date: string, seasonId: string, goals: Goal[]) =>
    ({ ...shootoutWin, date, seasonId, score: { ...shootoutWin.score, shootout: undefined, period: { one: period(goals), two: period(), three: period() } } }) as Result;

  const earlier = game("2026-10-01T19:00:00.000Z", "26/27", [goal("A", 3, ["B"]), goal("A", 9, ["B", "C"])]);
  const lastSeason = game("2026-03-01T19:00:00.000Z", "25/26", [goal("A", 4)]);
  const current = game("2026-10-25T19:00:00.000Z", "26/27", [goal("B", 2, ["A"])]);
  const later = game("2026-11-01T19:00:00.000Z", "26/27", [goal("A", 2)]);

  it("counts only earlier games in the same season, shootouts included", () => {
    const tally = getSeasonTallyBefore([later, current, lastSeason, earlier, shootoutWin], current);
    // earlier: A 2 goals; shootoutWin (18 Oct): A 1 goal + 1 SO assist, B 1 SO goal.
    expect(tally.goals.get("A")).toBe(3);
    expect(tally.goals.get("B")).toBe(1);
    expect(tally.assists.get("B")).toBe(2);
    expect(tally.assists.get("C")).toBe(1);
    expect(tally.assists.get("A")).toBe(1);
  });
});
