import type { Player, Result } from "~/data/types";
import { getGameWinningGoalScorerId } from "./game-helpers";

/**
 * Club records for the Records page: the top three for every record, so each
 * card reads like a leaderboard rather than a single name. Everything is
 * computed from the game sheets (results) and the per-season player totals.
 *
 * Goal clocks in the feed run across the whole game (a 2nd-period goal can be
 * at minute 32), so game time in seconds is simply minute * 60 + second.
 */

export type RecordEntry = {
  playerId: string;
  name: string;
  /** Sort key. Higher is better unless the record is "fewest/fastest". */
  score: number;
  /** What the card prints, e.g. "5" or "0:09". */
  value: string;
  /** Where it was set: "v Slough Jets · 9 Aug 2026", "25/26 · 22 GP", "55 GP". */
  context: string;
};

export type RecordCard = {
  title: string;
  /** Optional qualifier printed after the title ("From opening face-off"). */
  note?: string;
  top: RecordEntry[];
};

export type RecordGroup = { label: string; records: RecordCard[] };
export type RecordSet = { id: string; title: string; note: string; groups: RecordGroup[] };

const TOP = 3;

// ── Small helpers ─────────────────────────────────────────────────────────────

const PERIOD_NAMES = ["1st", "2nd", "3rd"];

function periodsOf(game: Result) {
  return [game.score.period.one, game.score.period.two, game.score.period.three];
}

function gameSeconds(goal: { minute: number; second: number }) {
  return goal.minute * 60 + goal.second;
}

