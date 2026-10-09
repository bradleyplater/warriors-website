import { describe, it, expect } from "vitest";
import { currentSeason, seasonHeading, seasonOptions } from "./seasons";

const file = { activeSeason: "26/27", seasons: ["24/25", "25/26", "26/27"] };

describe("seasonOptions", () => {
  it("includes a published season with no games, newest first", () => {
    expect(seasonOptions(file, ["25/26", "24/25"])).toEqual(["26/27", "25/26", "24/25"]);
  });

  it("keeps a season that only the results mention", () => {
    expect(seasonOptions(file, ["23/24"])).toEqual(["26/27", "25/26", "24/25", "23/24"]);
  });

  it("falls back to the results' seasons without a seasons file", () => {
    expect(seasonOptions(null, ["24/25", "25/26"])).toEqual(["25/26", "24/25"]);
  });

  it("sorts an unparseable season last", () => {
    expect(seasonOptions(null, ["Unknown", "25/26"])).toEqual(["25/26", "Unknown"]);
  });
});

describe("currentSeason", () => {
  it("uses the active season even when it has no games", () => {
    expect(currentSeason(file, ["25/26"])).toBe("26/27");
  });

  it("falls back to the newest season with games without a seasons file", () => {
    expect(currentSeason(null, ["24/25", "25/26"])).toBe("25/26");
  });

  it("falls back when the file names no active season", () => {
    expect(currentSeason({ activeSeason: null, seasons: [] }, ["25/26"])).toBe("25/26");
  });

  it("is undefined with nothing to go on", () => {
    expect(currentSeason(null, [])).toBeUndefined();
  });
});

describe("seasonHeading", () => {
  it("expands the short name", () => {
    expect(seasonHeading("26/27")).toBe("2026/27 season");
  });

  it("passes anything else through", () => {
    expect(seasonHeading("Unknown")).toBe("Unknown season");
  });
});
