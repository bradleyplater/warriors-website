import type { Award, AwardsEvening, AwardsFile, Player } from "~/data/types";

/** "24/25" ⇄ "24-25", the season's form in a URL. */
export function seasonSlug(season: string): string {
  return season.replace("/", "-");
}

export function seasonFromSlug(slug: string): string {
  return slug.replace("-", "/");
}

/** "25/26" → "2025/26". */
export function fullSeason(season: string): string {
  return `20${season}`;
}

const ORDINALS = [
  "First", "Second", "Third", "Fourth", "Fifth",
  "Sixth", "Seventh", "Eighth", "Ninth", "Tenth",
];

/** "Fourth annual awards evening". */
export function eveningTitle(number: number): string {
  const ordinal = ORDINALS[number - 1] ?? `${number}th`;
  return `${ordinal} annual awards evening`;
}

/** The evening a URL asks for, or the newest when it names none. Null for
 *  a season with no published evening. */
export function findEvening(file: AwardsFile, slug?: string): AwardsEvening | null {
  if (slug === undefined) {
    return file.evenings.at(-1) ?? null;
  }
  const season = seasonFromSlug(slug);
  return file.evenings.find((evening) => evening.season === season) ?? null;
}

/** One award's winner as the page shows them: their photo from the night,
 *  else the back of their shirt (surname and number, or initials), else
 *  "To be announced". A shared award shows every name, and the first
 *  winner's shirt. */
export interface WinnerView {
  state: "photo" | "jersey" | "tba";
  name: string;
  surname: string;
  mark: string;
  photo?: { url: string; alt: string };
  /** For linking to player pages. */
  playerIds: string[];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.charAt(0) ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]!.charAt(0) : "";
  return (first + last).toUpperCase();
}

export function winnerView(
  award: Award,
  players: Map<string, Player>,
  assetUrl: (key: string) => string,
): WinnerView {
  if (award.winners.length === 0) {
    return { state: "tba", name: "To be announced", surname: "", mark: "", playerIds: [] };
  }
  const named = award.winners.map(({ playerId }) => ({
    playerId,
    player: players.get(playerId),
  }));
  const name = named.map(({ player }) => player?.name ?? "Unknown player").join(" & ");
  const first = named[0]!.player;
  const firstName = first?.name ?? "";
  return {
    state: award.photo ? "photo" : "jersey",
    name,
    surname: firstName.trim().split(/\s+/).at(-1) ?? "",
    mark: first?.number ? String(first.number) : initials(firstName),
    ...(award.photo && { photo: { url: assetUrl(award.photo.key), alt: award.photo.alt } }),
    playerIds: named.map(({ playerId }) => playerId),
  };
}

/** "1 goal", "29 goals". */
export function formatStat(value: number, stat: NonNullable<Award["stat"]>): string {
  return `${value} ${value === 1 ? stat.slice(0, -1) : stat}`;
}

/** The figure beside a stat award: the winner's total, or for a shared
 *  award the total they share. None when the portal hides it or the
 *  winners' totals differ. */
export function awardTotal(award: Award): { value: number; unit: string } | null {
  if (!award.stat || award.winners.length === 0) return null;
  const totals = award.winners.map((winner) => winner.total);
  const [first] = totals;
  if (first === undefined || totals.some((total) => total !== first)) return null;
  return { value: first, unit: first === 1 ? award.stat.slice(0, -1) : award.stat };
}

export interface AwardView {
  name: string;
  winner: WinnerView;
  total: { value: number; unit: string } | null;
  note?: string;
}

export interface AwardGroup {
  name: string;
  awards: AwardView[];
}

export interface CompetitionView {
  label: string;
  /** "comp-botb". */
  id: string;
  groups: AwardGroup[];
  count: number;
}

export interface SeasonLink {
  season: string;
  full: string;
  slug: string;
  current: boolean;
}

export interface AwardsPageView {
  full: string;
  title: string;
  announced: boolean;
  seasons: SeasonLink[];
  /** One per competition, or a single club-wide MVP. */
  mvps: { label: string | null; winner: WinnerView }[];
  competitions: CompetitionView[];
  /** Recurring awards that cover both competitions, by group. */
  clubWide: AwardGroup[];
  /** One-off club awards. */
  club: AwardView[];
}

const MVP = "mvp";

