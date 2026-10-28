import { useState } from "react";
import { Link, useParams } from "react-router";
import type { Route } from "./+types/player";
import { getPlayers, getResults } from "~/data/client";
import { Badge } from "~/components/ds/Badge";
import { Stripe } from "~/components/ds/Stripe";
import {
  getNumberOfGWGoalsForPlayer,
  getNumberOfPPGoalsForPlayer,
  getNumberOfSHGoalsForPlayer,
} from "~/helpers/data-helpers";
import {
  getAssistsForOneGame,
  getGameWinningGoalScorerId,
  getGoalsForOneGame,
  getPimsForOneGame,
  getPlayerMilestones,
  type PlayerMilestones,
} from "~/helpers/game-helpers";
import {
  ALL_TIME,
  getBreakdownSeasons,
  getPlayerBreakdown,
  OTHER_THRESHOLD,
  percent,
  perGame,
  sortOpponents,
  type OpponentLine,
  type OpponentSort,
  type PeriodLine,
} from "~/helpers/player-breakdown";
import type { Result } from "~/data/types";
import type { Season } from "~/types/season";
import "./player.css";
import { seoMeta } from "~/helpers/seo";

type PlayerStat = {
  season: string;
  games: number;
  goals: number;
  assists: number;
  pims: number;
  points: number;
  manOfTheMatch?: number;
  warriorOfTheGame?: number;
};

type Player = {
  id: string;
  name: string;
  nickname?: string;
  number: number;
  position: string;
  stats: PlayerStat[];
};

const playerImageModules = import.meta.glob("/public/images/players/*.jpg", {
  eager: true,
});
const PLAYER_IMAGE_IDS = new Set(
  Object.keys(playerImageModules).map((path) =>
    path.split("/").pop()!.replace(".jpg", "")
  )
);

export function meta({ params, data }: Route.MetaArgs) {
  const players = data?.players as Player[] | undefined;
  const player = players?.find((p) => p.id === params.playerId);
  return seoMeta({
    path: `/roster/${params.playerId}`,
    title: player ? `${player.name} — Peterborough Warriors` : "Player — Peterborough Warriors",
    description: player
      ? `${player.name}, #${player.number} for the Peterborough Warriors: career and season stats, recent games and milestones.`
      : "A Peterborough Warriors player's career and season stats.",
  });
}

export async function clientLoader() {
  const [players, results] = await Promise.all([
    getPlayers<unknown[]>(),
    getResults<unknown[]>(),
  ]);
  return { players, results };
}

// ── Career stat calculation ───────────────────────────────────────────────────

type StatTotals = {
  games: number;
  goals: number;
  assists: number;
  points: number;
  pims: number;
  motm: number;
  wotg: number;
  ppGoals: number;
  shGoals: number;
  gwGoals: number;
  pointsPerGame: string;
};

function getCareerTotals(player: Player, allResults: Result[]): StatTotals {
  const base = player.stats.reduce(
    (acc, s) => ({
      games: acc.games + (s.games ?? 0),
      goals: acc.goals + (s.goals ?? 0),
      assists: acc.assists + (s.assists ?? 0),
      points: acc.points + (s.points ?? 0),
      pims: acc.pims + (s.pims ?? 0),
      motm: acc.motm + (s.manOfTheMatch ?? 0),
      wotg: acc.wotg + (s.warriorOfTheGame ?? 0),
    }),
    { games: 0, goals: 0, assists: 0, points: 0, pims: 0, motm: 0, wotg: 0 }
  );

  return {
    ...base,
    ppGoals: getNumberOfPPGoalsForPlayer(player.id, allResults),
    shGoals: getNumberOfSHGoalsForPlayer(player.id, allResults),
    gwGoals: getNumberOfGWGoalsForPlayer(player.id, allResults),
    pointsPerGame: base.games > 0 ? (base.points / base.games).toFixed(2) : "-",
  };
}

/** Career points, from the player's own season lines only — cheap enough to run
    across the whole squad for the "leading scorer" badge. */
function careerPoints(player: Player): number {
  return player.stats.reduce((n, s) => n + (s.points ?? 0), 0);
}

type SeasonRow = {
  season: string;
  games: number;
  goals: number;
  assists: number;
  points: number;
  pims: number;
  pointsPerGame: string;
  ppGoals: number;
  shGoals: number;
  gwGoals: number;
  motm: number;
  wotg: number;
};

