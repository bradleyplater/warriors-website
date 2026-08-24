import { describe, it, expect } from "vitest";
import { buildGoalieStatsMap } from "./roster";

describe("buildGoalieStatsMap", () => {
  it("tallies games and goals against per goalie per season", () => {
    const results = [
      { season: "24/25", netminderPlayerId: "PLR1", score: { opponentScore: 2 } },
      { season: "24/25", netminderPlayerId: "PLR1", score: { opponentScore: 1 } },
      { season: "23/24", netminderPlayerId: "PLR1", score: { opponentScore: 4 } },
    ];

    const map = buildGoalieStatsMap(results);

    expect(map["PLR1"]["24/25"]).toEqual({ games: 2, goalsAgainst: 3 });
    expect(map["PLR1"]["23/24"]).toEqual({ games: 1, goalsAgainst: 4 });
  });

  it("ignores games with no recorded netminder", () => {
    const results = [
      { season: "24/25", netminderPlayerId: "MISSING", score: { opponentScore: 2 } },
      { season: "24/25", netminderPlayerId: "", score: { opponentScore: 1 } },
    ];

    const map = buildGoalieStatsMap(results);

    expect(map).toEqual({});
  });
});