function groupAwards(
  awards: Award[],
  groupOrder: string[],
  view: (award: Award) => AwardView,
): AwardGroup[] {
  const groups = new Map<string, AwardView[]>();
  for (const award of awards) {
    groups.set(award.group, [...(groups.get(award.group) ?? []), view(award)]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => groupOrder.indexOf(a) - groupOrder.indexOf(b))
    .map(([name, views]) => ({ name, awards: views }));
}

export function buildAwardsPage(
  file: AwardsFile,
  evening: AwardsEvening,
  players: Player[],
  assetUrl: (key: string) => string,
): AwardsPageView {
  const byId = new Map(players.map((player) => [player.id, player]));
  const groupOrder = [...new Set(file.categories.map((category) => category.group))];
  const view = (award: Award): AwardView => ({
    name: award.name,
    winner: winnerView(award, byId, assetUrl),
    total: awardTotal(award),
    ...(award.note && { note: award.note }),
  });

  const mvpAwards = evening.awards
    .filter((award) => award.category === MVP)
    .sort(
      (a, b) =>
        file.competitions.indexOf(a.competition ?? "") -
        file.competitions.indexOf(b.competition ?? ""),
    );
  const rest = evening.awards.filter((award) => award.category !== MVP);

  const competitions = file.competitions
    .map((label) => {
      const awards = rest.filter((award) => award.competition === label);
      return {
        label,
        id: `comp-${label.toLowerCase()}`,
        groups: groupAwards(awards, groupOrder, view),
        count: awards.length,
      };
    })
    .filter((competition) => competition.count > 0);

  return {
    full: fullSeason(evening.season),
    title: eveningTitle(evening.number),
    announced: evening.status === "announced",
    seasons: [...file.evenings].reverse().map(({ season }) => ({
      season,
      full: fullSeason(season),
      slug: seasonSlug(season),
      current: season === evening.season,
    })),
    mvps: mvpAwards.map((award) => ({
      label: award.competition ?? null,
      winner: winnerView(award, byId, assetUrl),
    })),
    competitions,
    clubWide: groupAwards(
      rest.filter((award) => award.category && !award.competition),
      groupOrder,
      view,
    ),
    club: rest.filter((award) => !award.category).map(view),
  };
}

/** One cell of the roll of honour: who won, with a small line under
 *  them (a stat total or the award's note). Null when not awarded. */
export interface RollCell {
  who: string;
  sub?: string;
}

export interface RollColumn {
  season: string;
  full: string;
  slug: string;
  /** Competition sub-columns for a season whose awards are split. */
  competitions: string[];
}

export type RollEntry =
  | { kind: "single"; cell: RollCell | null }
  | { kind: "split"; cells: (RollCell | null)[] }
  | { kind: "span"; cell: RollCell };

export interface RollRow {
  name: string;
  entries: RollEntry[];
}

export interface RollGroup {
  name: string;
  rows: RollRow[];
}

function rollCell(awards: Award[], players: Map<string, Player>, announced: boolean): RollCell | null {
  if (awards.length === 0) return null;
  if (!announced || awards.every((award) => award.winners.length === 0)) {
    return { who: "To be announced" };
  }
  const who = awards
    .flatMap((award) => award.winners)
    .map(({ playerId }) => players.get(playerId)?.name ?? "Unknown player")
    .join(", ");
  const total = awards.length === 1 ? awardTotal(awards[0]!) : null;
  const sub = total ? `${total.value} ${total.unit}` : awards[0]?.note;
  return { who, ...(sub && { sub }) };
}

/** Every recurring award, season by season, newest first. A season whose
 *  awards are split by competition gets a sub-column for each; an award
 *  that season gives club-wide spans them. */
export function buildRollOfHonour(
  file: AwardsFile,
  players: Player[],
): { columns: RollColumn[]; groups: RollGroup[] } {
  const byId = new Map(players.map((player) => [player.id, player]));
  const evenings = [...file.evenings].reverse();
  const columns = evenings.map((evening) => ({
    season: evening.season,
    full: fullSeason(evening.season),
    slug: seasonSlug(evening.season),
    competitions: file.competitions.filter((label) =>
      evening.awards.some((award) => award.competition === label),
    ),
  }));

  const groups: RollGroup[] = [];
  for (const category of file.categories) {
    const entries: RollEntry[] = evenings.map((evening, index) => {
      const awards = evening.awards.filter((award) => award.category === category.key);
      const announced = evening.status === "announced";
      const split = columns[index]!.competitions;
      if (split.length === 0) {
        return { kind: "single", cell: rollCell(awards, byId, announced) };
      }
      const clubWide = awards.filter((award) => !award.competition);
      if (clubWide.length > 0) {
        return { kind: "span", cell: rollCell(clubWide, byId, announced)! };
      }
      return {
        kind: "split",
        cells: split.map((label) =>
          rollCell(
            awards.filter((award) => award.competition === label),
            byId,
            announced,
          ),
        ),
      };
    });
    const awarded = entries.some((entry) =>
      entry.kind === "split" ? entry.cells.some(Boolean) : entry.cell !== null,
    );
    if (!awarded) continue;

    const row = { name: category.name, entries };
    const group = groups.find((existing) => existing.name === category.group);
    if (group) group.rows.push(row);
    else groups.push({ name: category.group, rows: [row] });
  }
  return { columns, groups };
}
