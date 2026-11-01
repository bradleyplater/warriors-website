import { describe, expect, it } from "vitest";
import type { Award, AwardsEvening, AwardsFile, Player } from "~/data/types";
import {
  awardTotal,
  buildAwardsPage,
  buildRollOfHonour,
  eveningTitle,
  findEvening,
  formatStat,
  fullSeason,
  seasonFromSlug,
  seasonSlug,
  winnerView,
} from "./awards";

const asset = (key: string) => `https://cdn/${key}`;

function player(id: string, name: string, number?: number): Player {
  return { id, name, number: number as number, position: "Forward", stats: [] };
}

const players = [
  player("PLR1", "Bradley Plater", 4),
  player("PLR2", "Josh Turner", 12),
  player("PLR3", "Darren Almond"),
];
const byId = new Map(players.map((p) => [p.id, p]));

function award(overrides: Partial<Award>): Award {
  return { name: "Most valuable player", group: "Most valuable player", winners: [], ...overrides };
}

const categories = [
  { key: "mvp", name: "Most valuable player", group: "Most valuable player" },
  { key: "captain", name: "Captain", group: "Honours" },
  { key: "coaches-player", name: "Coaches’ player of the year", group: "Honours" },
  { key: "most-goals", name: "Most goals", group: "Performance" },
  { key: "best-goalie", name: "Best goalie", group: "Performance" },
];

const pastEvening: AwardsEvening = {
  season: "24/25",
  number: 3,
  status: "announced",
  awards: [
    award({ category: "mvp", winners: [{ playerId: "PLR1" }] }),
    award({ category: "captain", name: "Captain", group: "Honours", winners: [{ playerId: "PLR2" }], note: "Named for 2025/26" }),
    award({ category: "most-goals", name: "Most goals", group: "Performance", stat: "goals", winners: [{ playerId: "PLR1", total: 29 }] }),
    award({ name: "Muffin shot", group: "Club awards", winners: [{ playerId: "PLR3" }] }),
  ],
};

const currentEvening: AwardsEvening = {
  season: "25/26",
  number: 4,
  status: "categories",
  awards: [
    award({ category: "mvp", competition: "LLIHC" }),
    award({ category: "mvp", competition: "BOTB" }),
    award({ category: "most-goals", name: "Most goals", group: "Performance", competition: "BOTB", stat: "goals" }),
    award({ category: "most-goals", name: "Most goals", group: "Performance", competition: "LLIHC", stat: "goals" }),
    award({ category: "coaches-player", name: "Coaches’ player of the year", group: "Honours" }),
  ],
};

const file: AwardsFile = {
  competitions: ["BOTB", "LLIHC"],
  categories,
  evenings: [pastEvening, currentEvening],
};

describe("season helpers", () => {
  it("round-trips a season through its URL form", () => {
    expect(seasonSlug("24/25")).toBe("24-25");
    expect(seasonFromSlug("24-25")).toBe("24/25");
  });

  it("writes the season in full", () => {
    expect(fullSeason("25/26")).toBe("2025/26");
  });

  it("names the evening", () => {
    expect(eveningTitle(4)).toBe("Fourth annual awards evening");
    expect(eveningTitle(12)).toBe("12th annual awards evening");
  });
});

describe("findEvening", () => {
  it("defaults to the newest evening", () => {
    expect(findEvening(file)?.season).toBe("25/26");
  });

  it("finds a past season from its URL form", () => {
    expect(findEvening(file, "24-25")?.season).toBe("24/25");
  });

  it("is null for a season with no evening", () => {
    expect(findEvening(file, "19-20")).toBeNull();
    expect(findEvening({ ...file, evenings: [] })).toBeNull();
  });
});

describe("winnerView", () => {
  it("shows the award's photo when there is one", () => {
    const view = winnerView(
      award({ winners: [{ playerId: "PLR1" }], photo: { key: "awards/x.webp", alt: "On stage" } }),
      byId,
      asset,
    );
    expect(view).toMatchObject({
      state: "photo",
      name: "Bradley Plater",
      photo: { url: "https://cdn/awards/x.webp", alt: "On stage" },
    });
  });

  it("falls back to the shirt: surname and number", () => {
    expect(winnerView(award({ winners: [{ playerId: "PLR1" }] }), byId, asset)).toMatchObject({
      state: "jersey",
      surname: "Plater",
      mark: "4",
    });
  });

  it("uses initials when there's no number on file", () => {
    expect(winnerView(award({ winners: [{ playerId: "PLR3" }] }), byId, asset).mark).toBe("DA");
  });

  it("names every winner of a shared award, on the first one's shirt", () => {
    const view = winnerView(
      award({ winners: [{ playerId: "PLR2" }, { playerId: "PLR1" }] }),
      byId,
      asset,
    );
    expect(view).toMatchObject({ name: "Josh Turner & Bradley Plater", surname: "Turner", mark: "12" });
  });

  it("is to be announced with no winners", () => {
    expect(winnerView(award({}), byId, asset)).toMatchObject({ state: "tba", name: "To be announced" });
  });
});