function clock(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function periodOf(seconds: number) {
  return PERIOD_NAMES[Math.min(2, Math.floor(seconds / 1200))];
}

function shortDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function gameContext(game: Result) {
  return `v ${game.opponentTeam} · ${shortDate(game.date)}`;
}

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

/**
 * Best TOP entries. Ties keep the order the candidates came in, which callers
 * make chronological, so whoever set a mark first ranks above a later equal.
 */
function rank(entries: RecordEntry[], direction: "high" | "low" = "high"): RecordEntry[] {
  return entries
    .filter((e) => (direction === "high" ? e.score > 0 : Number.isFinite(e.score)))
    .map((e, i) => ({ e, i }))
    .sort((a, b) => (direction === "high" ? b.e.score - a.e.score : a.e.score - b.e.score) || a.i - b.i)
    .slice(0, TOP)
    .map(({ e }) => e);
}

function chronological(results: Result[]) {
  return [...results].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function seasonOrder(a: string, b: string) {
  return parseInt(a.split("/")[0], 10) - parseInt(b.split("/")[0], 10);
}

// ── Per-game tallies ──────────────────────────────────────────────────────────

type GameLine = { goals: number; assists: number; pims: number; goalTimes: number[] };

function tallyGame(game: Result): Map<string, GameLine> {
  const lines = new Map<string, GameLine>();
  const line = (id: string) => {
    let l = lines.get(id);
    if (!l) lines.set(id, (l = { goals: 0, assists: 0, pims: 0, goalTimes: [] }));
    return l;
  };
  for (const period of periodsOf(game)) {
    for (const goal of period.goals ?? []) {
      const l = line(goal.playerId);
      l.goals++;
      l.goalTimes.push(gameSeconds(goal));
      for (const id of goal.assists ?? []) line(id).assists++;
    }
    for (const pen of period.penalties ?? []) line(pen.offender).pims += pen.duration;
  }
  return lines;
}

/** Per player, per season: counts that only the game sheets hold. */
type SheetSeason = { hattricks: number; pp: number; sh: number; gwg: number; shutouts: number; netGames: number };

function tallySheets(results: Result[]) {
  const map = new Map<string, Map<string, SheetSeason>>();
  const get = (id: string, season: string) => {
    let seasons = map.get(id);
    if (!seasons) map.set(id, (seasons = new Map()));
    let s = seasons.get(season);
    if (!s) seasons.set(season, (s = { hattricks: 0, pp: 0, sh: 0, gwg: 0, shutouts: 0, netGames: 0 }));
    return s;
  };
  for (const game of results) {
    const season = game.seasonId;
    for (const [id, l] of tallyGame(game)) if (l.goals >= 3) get(id, season).hattricks++;
    for (const period of periodsOf(game)) {
      for (const goal of period.goals ?? []) {
        if (goal.type === "PP") get(goal.playerId, season).pp++;
        if (goal.type === "SH") get(goal.playerId, season).sh++;
      }
    }
    const gwg = getGameWinningGoalScorerId(game);
    if (gwg) get(gwg, season).gwg++;
    const net = game.netminderPlayerId;
    if (net && net !== "MISSING") {
      get(net, season).netGames++;
      if (game.score.opponentScore === 0) get(net, season).shutouts++;
    }
  }
  return map;
}

// ── Record sets ───────────────────────────────────────────────────────────────

function singleGame(results: Result[], name: (id: string) => string): RecordSet {
  const goals: RecordEntry[] = [];
  const assists: RecordEntry[] = [];
  const points: RecordEntry[] = [];
  const pims: RecordEntry[] = [];
  const fastestGoal: RecordEntry[] = [];
  const fastestHattrick: RecordEntry[] = [];

  for (const game of chronological(results)) {
    const ctx = gameContext(game);
    for (const [id, l] of tallyGame(game)) {
      const base = { playerId: id, name: name(id), context: ctx };
      goals.push({ ...base, score: l.goals, value: String(l.goals) });
      assists.push({ ...base, score: l.assists, value: String(l.assists) });
      points.push({ ...base, score: l.goals + l.assists, value: String(l.goals + l.assists) });
      pims.push({ ...base, score: l.pims, value: String(l.pims) });

      const times = [...l.goalTimes].sort((a, b) => a - b);
      if (times.length > 0) {
        fastestGoal.push({ ...base, score: times[0], value: clock(times[0]), context: `${periodOf(times[0])} period · ${ctx}` });
      }
      if (times.length >= 3) {
        const span = times[2] - times[0];
        const from = periodOf(times[0]);
        const to = periodOf(times[2]);
        fastestHattrick.push({
          ...base,
          score: span,
          value: clock(span),
          context: `${from === to ? from : `${from}–${to}`} period · ${ctx}`,
        });
      }
    }
  }

  return {
    id: "single-game",
    title: "Single game",
    note: "Most in one game",
    groups: [
      {
        label: "Scoring",
        records: [
          { title: "Goals", top: rank(goals) },
          { title: "Assists", top: rank(assists) },
          { title: "Points", top: rank(points) },
          { title: "Penalty minutes", top: rank(pims) },
        ],
      },
      {
        label: "Fastest",
        records: [
          { title: "Fastest goal", note: "From opening face-off", top: rank(fastestGoal, "low") },
          { title: "Fastest hat-trick", note: "First goal to third", top: rank(fastestHattrick, "low") },
        ],
      },
    ],
  };
}

function season(results: Result[], players: Player[], name: (id: string) => string): RecordSet {
  const sheets = tallySheets(results);
  const fromStats = (key: "goals" | "assists" | "points" | "pims" | "manOfTheMatch" | "warriorOfTheGame") => {
    const entries: RecordEntry[] = [];
    for (const p of players) {
      for (const s of [...p.stats].sort((a, b) => seasonOrder(a.season, b.season))) {
        const v = s[key] ?? 0;
        entries.push({ playerId: p.id, name: p.name, score: v, value: String(v), context: `${s.season} · ${s.games} GP` });
      }
    }
    return rank(entries.sort((a, b) => seasonOrder(a.context, b.context)));
  };
  const fromSheets = (key: keyof SheetSeason) => {
    const entries: RecordEntry[] = [];
    for (const [id, seasons] of sheets) {
      const player = players.find((p) => p.id === id);
      for (const [s, t] of seasons) {
        const gp = key === "shutouts" ? t.netGames : player?.stats.find((x) => x.season === s)?.games ?? 0;
        entries.push({ playerId: id, name: name(id), score: t[key], value: String(t[key]), context: `${s} · ${gp} GP` });
      }
    }
    return rank(entries.sort((a, b) => seasonOrder(a.context, b.context)));
  };

  return {
    id: "season",
    title: "Season",
    note: "Most in one season",
    groups: [
      {
        label: "Scoring",
        records: [
          { title: "Goals", top: fromStats("goals") },
          { title: "Assists", top: fromStats("assists") },
          { title: "Points", top: fromStats("points") },
          { title: "Penalty minutes", top: fromStats("pims") },
          { title: "Hat-tricks", top: fromSheets("hattricks") },
          { title: "Power play goals", top: fromSheets("pp") },
          { title: "Short-handed goals", top: fromSheets("sh") },
          { title: "Game-winning goals", top: fromSheets("gwg") },
        ],
      },
      {
        label: "Goaltending and awards",
        records: [
          { title: "Shutouts", top: fromSheets("shutouts") },
          { title: "POTG awards", top: fromStats("manOfTheMatch") },
          { title: "WOTG awards", top: fromStats("warriorOfTheGame") },
        ],
      },
    ],
  };
}

function allTime(results: Result[], players: Player[]): RecordSet {
  const sheets = tallySheets(results);
  const career = players.map((p) => {
    const sum = (k: "games" | "goals" | "assists" | "points" | "pims" | "manOfTheMatch" | "warriorOfTheGame") =>
      p.stats.reduce((n, s) => n + (s[k] ?? 0), 0);
    const sheet = [...(sheets.get(p.id)?.values() ?? [])].reduce(
      (acc, s) => ({
        hattricks: acc.hattricks + s.hattricks,
        pp: acc.pp + s.pp,
        sh: acc.sh + s.sh,
        gwg: acc.gwg + s.gwg,
        shutouts: acc.shutouts + s.shutouts,
        netGames: acc.netGames + s.netGames,
      }),
      { hattricks: 0, pp: 0, sh: 0, gwg: 0, shutouts: 0, netGames: 0 }
    );
    return {
      p,
      seasons: p.stats.filter((s) => s.games > 0).length,
      games: sum("games"),
      goals: sum("goals"),
      assists: sum("assists"),
      points: sum("points"),
      pims: sum("pims"),
      potg: sum("manOfTheMatch"),
      wotg: sum("warriorOfTheGame"),
      ...sheet,
    };
  });
  type Career = (typeof career)[number];
  const top = (value: (c: Career) => number, context: (c: Career) => string = (c) => `${c.games} GP`) =>
    rank(career.map((c) => ({ playerId: c.p.id, name: c.p.name, score: value(c), value: String(value(c)), context: context(c) })));

  return {
    id: "all-time",
    title: "All time",
    note: "Career totals with the club",
    groups: [
      {
        label: "Scoring",
        records: [
          { title: "Games played", top: top((c) => c.games, (c) => plural(c.seasons, "season")) },
          { title: "Career goals", top: top((c) => c.goals) },
          { title: "Career assists", top: top((c) => c.assists) },
          { title: "Career points", top: top((c) => c.points) },
          { title: "Career penalty minutes", top: top((c) => c.pims) },
          { title: "Career power play goals", top: top((c) => c.pp) },
          { title: "Career short-handed goals", top: top((c) => c.sh) },
          { title: "Career hat-tricks", top: top((c) => c.hattricks) },
          { title: "Career game-winning goals", top: top((c) => c.gwg) },
        ],
      },
      {
        label: "Goaltending and awards",
        records: [
          { title: "Career shutouts", top: top((c) => c.shutouts, (c) => `${c.netGames} GP`) },
          { title: "Career POTG awards", top: top((c) => c.potg) },
          { title: "Career WOTG awards", top: top((c) => c.wotg) },
        ],
      },
    ],
  };
}

export function buildRecordSets(results: Result[], players: Player[]): RecordSet[] {
  const names = new Map(players.map((p) => [p.id, p.name]));
  const name = (id: string) => names.get(id) ?? id;
  const games = results.filter((r) => r?.score?.period);
  return [singleGame(games, name), season(games, players, name), allTime(games, players)];
}
