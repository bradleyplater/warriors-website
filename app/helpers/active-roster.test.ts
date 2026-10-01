import { describe, it, expect } from "vitest";
import { playsGoal, playsSkater, withActivePlayers, type RosterPlayer } from "./active-roster";

const player = (id: string, position = "Forward"): RosterPlayer => ({ id, name: id, number: 1, position });
const zero = (p: RosterPlayer) => ({ playerId: p.id, goals: 0 });

describe("withActivePlayers", () => {
  it("lists every active player with zeros when nobody has played", () => {
    expect(withActivePlayers([], [player("A"), player("B")], zero)).toEqual([
      { playerId: "A", goals: 0 },
      { playerId: "B", goals: 0 },
    ]);
  });

  it("keeps real rows and only adds players who have none", () => {
    const rows = [{ playerId: "A", goals: 3 }];
    expect(withActivePlayers(rows, [player("A"), player("B")], zero)).toEqual([
      { playerId: "A", goals: 3 },
      { playerId: "B", goals: 0 },
    ]);
  });
});

describe("positions", () => {
  it("treats a pure netminder as a goalie only", () => {
    expect(playsSkater("Goaltender")).toBe(false);
    expect(playsGoal("Goaltender")).toBe(true);
  });

  it("puts a dual-position netminder in both tables", () => {
    expect(playsSkater("Defence / Goaltender")).toBe(true);
    expect(playsGoal("Defence / Goaltender")).toBe(true);
  });

  it("keeps a skater out of the goalie table", () => {
    expect(playsGoal("Forward / Defence")).toBe(false);
  });
});