function getSeasonRows(player: Player, allResults: Result[]): SeasonRow[] {
  const rows = player.stats.map((s) => {
    const season = s.season as Season;
    const games = s.games ?? 0;
    const points = s.points ?? 0;
    return {
      season: s.season,
      games,
      goals: s.goals ?? 0,
      assists: s.assists ?? 0,
      points,
      pims: s.pims ?? 0,
      motm: s.manOfTheMatch ?? 0,
      wotg: s.warriorOfTheGame ?? 0,
      pointsPerGame: games > 0 ? (points / games).toFixed(2) : "-",
      ppGoals: getNumberOfPPGoalsForPlayer(player.id, allResults, season),
      shGoals: getNumberOfSHGoalsForPlayer(player.id, allResults, season),
      gwGoals: getNumberOfGWGoalsForPlayer(player.id, allResults, season),
    };
  });

  return rows.sort((a, b) => {
    const aYear = parseInt(a.season.split("/")[0], 10);
    const bYear = parseInt(b.season.split("/")[0], 10);
    return bYear - aYear;
  });
}

// ── Recent form calculation ───────────────────────────────────────────────────

type GameRow = {
  date: string;
  opponent: string;
  location: "HOME" | "AWAY";
  competition?: string;
  result: "W" | "L" | "D";
  score: string;
  goals: number;
  assists: number;
  points: number;
  pims: number;
  ppGoals: number;
  shGoals: number;
  gwGoals: number;
  motm: number;
  wotg: number;
};

function getAllGoalsInGame(game: Result, playerId: string) {
  return [
    ...game.score.period.one.goals,
    ...game.score.period.two.goals,
    ...game.score.period.three.goals,
  ].filter((g) => g.playerId === playerId);
}

function getRecentGames(playerId: string, allResults: Result[], count = 5): GameRow[] {
  const playerGames = allResults
    .filter((r) => Array.isArray(r.roster) && r.roster.includes(playerId))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count);

  return playerGames.map((game) => {
    const { warriorsScore, opponentScore } = game.score;
    const result: "W" | "L" | "D" =
      warriorsScore > opponentScore
        ? "W"
        : warriorsScore < opponentScore
        ? "L"
        : "D";

    const goals = getGoalsForOneGame(game, playerId);
    const assists = getAssistsForOneGame(game, playerId);
    const pims = getPimsForOneGame(game, playerId);
    const playerGoals = getAllGoalsInGame(game, playerId);
    const ppGoals = playerGoals.filter((g) => g.type === "PP").length;
    const shGoals = playerGoals.filter((g) => g.type === "SH").length;
    const gwGoals = getGameWinningGoalScorerId(game) === playerId ? 1 : 0;
    const motm =
      game.manOfTheMatchPlayerId === playerId &&
      game.manOfTheMatchPlayerId !== "MISSING"
        ? 1
        : 0;
    const wotg =
      game.warriorOfTheGamePlayerId === playerId &&
      game.warriorOfTheGamePlayerId !== "MISSING"
        ? 1
        : 0;

    return {
      date: game.date,
      opponent: game.opponentTeam,
      location: game.location,
      competition: game.competition,
      result,
      score: `${warriorsScore}–${opponentScore}`,
      goals,
      assists,
      points: goals + assists,
      pims,
      ppGoals,
      shGoals,
      gwGoals,
      motm,
      wotg,
    };
  });
}

function getRecentTotals(games: GameRow[]): StatTotals {
  const totals = games.reduce(
    (acc, g) => ({
      games: acc.games + 1,
      goals: acc.goals + g.goals,
      assists: acc.assists + g.assists,
      points: acc.points + g.points,
      pims: acc.pims + g.pims,
      ppGoals: acc.ppGoals + g.ppGoals,
      shGoals: acc.shGoals + g.shGoals,
      gwGoals: acc.gwGoals + g.gwGoals,
      motm: acc.motm + g.motm,
      wotg: acc.wotg + g.wotg,
    }),
    {
      games: 0,
      goals: 0,
      assists: 0,
      points: 0,
      pims: 0,
      ppGoals: 0,
      shGoals: 0,
      gwGoals: 0,
      motm: 0,
      wotg: 0,
    }
  );
  return {
    ...totals,
    pointsPerGame: totals.games > 0 ? (totals.points / totals.games).toFixed(2) : "-",
  };
}

// ── Records ───────────────────────────────────────────────────────────────────

type RecordEntry = { value: number; date: string; opponent: string };

type SingleGameRecords = {
  goals: RecordEntry;
  assists: RecordEntry;
  points: RecordEntry;
  pims: RecordEntry;
};

