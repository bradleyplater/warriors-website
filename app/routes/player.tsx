import { useState } from "react";
import { Link, useParams } from "react-router";
import playersData from "../../public/data/players.json";
import resultsData from "../../public/data/results.json";
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
import type { Result } from "~/contexts/DataContext";
import type { Season } from "~/types/season";
import "./player.css";

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
  number: number;
  position: string;
  stats: PlayerStat[];
};

const allPlayers = playersData as Player[];
const allResults = resultsData as Result[];

const playerImageModules = import.meta.glob("/public/images/players/*.jpg", {
  eager: true,
});
const PLAYER_IMAGE_IDS = new Set(
  Object.keys(playerImageModules).map((path) =>
    path.split("/").pop()!.replace(".jpg", "")
  )
);

export function meta({ params }: { params: { playerId?: string } }) {
  const player = allPlayers.find((p) => p.id === params.playerId);
  return [
    {
      title: player
        ? `${player.name} — Peterborough Warriors`
        : "Player — Peterborough Warriors",
    },
  ];
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

function getCareerTotals(player: Player): StatTotals {
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

function getSeasonRows(player: Player): SeasonRow[] {
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

function getRecentGames(playerId: string, count = 5): GameRow[] {
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

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="player-career-stat">
      <span className="player-career-stat-value">{value}</span>
      <span className="player-career-stat-label">{label}</span>
    </div>
  );
}

function CareerTotalsGrid({ totals }: { totals: StatTotals }) {
  return (
    <div className="player-career-totals">
      <StatCard label="PTS" value={totals.points} />
      <StatCard label="G" value={totals.goals} />
      <StatCard label="A" value={totals.assists} />
      <StatCard label="GP" value={totals.games} />
      <StatCard label="P/GP" value={totals.pointsPerGame} />
      <StatCard label="PIM" value={totals.pims} />
      <StatCard label="MOTM" value={totals.motm} />
      <StatCard label="WOTG" value={totals.wotg} />
    </div>
  );
}

function RecentTotalsGrid({ totals, wins, losses }: { totals: StatTotals; wins: number; losses: number }) {
  return (
    <div className="player-career-totals">
      <StatCard label="PTS" value={totals.points} />
      <StatCard label="G" value={totals.goals} />
      <StatCard label="A" value={totals.assists} />
      <StatCard label="P/GP" value={totals.pointsPerGame} />
      <StatCard label="W" value={wins} />
      <StatCard label="L" value={losses} />
    </div>
  );
}

function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });
}

function RecordCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="player-record-card">
      <span className="player-record-value">{value > 0 ? value : "–"}</span>
      <span className="player-record-label">{label}</span>
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
        <h2 className="player-section-title">Single Game Records</h2>
        <div className="player-record-grid">
          <RecordCard label="Most Goals" value={records.goals.value} sub={gameSub(records.goals)} />
          <RecordCard label="Most Assists" value={records.assists.value} sub={gameSub(records.assists)} />
          <RecordCard label="Most Points" value={records.points.value} sub={gameSub(records.points)} />
          <RecordCard label="Most PIMs" value={records.pims.value} sub={gameSub(records.pims)} />
        </div>
      </section>

      <section className="player-section">
        <h2 className="player-section-title">Longest Streaks</h2>
        <div className="player-record-grid">
          <RecordCard label="Goal Streak" value={streaks.goal.length} sub={streakSub(streaks.goal)} />
          <RecordCard label="Assist Streak" value={streaks.assist.length} sub={streakSub(streaks.assist)} />
          <RecordCard label="Point Streak" value={streaks.point.length} sub={streakSub(streaks.point)} />
          <RecordCard label="PIM Streak" value={streaks.pim.length} sub={streakSub(streaks.pim)} />
          <RecordCard label="Winning Streak" value={streaks.winning.length} sub={streakSub(streaks.winning)} />
          <RecordCard label="Unbeaten Streak" value={streaks.unbeaten.length} sub={streakSub(streaks.unbeaten)} />
          <RecordCard label="Losing Streak" value={streaks.losing.length} sub={streakSub(streaks.losing)} />
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
            <th title="Penalties in Minutes">PIM</th>
            <th title="Power Play Goals">PPG</th>
            <th title="Short Handed Goals">SHG</th>
            <th className="col-notes">Notes</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game, i) => {
            const tags = getNoteTags(game, milestones);
            return (
              <tr key={i}>
                <td className="col-season">
                  {new Date(game.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "2-digit",
                  })}
                </td>
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

// ── Page ──────────────────────────────────────────────────────────────────────

type Tab = "career" | "recent" | "allgames" | "records";

const TABS: { id: Tab; label: string }[] = [
  { id: "career", label: "Career Stats" },
  { id: "recent", label: "Recent Form" },
  { id: "allgames", label: "All Games" },
  { id: "records", label: "Records" },
];

export default function PlayerPage() {
  const { playerId } = useParams();
  const [activeTab, setActiveTab] = useState<Tab>("career");

  const player = allPlayers.find((p) => p.id === playerId);

  if (!player) {
    return (
      <div className="player-page">
        <div className="player-not-found">
          <p>Player not found.</p>
          <Link to="/roster" className="player-back-link">
            ← Back to Roster
          </Link>
        </div>
      </div>
    );
  }

  const hasImage = PLAYER_IMAGE_IDS.has(player.id);
  const career = getCareerTotals(player);
  const seasonRows = getSeasonRows(player);
  const recentGames = getRecentGames(player.id);
  const recentTotals = getRecentTotals(recentGames);
  const recentWins = recentGames.filter((g) => g.result === "W").length;
  const recentLosses = recentGames.filter((g) => g.result === "L").length;
  const allGames = getRecentGames(player.id, Infinity);
  const allGameTotals = getRecentTotals(allGames);
  const allWins = allGames.filter((g) => g.result === "W").length;
  const allLosses = allGames.filter((g) => g.result === "L").length;
  const milestones = getPlayerMilestones(allResults, player.id);

  return (
    <div className="player-page">
      {/* ── Hero ── */}
      <header className="player-hero">
        <div className="player-hero-inner">
          <Link to="/roster" className="player-back-link">
            ← Back to Roster
          </Link>
          <div className="player-hero-content">
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
              <span className="player-number">#{player.number}</span>
            </div>
            <div className="player-info">
              <span className="player-kicker">Peterborough Warriors</span>
              <h1 className="player-name">{player.name}</h1>
              <div className="player-position">{player.position}</div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="player-body">
        {/* Tab navigation */}
        <div className="player-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={
                activeTab === tab.id ? "player-tab player-tab-active" : "player-tab"
              }
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Career Stats tab ── */}
        {activeTab === "career" && (
          <>
            <section className="player-section">
              <h2 className="player-section-title">Career Totals</h2>
              <CareerTotalsGrid totals={career} />
            </section>

            <section className="player-section">
              <h2 className="player-section-title">Season by Season</h2>
              <div className="season-table-wrap">
                <table className="season-table">
                  <thead>
                    <tr>
                      <th className="col-season">Season</th>
                      <th title="Games Played">GP</th>
                      <th title="Goals">G</th>
                      <th title="Assists">A</th>
                      <th title="Points">PTS</th>
                      <th title="Penalties in Minutes">PIM</th>
                      <th title="Points per Game">P/GP</th>
                      <th title="Power Play Goals">PPG</th>
                      <th title="Short Handed Goals">SHG</th>
                      <th title="Game Winning Goals">GWG</th>
                      <th title="Man of the Match">MOTM</th>
                      <th title="Warrior of the Game">WOTG</th>
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
                        <td>{row.pims}</td>
                        <td className="col-muted">{row.pointsPerGame}</td>
                        <td>{row.ppGoals}</td>
                        <td>{row.shGoals}</td>
                        <td>{row.gwGoals}</td>
                        <td>{row.motm}</td>
                        <td>{row.wotg}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* ── Recent Form tab ── */}
        {activeTab === "recent" && (
          <>
            <section className="player-section">
              <h2 className="player-section-title">
                Last {recentGames.length} Games — Totals
              </h2>
              <RecentTotalsGrid totals={recentTotals} wins={recentWins} losses={recentLosses} />
            </section>

            <section className="player-section">
              <h2 className="player-section-title">Game by Game</h2>
              <GameLogTable games={recentGames} milestones={milestones} />
            </section>
          </>
        )}

        {/* ── All Games tab ── */}
        {activeTab === "allgames" && (
          <>
            <section className="player-section">
              <h2 className="player-section-title">
                All {allGames.length} Games — Totals
              </h2>
              <RecentTotalsGrid totals={allGameTotals} wins={allWins} losses={allLosses} />
            </section>

            <section className="player-section">
              <h2 className="player-section-title">Game Log</h2>
              <GameLogTable games={allGames} milestones={milestones} />
            </section>
          </>
        )}

        {/* ── Records tab ── */}
        {activeTab === "records" && <RecordsTab games={allGames} />}
      </div>
    </div>
  );
}
