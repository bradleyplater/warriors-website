import { describe, it, expect } from "vitest";
import { buildGoalieStatsMap } from "./roster";

describe("buildGoalieStatsMap", () => {
  it("tallies games and goals against per goalie per season", () => {
    const results = [
      { season: "24/25", netminderPlayerId: "PLR1", score: { warriorsScore: 5, opponentScore: 2 } },
      { season: "24/25", netminderPlayerId: "PLR1", score: { warriorsScore: 3, opponentScore: 1 } },
      { season: "23/24", netminderPlayerId: "PLR1", score: { warriorsScore: 0, opponentScore: 4 } },
    ];

    const map = buildGoalieStatsMap(results);

    expect(map["PLR1"]["24/25"]).toMatchObject({ games: 2, goalsAgainst: 3 });
    expect(map["PLR1"]["23/24"]).toMatchObject({ games: 1, goalsAgainst: 4 });
  });

  it("splits each season's record into wins, losses and draws", () => {
    const results = [
      { season: "24/25", netminderPlayerId: "PLR1", score: { warriorsScore: 5, opponentScore: 2 } },
      { season: "24/25", netminderPlayerId: "PLR1", score: { warriorsScore: 1, opponentScore: 4 } },
      { season: "24/25", netminderPlayerId: "PLR1", score: { warriorsScore: 3, opponentScore: 3 } },
    ];

    const map = buildGoalieStatsMap(results);

    expect(map["PLR1"]["24/25"]).toEqual({
      games: 3,
      goalsAgainst: 9,
      wins: 1,
      losses: 1,
      draws: 1,
    });
  });

  it("ignores games with no recorded netminder", () => {
    const results = [
      { season: "24/25", netminderPlayerId: "MISSING", score: { warriorsScore: 3, opponentScore: 2 } },
      { season: "24/25", netminderPlayerId: "", score: { warriorsScore: 0, opponentScore: 1 } },
    ];

    const map = buildGoalieStatsMap(results);

    expect(map).toEqual({});
  });
});