function getSingleGameRecords(games: GameRow[]): SingleGameRecords {
  const empty: RecordEntry = { value: 0, date: "", opponent: "" };
  const rec = { goals: { ...empty }, assists: { ...empty }, points: { ...empty }, pims: { ...empty } };
  for (const game of games) {
    if (game.goals > rec.goals.value) rec.goals = { value: game.goals, date: game.date, opponent: game.opponent };
    if (game.assists > rec.assists.value) rec.assists = { value: game.assists, date: game.date, opponent: game.opponent };
    if (game.points > rec.points.value) rec.points = { value: game.points, date: game.date, opponent: game.opponent };
    if (game.pims > rec.pims.value) rec.pims = { value: game.pims, date: game.date, opponent: game.opponent };
  }
  return rec;
}

type StreakRecord = { length: number; startDate: string; endDate: string };

function getLongestStreak(games: GameRow[], predicate: (g: GameRow) => boolean): StreakRecord {
  let best: StreakRecord = { length: 0, startDate: "", endDate: "" };
  let cur: StreakRecord = { length: 0, startDate: "", endDate: "" };
  for (const game of games) {
    if (predicate(game)) {
      cur = cur.length === 0
        ? { length: 1, startDate: game.date, endDate: game.date }
        : { ...cur, length: cur.length + 1, endDate: game.date };
      if (cur.length > best.length) best = { ...cur };
    } else {
      cur = { length: 0, startDate: "", endDate: "" };
    }
  }
  return best;
}

type AllStreaks = {
  goal: StreakRecord;
  assist: StreakRecord;
  point: StreakRecord;
  pim: StreakRecord;
  winning: StreakRecord;
  unbeaten: StreakRecord;
  losing: StreakRecord;
};

function getAllStreaks(games: GameRow[]): AllStreaks {
  const chrono = [...games].reverse(); // oldest → newest
  return {
    goal: getLongestStreak(chrono, (g) => g.goals > 0),
    assist: getLongestStreak(chrono, (g) => g.assists > 0),
    point: getLongestStreak(chrono, (g) => g.points > 0),
    pim: getLongestStreak(chrono, (g) => g.pims > 0),
    winning: getLongestStreak(chrono, (g) => g.result === "W"),
    unbeaten: getLongestStreak(chrono, (g) => g.result === "W" || g.result === "D"),
    losing: getLongestStreak(chrono, (g) => g.result === "L"),
  };
}

// ── Note tags ─────────────────────────────────────────────────────────────────

type NoteTag = "1st Goal" | "1st Assist" | "1st Hat-trick" | "Hat-trick" | "Multi-point" | "GWG" | "MOTM" | "WOTG";

const NOTE_CLASS: Record<NoteTag, string> = {
  "1st Goal": "milestone",
  "1st Assist": "milestone",
  "1st Hat-trick": "milestone",
  "Hat-trick": "hattrick",
  "Multi-point": "multipoint",
  "GWG": "gwg",
  "MOTM": "motm",
  "WOTG": "wotg",
};

function getNoteTags(game: GameRow, milestones: PlayerMilestones): NoteTag[] {
  const tags: NoteTag[] = [];
  if (game.date === milestones.firstGoalGameDate) tags.push("1st Goal");
  if (game.date === milestones.firstAssistGameDate) tags.push("1st Assist");
  if (game.date === milestones.firstHattrickGameDate) tags.push("1st Hat-trick");
  if (game.goals >= 3 && game.date !== milestones.firstHattrickGameDate) tags.push("Hat-trick");
  if (game.goals < 3 && game.points >= 2) tags.push("Multi-point");
  if (game.gwGoals > 0) tags.push("GWG");
  if (game.motm > 0) tags.push("MOTM");
  if (game.wotg > 0) tags.push("WOTG");
  return tags;
}

// ── Formatting ────────────────────────────────────────────────────────────────

function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });
}

const OUTCOME_WORD: Record<GameRow["result"], string> = {
  W: "won",
  L: "lost",
  D: "drew",
};

/** "Home · 22 Aug 26 · won 4–2 (cup)" — the sub-line under an opponent name. */
function gameMetaLine(game: GameRow): string {
  const where = game.location === "HOME" ? "Home" : "Away";
  const outcome = `${OUTCOME_WORD[game.result]} ${game.score}`;
  const parts = [where, formatShortDate(game.date), outcome];
  return game.competition ? `${parts.join(" · ")} (${game.competition})` : parts.join(" · ");
}

const ORDINALS = [
  "",
  "First",
  "Second",
  "Third",
  "Fourth",
  "Fifth",
  "Sixth",
  "Seventh",
  "Eighth",
  "Ninth",
  "Tenth",
];

function seasonCountLabel(n: number): string {
  return n > 0 && n < ORDINALS.length ? `${ORDINALS[n]} season` : `${n} seasons`;
}