describe("awardTotal", () => {
  it("is the winner's total, singular for one", () => {
    expect(awardTotal(award({ stat: "goals", winners: [{ playerId: "PLR1", total: 1 }] }))).toEqual({
      value: 1,
      unit: "goal",
    });
  });

  it("is the shared total when the winners tie", () => {
    const shared = award({
      stat: "points",
      winners: [
        { playerId: "PLR1", total: 22 },
        { playerId: "PLR2", total: 22 },
      ],
    });
    expect(awardTotal(shared)).toEqual({ value: 22, unit: "points" });
  });

  it("is absent when hidden, mismatched or not a stat award", () => {
    expect(awardTotal(award({ stat: "goals", winners: [{ playerId: "PLR1" }] }))).toBeNull();
    expect(
      awardTotal(
        award({
          stat: "points",
          winners: [
            { playerId: "PLR1", total: 25 },
            { playerId: "PLR2", total: 22 },
          ],
        }),
      ),
    ).toBeNull();
    expect(awardTotal(award({ winners: [{ playerId: "PLR1" }] }))).toBeNull();
  });

  it("formats a total on its own", () => {
    expect(formatStat(29, "goals")).toBe("29 goals");
  });
});

describe("buildAwardsPage", () => {
  it("puts both MVPs first, in competition order, with the split awards beside each other", () => {
    const page = buildAwardsPage(file, currentEvening, players, asset);

    expect(page.full).toBe("2025/26");
    expect(page.title).toBe("Fourth annual awards evening");
    expect(page.announced).toBe(false);
    expect(page.mvps.map((mvp) => [mvp.label, mvp.winner.state])).toEqual([
      ["BOTB", "tba"],
      ["LLIHC", "tba"],
    ]);
    expect(page.competitions.map((c) => [c.label, c.id, c.count])).toEqual([
      ["BOTB", "comp-botb", 1],
      ["LLIHC", "comp-llihc", 1],
    ]);
    expect(page.clubWide).toEqual([
      { name: "Honours", awards: [expect.objectContaining({ name: "Coaches’ player of the year" })] },
    ]);
    expect(page.club).toEqual([]);
  });

  it("shows an older, unsplit season as one MVP, club-wide groups and club awards", () => {
    const page = buildAwardsPage(file, pastEvening, players, asset);

    expect(page.mvps).toEqual([expect.objectContaining({ label: null })]);
    expect(page.competitions).toEqual([]);
    expect(page.clubWide.map((group) => group.name)).toEqual(["Honours", "Performance"]);
    expect(page.clubWide[1]?.awards[0]?.total).toEqual({ value: 29, unit: "goals" });
    expect(page.clubWide[0]?.awards[0]?.note).toBe("Named for 2025/26");
    expect(page.club.map((a) => a.name)).toEqual(["Muffin shot"]);
  });

  it("lists every season newest first, marking the one shown", () => {
    const page = buildAwardsPage(file, pastEvening, players, asset);
    expect(page.seasons).toEqual([
      { season: "25/26", full: "2025/26", slug: "25-26", current: false },
      { season: "24/25", full: "2024/25", slug: "24-25", current: true },
    ]);
  });
});

describe("buildRollOfHonour", () => {
  const roll = buildRollOfHonour(file, players);

  it("has a column per season, newest first, split where that season was split", () => {
    expect(roll.columns.map((c) => [c.full, c.competitions])).toEqual([
      ["2025/26", ["BOTB", "LLIHC"]],
      ["2024/25", []],
    ]);
  });

  it("groups recurring awards and leaves out ones never awarded", () => {
    expect(roll.groups.map((g) => [g.name, g.rows.map((r) => r.name)])).toEqual([
      ["Most valuable player", ["Most valuable player"]],
      ["Honours", ["Captain", "Coaches’ player of the year"]],
      ["Performance", ["Most goals"]],
    ]);
  });

  it("fills split, spanning and single cells", () => {
    const [mvp] = roll.groups[0]!.rows;
    expect(mvp?.entries).toEqual([
      { kind: "split", cells: [{ who: "To be announced" }, { who: "To be announced" }] },
      { kind: "single", cell: { who: "Bradley Plater" } },
    ]);

    const coaches = roll.groups[1]!.rows[1];
    expect(coaches?.entries[0]).toEqual({ kind: "span", cell: { who: "To be announced" } });
    expect(coaches?.entries[1]).toEqual({ kind: "single", cell: null });
  });

  it("adds a total or note under a winner", () => {
    const captain = roll.groups[1]!.rows[0];
    expect(captain?.entries[1]).toEqual({
      kind: "single",
      cell: { who: "Josh Turner", sub: "Named for 2025/26" },
    });
    const goals = roll.groups[2]!.rows[0];
    expect(goals?.entries[1]).toEqual({
      kind: "single",
      cell: { who: "Bradley Plater", sub: "29 goals" },
    });
  });
});