// ── Components ────────────────────────────────────────────────────────────────

function SilhouetteFallback() {
  return (
    <div className="player-photo-fallback">
      <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="32" r="22" fill="currentColor" />
        <path d="M10 120 C10 80 90 80 90 120Z" fill="currentColor" />
      </svg>
    </div>
  );
}

type Stat = { label: string; value: number | string };

function StatGrid({ stats, size }: { stats: Stat[]; size?: "lg" }) {
  return (
    <div className="player-stat-grid" data-size={size}>
      {stats.map((stat) => (
        <div key={stat.label} className="player-stat">
          <span className="player-stat-value">{stat.value}</span>
          <span className="t-label player-stat-label">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}

function SectionHeader({ title, aside }: { title: string; aside?: string }) {
  return (
    <div className="player-section-header">
      <h2 className="t-heading player-section-title">{title}</h2>
      {aside ? <span className="t-label player-section-aside">{aside}</span> : null}
    </div>
  );
}

function RecordCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="player-record-card">
      <span className="player-record-value">{value > 0 ? value : "–"}</span>
      <span className="t-label player-record-label">{label}</span>
      {value > 0 && sub && <span className="player-record-sub">{sub}</span>}
    </div>
  );
}

function RecordsTab({ games }: { games: GameRow[] }) {
  const records = getSingleGameRecords(games);
  const streaks = getAllStreaks(games);

  const gameSub = (e: RecordEntry) =>
    e.date ? `vs ${e.opponent}, ${formatShortDate(e.date)}` : undefined;

  const streakSub = (s: StreakRecord) => {
    if (!s.startDate) return undefined;
    if (s.startDate === s.endDate) return formatShortDate(s.startDate);
    return `${formatShortDate(s.startDate)} – ${formatShortDate(s.endDate)}`;
  };

  return (
    <>
      <section className="player-section">
        <SectionHeader title="Single game records" aside="Best in one game" />
        <div className="player-record-grid">
          <RecordCard label="Most goals" value={records.goals.value} sub={gameSub(records.goals)} />
          <RecordCard label="Most assists" value={records.assists.value} sub={gameSub(records.assists)} />
          <RecordCard label="Most points" value={records.points.value} sub={gameSub(records.points)} />
          <RecordCard label="Most PIM" value={records.pims.value} sub={gameSub(records.pims)} />
        </div>
      </section>

      <section className="player-section">
        <SectionHeader title="Longest streaks" aside="Consecutive games" />
        <div className="player-record-grid">
          <RecordCard label="Goal streak" value={streaks.goal.length} sub={streakSub(streaks.goal)} />
          <RecordCard label="Assist streak" value={streaks.assist.length} sub={streakSub(streaks.assist)} />
          <RecordCard label="Point streak" value={streaks.point.length} sub={streakSub(streaks.point)} />
          <RecordCard label="PIM streak" value={streaks.pim.length} sub={streakSub(streaks.pim)} />
          <RecordCard label="Winning streak" value={streaks.winning.length} sub={streakSub(streaks.winning)} />
          <RecordCard label="Unbeaten streak" value={streaks.unbeaten.length} sub={streakSub(streaks.unbeaten)} />
          <RecordCard label="Losing streak" value={streaks.losing.length} sub={streakSub(streaks.losing)} />
        </div>
      </section>
    </>
  );
}

function GameLogTable({ games, milestones }: { games: GameRow[]; milestones: PlayerMilestones }) {
  if (games.length === 0) return <p className="player-empty">No games found.</p>;

  return (
    <div className="season-table-wrap">
      <table className="season-table">
        <thead>
          <tr>
            <th className="col-season">Date</th>
            <th className="col-opponent">Opponent</th>
            <th>Result</th>
            <th title="Goals">G</th>
            <th title="Assists">A</th>
            <th title="Points">PTS</th>
            <th title="Penalties in minutes">PIM</th>
            <th title="Power play goals">PPG</th>
            <th title="Short handed goals">SHG</th>
            <th className="col-notes">Notes</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game, i) => {
            const tags = getNoteTags(game, milestones);
            return (
              <tr key={i}>
                <td className="col-season">{formatShortDate(game.date)}</td>
                <td className="col-opponent">{game.opponent}</td>
                <td>
                  <span className={`result-badge result-${game.result.toLowerCase()}`}>
                    {game.result} {game.score}
                  </span>
                </td>
                <td>{game.goals}</td>
                <td>{game.assists}</td>
                <td className="col-pts">{game.points}</td>
                <td>{game.pims}</td>
                <td>{game.ppGoals}</td>
                <td>{game.shGoals}</td>
                <td className="col-notes">
                  <div className="note-tags">
                    {tags.map((tag) => (
                      <span key={tag} className={`note-tag note-tag-${NOTE_CLASS[tag]}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** The design's "last five games" list — one row per game, result chip first. */
function RecentGamesList({ games }: { games: GameRow[] }) {
  if (games.length === 0) return <p className="player-empty">No games played yet.</p>;

  return (
    <ul className="player-game-list">
      {games.map((game, i) => (
        <li key={i} className="player-game-row">
          <span
            className="t-data player-game-result"
            data-result={game.result.toLowerCase()}
            aria-hidden="true"
          >
            {game.result}
          </span>
          <div className="player-game-copy">
            <span className="player-game-opponent">{game.opponent}</span>
            <span className="t-label player-game-meta">{gameMetaLine(game)}</span>
          </div>
          <span className="t-data player-game-line">
            {game.goals} · {game.assists} · {game.pims}
          </span>
        </li>
      ))}
    </ul>
  );
}

// ── Breakdown ─────────────────────────────────────────────────────────────────

/** Stacked goals-and-assists columns, one per period, scaled to the best one. */
function PeriodChart({ periods }: { periods: PeriodLine[] }) {
  const max = Math.max(...periods.map((p) => p.points), 1);
  const label = periods
    .map((p) => `${p.label} ${p.goals} goals and ${p.assists} assists`)
    .join(", ");
  return (
    <div className="ds-barchart breakdown-chart" role="img" aria-label={`Points by period: ${label}`}>
      {periods.map((p) => (
        <div key={p.label} className="ds-barchart-col">
          <div className="ds-barchart-plot">
            <span className="ds-barchart-value">{p.points}</span>
            <div className="breakdown-stack" style={{ height: `${(p.points / max) * 86}%` }}>
              <div style={{ flex: p.assists, background: "var(--series-2)" }} />
              <div style={{ flex: p.goals, background: "var(--series-1)" }} />
            </div>
          </div>
          <span className="ds-barchart-label">{p.label}</span>
        </div>
      ))}
    </div>
  );
}

function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="breakdown-legend t-label">
      {items.map((item) => (
        <span key={item.label}>
          <i style={{ background: item.color }} aria-hidden="true" />
          {item.label}
        </span>
      ))}
    </div>
  );
}

/** The opponent bars run on a fixed 0–2.00 P/GP scale so they compare across
    seasons; anything beyond fills the bar. */
const METER_MAX = 2;
const meterPercent = (ppg: number) => Math.min(100, (ppg / METER_MAX) * 100);

const OPPONENT_SORTS: { id: OpponentSort; label: string }[] = [
  { id: "ppg", label: "P/GP" },
  { id: "points", label: "Points" },
  { id: "name", label: "A–Z" },
];

function BreakdownTab({ playerId, results }: { playerId: string; results: Result[] }) {
  const [season, setSeason] = useState(ALL_TIME);
  const [sort, setSort] = useState<OpponentSort>("ppg");

  const seasons = getBreakdownSeasons(results, playerId);
  const { total, periods, shootout, opponents, other } = getPlayerBreakdown(results, playerId, season);

  if (total.games === 0) return <p className="player-empty">No games played yet.</p>;

  const periodRows = shootout ? [...periods, shootout] : periods;
  const primaryPoints = total.goals + total.primaryAssists;
  const average = total.points / total.games;
  const opponentRows: OpponentLine[] = [...sortOpponents(opponents, sort), ...(other ? [other] : [])];
  const scope = season === ALL_TIME ? "career" : "season";

  return (
    <>
      <div className="breakdown-filter">
        <label className="breakdown-select">
          <span className="t-label player-tabs-label">Season</span>
          <select className="ds-select" value={season} onChange={(e) => setSeason(e.target.value)}>
            <option value={ALL_TIME}>All time</option>
            {seasons.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <span className="t-label player-section-aside">All competitions</span>
      </div>

      <div className="breakdown-grid">
        <section className="player-section">
          <SectionHeader title="By period" aside="G · A · PTS" />
          <PeriodChart periods={periods} />
          <Legend
            items={[
              { label: "Goals", color: "var(--series-1)" },
              { label: "Assists", color: "var(--series-2)" },
            ]}
          />
          <div className="season-table-wrap">
            <table className="season-table breakdown-table">
              <thead>
                <tr>
                  <th className="col-season">Period</th>
                  <th title="Goals">G</th>
                  <th title="Primary assists">A1</th>
                  <th title="Secondary assists">A2</th>
                  <th title="Assists">A</th>
                  <th title="Points">PTS</th>
                  <th title="Points per game">P/GP</th>
                </tr>
              </thead>
              <tbody>
                {periodRows.map((p) => (
                  <tr key={p.label}>
                    <td className="col-season">{p.label}</td>
                    <td>{p.goals}</td>
                    <td>{p.primaryAssists}</td>
                    <td>{p.secondaryAssists}</td>
                    <td>{p.assists}</td>
                    <td className="col-pts">{p.points}</td>
                    <td className="col-muted">{perGame(p.points, p.games)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="col-season">Total</td>
                  <td>{total.goals}</td>
                  <td>{total.primaryAssists}</td>
                  <td>{total.secondaryAssists}</td>
                  <td>{total.assists}</td>
                  <td className="col-pts">{total.points}</td>
                  <td className="col-muted">{perGame(total.points, total.games)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          {shootout && (
            <p className="t-label player-legend">SO shootout goals sit outside the periods.</p>
          )}
        </section>

        <section className="player-section">
          <SectionHeader
            title="Assist split"
            aside={`${total.assists} ${total.assists === 1 ? "assist" : "assists"}`}
          />
          <div className="ds-card ds-card-e1 breakdown-card">
            <div className="breakdown-split">
              <div className="breakdown-split-side">
                <span className="t-label player-stat-label">Primary · A1</span>
                <span className="breakdown-split-value">{total.primaryAssists}</span>
                <span className="t-label player-stat-label">
                  {percent(total.primaryAssists, total.assists)}% of assists
                </span>
              </div>
              <div className="breakdown-split-side" data-align="end">
                <span className="t-label player-stat-label">Secondary · A2</span>
                <span className="breakdown-split-value">{total.secondaryAssists}</span>
                <span className="t-label player-stat-label">
                  {percent(total.secondaryAssists, total.assists)}% of assists
                </span>
              </div>
            </div>
            <div
              className="breakdown-split-bar"
              role="img"
              aria-label={`${total.assists} assists: ${total.primaryAssists} primary, ${total.secondaryAssists} secondary`}
            >
              <div style={{ flex: total.primaryAssists, background: "var(--fg-primary)" }} />
              <div style={{ flex: total.secondaryAssists, background: "var(--border-strong)" }} />
            </div>
            <Legend
              items={[
                { label: "Primary", color: "var(--fg-primary)" },
                { label: "Secondary", color: "var(--border-strong)" },
              ]}
            />
            <div className="breakdown-primary">
              <div className="player-stat">
                <span className="breakdown-primary-value">{primaryPoints}</span>
                <span className="t-label">Primary points</span>
                <span className="t-label player-legend">G + A1</span>
              </div>
              <div className="player-stat">
                <span className="breakdown-primary-value">{perGame(primaryPoints, total.games)}</span>
                <span className="t-label">Primary P/GP</span>
                <span className="t-label player-legend">
                  {primaryPoints} in {total.games} GP
                </span>
              </div>
              <div className="player-stat">
                <span className="breakdown-primary-value">{percent(primaryPoints, total.points)}%</span>
                <span className="t-label">Of all points</span>
                <span className="t-label player-legend">
                  {primaryPoints} of {total.points}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="player-section">
        <div className="player-section-header">
          <h2 className="t-heading player-section-title">Vs opponents</h2>
          <div className="player-tabs" role="group" aria-label="Sort opponents by">
            <span className="t-label player-tabs-label">Sort</span>
            {OPPONENT_SORTS.map((s) => (
              <button
                key={s.id}
                type="button"
                className="ds-chip t-label"
                aria-pressed={sort === s.id}
                onClick={() => setSort(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div className="season-table-wrap">
          <table className="season-table breakdown-opponents">
            <thead>
              <tr>
                <th className="col-opponent">Opponent</th>
                <th title="Games played">GP</th>
                <th title="Goals">G</th>
                <th title="Assists">A</th>
                <th title="Points">PTS</th>
                <th title="Points per game">P/GP</th>
                <th className="col-bar">
                  vs {scope} {perGame(total.points, total.games)}
                </th>
              </tr>
            </thead>
            <tbody>
              {opponentRows.map((o) => (
                <tr key={o.name}>
                  <td className="col-opponent">{o.name}</td>
                  <td>{o.games}</td>
                  <td>{o.goals}</td>
                  <td>{o.assists}</td>
                  <td>{o.points}</td>
                  <td className="col-pts">{o.pointsPerGame.toFixed(2)}</td>
                  <td className="col-bar">
                    <div className="breakdown-meter" aria-hidden="true">
                      <div style={{ width: `${meterPercent(o.pointsPerGame)}%` }} />
                      <i style={{ left: `${meterPercent(average)}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="col-opponent">Total</td>
                <td>{total.games}</td>
                <td>{total.goals}</td>
                <td>{total.assists}</td>
                <td>{total.points}</td>
                <td className="col-pts">{perGame(total.points, total.games)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="t-label player-legend">
          P/GP points per game · bar scaled 0–{METER_MAX.toFixed(2)}, marker shows {scope} average ·
          opponents with fewer than {OTHER_THRESHOLD} GP grouped as Other
        </p>
      </section>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type Tab = "career" | "gamelog" | "records" | "breakdown";

const TABS: { id: Tab; label: string }[] = [
  { id: "career", label: "Career" },
  { id: "gamelog", label: "Game log" },
  { id: "records", label: "Records" },
  { id: "breakdown", label: "Breakdown" },
];

export default function PlayerPage({ loaderData }: Route.ComponentProps) {
  const { playerId } = useParams();
  const [activeTab, setActiveTab] = useState<Tab>("career");

  const allPlayers = loaderData.players as Player[];
  const allResults = loaderData.results as Result[];

  const player = allPlayers.find((p) => p.id === playerId);

  if (!player) {
    return (
      <div className="player-page">
        <div className="player-not-found">
          <p>Player not found.</p>
          <Link to="/roster" className="t-label">
            ← Full roster
          </Link>
        </div>
      </div>
    );
  }

  const hasImage = PLAYER_IMAGE_IDS.has(player.id);
  const career = getCareerTotals(player, allResults);
  const seasonRows = getSeasonRows(player, allResults);
  const recentGames = getRecentGames(player.id, allResults);
  const recentTotals = getRecentTotals(recentGames);
  const allGames = getRecentGames(player.id, allResults, Infinity);
  const allGameTotals = getRecentTotals(allGames);
  const allWins = allGames.filter((g) => g.result === "W").length;
  const allLosses = allGames.filter((g) => g.result === "L").length;
  const milestones = getPlayerMilestones(allResults, player.id);

  const seasons = player.stats.length;
  const clubBestPoints = allPlayers.reduce((best, p) => Math.max(best, careerPoints(p)), 0);
  const isLeadingScorer = career.points > 0 && career.points === clubBestPoints;

  const heroMeta = [player.position, player.nickname ? `“${player.nickname}”` : null]
    .filter(Boolean)
    .join(" · ");

  const careerStats: Stat[] = [
    { label: "Seasons", value: seasons },
    { label: "Games played", value: career.games },
    { label: "Goals", value: career.goals },
    { label: "Assists", value: career.assists },
    { label: "Points", value: career.points },
    { label: "Points / game", value: career.pointsPerGame },
    { label: "PIM", value: career.pims },
    { label: "MOTM", value: career.motm },
    { label: "WOTG", value: career.wotg },
  ];

  return (
    <div className="player-page">
      <nav aria-label="Breadcrumb" className="player-breadcrumb">
        <Link to="/roster" className="t-label">
          ← Full roster
        </Link>
      </nav>

      {/* ── Hero ── */}
      <header className="player-hero">
        <div className="player-hero-grid">
          <div className="player-hero-identity">
            <span aria-hidden="true" className="t-display player-hero-number">
              {player.number}
            </span>
            <div className="player-hero-copy">
              <h1 className="t-display player-hero-name">{player.name}</h1>
              {heroMeta && <span className="t-label player-hero-meta">{heroMeta}</span>}
              <div className="player-hero-badges">
                {seasons > 0 && <Badge glyph={null}>{seasonCountLabel(seasons)}</Badge>}
                {isLeadingScorer && (
                  <Badge tone="success" glyph={null}>
                    Leading scorer
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="player-photo-wrap">
            {hasImage ? (
              <img
                src={`/images/players/${player.id}.jpg`}
                alt={player.name}
                className="player-photo"
              />
            ) : (
              <SilhouetteFallback />
            )}
          </div>
        </div>
      </header>

      {/* ── Career totals band ── */}
      <section className="player-career-band" aria-label="Career totals">
        <div className="player-career-band-inner">
          <span className="t-label muted">
            All time · {seasons === 1 ? "one season" : `${seasons} seasons`} with the club
          </span>
          <StatGrid stats={careerStats} size="lg" />
        </div>
      </section>

      <Stripe />

      {/* ── Body ── */}
      <div className="player-body">
        <div className="player-tabs" role="group" aria-label="Player statistics view">
          <span className="t-label player-tabs-label">Show</span>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className="ds-chip t-label"
              aria-pressed={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Career tab ── */}
        {activeTab === "career" && (
          <>
            <section className="player-section">
              <SectionHeader title="Season by season" aside="All competitions" />
              <div className="season-table-wrap">
                <table className="season-table">
                  <thead>
                    <tr>
                      <th className="col-season">Season</th>
                      <th title="Games played">GP</th>
                      <th title="Goals">G</th>
                      <th title="Assists">A</th>
                      <th title="Points">PTS</th>
                      <th title="Points per game">P/GP</th>
                      <th title="Penalties in minutes">PIM</th>
                      <th title="Power play goals">PPG</th>
                      <th title="Short handed goals">SHG</th>
                      <th title="Game winning goals">GWG</th>
                      <th title="Man of the match">MOTM</th>
                      <th title="Warrior of the game">WOTG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seasonRows.map((row) => (
                      <tr key={row.season}>
                        <td className="col-season">{row.season}</td>
                        <td>{row.games}</td>
                        <td>{row.goals}</td>
                        <td>{row.assists}</td>
                        <td className="col-pts">{row.points}</td>
                        <td className="col-muted">{row.pointsPerGame}</td>
                        <td>{row.pims}</td>
                        <td>{row.ppGoals}</td>
                        <td>{row.shGoals}</td>
                        <td>{row.gwGoals}</td>
                        <td>{row.motm}</td>
                        <td>{row.wotg}</td>
                      </tr>
                    ))}
                  </tbody>
                  {seasonRows.length > 1 && (
                    <tfoot>
                      <tr>
                        <td className="col-season">Total</td>
                        <td>{career.games}</td>
                        <td>{career.goals}</td>
                        <td>{career.assists}</td>
                        <td className="col-pts">{career.points}</td>
                        <td className="col-muted">{career.pointsPerGame}</td>
                        <td>{career.pims}</td>
                        <td>{career.ppGoals}</td>
                        <td>{career.shGoals}</td>
                        <td>{career.gwGoals}</td>
                        <td>{career.motm}</td>
                        <td>{career.wotg}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
              <p className="t-label player-legend">
                GP games played · G goals · A assists · PTS points · P/GP points per game · PIM
                penalties in minutes · PPG power play goals · SHG short handed goals · GWG game
                winning goals · MOTM man of the match · WOTG warrior of the game
              </p>
            </section>

            <section className="player-section">
              <SectionHeader
                title={`Last ${recentGames.length === 1 ? "game" : `${recentGames.length} games`}`}
                aside="G · A · PIM"
              />
              <RecentGamesList games={recentGames} />
              {recentGames.length > 0 && (
                <p className="t-label player-legend">
                  {recentTotals.goals} G · {recentTotals.assists} A · {recentTotals.points} PTS ·{" "}
                  {recentTotals.pims} PIM over these {recentGames.length}{" "}
                  {recentGames.length === 1 ? "game" : "games"}
                </p>
              )}
            </section>
          </>
        )}

        {/* ── Game log tab ── */}
        {activeTab === "gamelog" && (
          <>
            <section className="player-section">
              <SectionHeader
                title={`All ${allGames.length} ${allGames.length === 1 ? "game" : "games"}`}
                aside="Totals"
              />
              <StatGrid
                stats={[
                  { label: "Points", value: allGameTotals.points },
                  { label: "Goals", value: allGameTotals.goals },
                  { label: "Assists", value: allGameTotals.assists },
                  { label: "Points / game", value: allGameTotals.pointsPerGame },
                  { label: "PIM", value: allGameTotals.pims },
                  { label: "Won", value: allWins },
                  { label: "Lost", value: allLosses },
                ]}
              />
            </section>

            <section className="player-section">
              <SectionHeader title="Game log" aside="Newest first" />
              <GameLogTable games={allGames} milestones={milestones} />
            </section>
          </>
        )}

        {/* ── Records tab ── */}
        {activeTab === "records" && <RecordsTab games={allGames} />}

        {/* ── Breakdown tab ── */}
        {activeTab === "breakdown" && <BreakdownTab playerId={player.id} results={allResults} />}

        <div className="player-footer-note">
          <p className="player-footer-note-text">
            Scoring is taken from the official game sheets. Corrections go through the club
            secretary on Facebook.
          </p>
          <div className="player-footer-note-actions">
            <Link to="/roster" className="ds-btn ds-btn-primary ds-btn-md">
              Full roster
            </Link>
            <Link to="/stats" className="ds-btn ds-btn-secondary ds-btn-md">
              Player statistics
            </Link>
          </div>
        </div>
      </div>

      <Stripe />
    </div>
  );
}
