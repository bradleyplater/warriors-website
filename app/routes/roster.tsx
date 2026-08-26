import { useState, useMemo } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/roster";
import { getPlayers, getResults, getRosterConfig } from "~/data/client";
import { SectionHead } from "~/components/ds/SectionHead";
import "./roster.css";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Roster — Peterborough Warriors" }];
}

export async function clientLoader() {
  const [players, results, rosterConfig] = await Promise.all([
    getPlayers<unknown[]>(),
    getResults<unknown[]>(),
    getRosterConfig<{ activePlayers: string[] }>(),
  ]);
  return { players, results, rosterConfig };
}

type PlayerStat = {
  season: string;
  games: number;
  goals: number;
  assists: number;
  pims: number;
  points: number;
};

type Player = {
  id: string;
  name: string;
  nickname?: string;
  number: number;
  position: string;
  stats: PlayerStat[];
};

type ResultGame = {
  season: string;
  netminderPlayerId: string;
  score: { opponentScore: number };
};

type GoalieSeasonStat = { games: number; goalsAgainst: number };
type GoalieStatsMap = Record<string, Record<string, GoalieSeasonStat>>;

// ── Build goalie stats from results ─────────────────────────────────────────

export function buildGoalieStatsMap(results: ResultGame[]): GoalieStatsMap {
  const map: GoalieStatsMap = {};
  for (const game of results) {
    const id = game.netminderPlayerId;
    if (!id || id === "MISSING") continue;
    if (!map[id]) map[id] = {};
    const s = game.season;
    if (!map[id][s]) map[id][s] = { games: 0, goalsAgainst: 0 };
    map[id][s].games++;
    map[id][s].goalsAgainst += game.score.opponentScore;
  }
  return map;
}

function getCareerGoalieStats(playerId: string, goalieStatsMap: GoalieStatsMap) {
  const seasons = goalieStatsMap[playerId];
  if (!seasons) return null;
  let games = 0;
  let goalsAgainst = 0;
  for (const s of Object.values(seasons)) {
    games += s.games;
    goalsAgainst += s.goalsAgainst;
  }
  const gaa = games > 0 ? goalsAgainst / games : 0;
  return { games, goalsAgainst, gaa };
}

function getTotalGoalieGames(playerId: string, goalieStatsMap: GoalieStatsMap): number {
  const seasons = goalieStatsMap[playerId];
  if (!seasons) return 0;
  return Object.values(seasons).reduce((sum, s) => sum + s.games, 0);
}

// ── Skater career totals (goalie games subtracted for dual-role players) ─────

type CareerTotals = {
  games: number;
  goals: number;
  assists: number;
  points: number;
  pims: number;
};

function getSkaterCareerTotals(player: Player, goalieStatsMap: GoalieStatsMap): CareerTotals {
  const totals = player.stats.reduce(
    (acc, s) => ({
      games: acc.games + (s.games ?? 0),
      goals: acc.goals + (s.goals ?? 0),
      assists: acc.assists + (s.assists ?? 0),
      points: acc.points + (s.points ?? 0),
      pims: acc.pims + (s.pims ?? 0),
    }),
    { games: 0, goals: 0, assists: 0, points: 0, pims: 0 }
  );
  // Subtract games spent in goal so skater GP is accurate
  const goalieGames = getTotalGoalieGames(player.id, goalieStatsMap);
  return { ...totals, games: Math.max(0, totals.games - goalieGames) };
}

// ── Position helpers ─────────────────────────────────────────────────────────

function includesPosition(position: string, check: string): boolean {
  return position
    .toLowerCase()
    .split(/[\s/,]+/)
    .some((p) => p === check.toLowerCase());
}

const isForward = (p: Player) => includesPosition(p.position, "forward");
const isDefence = (p: Player) => includesPosition(p.position, "defence");
const isGoalie = (p: Player) =>
  includesPosition(p.position, "goaltender") || includesPosition(p.position, "goalie");
const isDualRole = (p: Player) =>
  p.position.toLowerCase().split(/[\s/,]+/).filter(Boolean).length > 1;

// ── Static data ──────────────────────────────────────────────────────────────

const playerImageModules = import.meta.glob("/public/images/players/*.jpg", { eager: true });
const PLAYER_IMAGE_IDS = new Set(
  Object.keys(playerImageModules).map((path) => path.split("/").pop()!.replace(".jpg", ""))
);

type Tab = "active" | "previous" | "all";

function filterByTab(players: Player[], tab: Tab, activeIds: Set<string>): Player[] {
  if (tab === "active") return players.filter((p) => activeIds.has(p.id));
  if (tab === "previous") return players.filter((p) => !activeIds.has(p.id));
  return players;
}

type SortKey = "Number" | "Points" | "Goals" | "Name";

function sortPlayers(players: Player[], sort: SortKey, goalieStatsMap: GoalieStatsMap): Player[] {
  const withTotals = players.map((p) => ({ p, career: getSkaterCareerTotals(p, goalieStatsMap) }));
  withTotals.sort((a, b) => {
    if (sort === "Name") return a.p.name.localeCompare(b.p.name);
    if (sort === "Points") return b.career.points - a.career.points;
    if (sort === "Goals") return b.career.goals - a.career.goals;
    return a.p.number - b.p.number;
  });
  return withTotals.map((x) => x.p);
}

// ── Components ───────────────────────────────────────────────────────────────

function SilhouetteFallback() {
  return (
    <div className="roster-card-photo-fallback">
      <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="32" r="22" fill="currentColor" />
        <path d="M10 120 C10 80 90 80 90 120Z" fill="currentColor" />
      </svg>
    </div>
  );
}

function SkaterCard({
  player,
  showDualBadge,
  goalieStatsMap,
}: {
  player: Player;
  showDualBadge?: boolean;
  goalieStatsMap: GoalieStatsMap;
}) {
  const career = getSkaterCareerTotals(player, goalieStatsMap);
  const hasImage = PLAYER_IMAGE_IDS.has(player.id);
  const dual = showDualBadge && isDualRole(player);

  return (
    <Link to={`/roster/${player.id}`} className="roster-card">
      <div className="roster-card-photo">
        {hasImage ? (
          <img src={`/images/players/${player.id}.jpg`} alt={player.name} loading="lazy" />
        ) : (
          <SilhouetteFallback />
        )}
        <span className="roster-card-number">#{player.number}</span>
        {dual && <span className="roster-card-dual">{player.position}</span>}
      </div>
      <div className="roster-card-info">
        <div className="roster-card-name">{player.name}</div>
        {player.nickname && <div className="roster-card-nickname">"{player.nickname}"</div>}
        <div className="roster-card-stats">
          <div className="roster-card-stat">
            <span className="roster-card-stat-value">{career.games}</span>
            <span className="roster-card-stat-label">GP</span>
          </div>
          <div className="roster-card-stat">
            <span className="roster-card-stat-value">{career.goals}</span>
            <span className="roster-card-stat-label">G</span>
          </div>
          <div className="roster-card-stat">
            <span className="roster-card-stat-value">{career.assists}</span>
            <span className="roster-card-stat-label">A</span>
          </div>
          <div className="roster-card-stat">
            <span className="roster-card-stat-value">{career.points}</span>
            <span className="roster-card-stat-label">PTS</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function GoalieCard({
  player,
  showDualBadge,
  goalieStatsMap,
}: {
  player: Player;
  showDualBadge?: boolean;
  goalieStatsMap: GoalieStatsMap;
}) {
  const goalie = getCareerGoalieStats(player.id, goalieStatsMap);
  const hasImage = PLAYER_IMAGE_IDS.has(player.id);
  const dual = showDualBadge && isDualRole(player);

  if (!goalie) {
    return <SkaterCard player={player} showDualBadge={showDualBadge} goalieStatsMap={goalieStatsMap} />;
  }

  return (
    <Link to={`/roster/${player.id}`} className="roster-card roster-card-goalie">
      <div className="roster-card-photo">
        {hasImage ? (
          <img src={`/images/players/${player.id}.jpg`} alt={player.name} loading="lazy" />
        ) : (
          <SilhouetteFallback />
        )}
        <span className="roster-card-number">#{player.number}</span>
        {dual && <span className="roster-card-dual">{player.position}</span>}
      </div>
      <div className="roster-card-info">
        <div className="roster-card-name">{player.name}</div>
        {player.nickname && <div className="roster-card-nickname">"{player.nickname}"</div>}
        <div className="roster-card-stats roster-card-stats-goalie">
          <div className="roster-card-stat">
            <span className="roster-card-stat-value">{goalie.games}</span>
            <span className="roster-card-stat-label">GP</span>
          </div>
          <div className="roster-card-stat">
            <span className="roster-card-stat-value">{goalie.goalsAgainst}</span>
            <span className="roster-card-stat-label">GA</span>
          </div>
          <div className="roster-card-stat">
            <span className="roster-card-stat-value">{goalie.gaa.toFixed(2)}</span>
            <span className="roster-card-stat-label">GAA</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function RosterSection({
  title,
  players,
  variant = "skater",
  goalieStatsMap,
}: {
  title: string;
  players: Player[];
  variant?: "skater" | "goalie";
  goalieStatsMap: GoalieStatsMap;
}) {
  if (players.length === 0) return null;

  return (
    <section className="roster-section">
      <div className="roster-section-header">
        <h2 className="t-heading roster-section-title">{title}</h2>
        <span className="t-label roster-section-count">{players.length} players</span>
      </div>
      <div className="roster-grid">
        {players.map((player) =>
          variant === "goalie" ? (
            <GoalieCard key={player.id} player={player} showDualBadge goalieStatsMap={goalieStatsMap} />
          ) : (
            <SkaterCard key={player.id} player={player} showDualBadge goalieStatsMap={goalieStatsMap} />
          )
        )}
      </div>
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Roster({ loaderData }: Route.ComponentProps) {
  const allPlayers = loaderData.players as Player[];
  const activeIds = useMemo(() => new Set(loaderData.rosterConfig.activePlayers), [loaderData.rosterConfig]);
  const goalieStatsMap = useMemo(() => buildGoalieStatsMap(loaderData.results as ResultGame[]), [loaderData.results]);

  const [activeTab, setActiveTab] = useState<Tab>("active");
  const [sort, setSort] = useState<SortKey>("Number");

  const filtered = filterByTab(allPlayers, activeTab, activeIds);
  const forwards = sortPlayers(filtered.filter(isForward), sort, goalieStatsMap);
  const defence = sortPlayers(filtered.filter(isDefence), sort, goalieStatsMap);
  const goalies = filtered.filter(isGoalie).sort((a, b) => a.number - b.number);

  const skaters = filtered.filter((p) => !isGoalie(p));
  const totalGoals = skaters.reduce((n, p) => n + getSkaterCareerTotals(p, goalieStatsMap).goals, 0);
  const totalAssists = skaters.reduce((n, p) => n + getSkaterCareerTotals(p, goalieStatsMap).assists, 0);

  const tabs: { id: Tab; label: string }[] = [
    { id: "active", label: "Active" },
    { id: "previous", label: "Previous" },
    { id: "all", label: "All" },
  ];

  return (
    <div className="roster-page">
      <div className="roster-intro">
        <SectionHead eyebrow="Peterborough Warriors" title="Roster">
          Career statistics for all Warriors players. A player must be registered with England Ice Hockey before taking the ice.
        </SectionHead>
        <div className="roster-stat-strip">
          <div>
            <span className="roster-stat-value">{filtered.length}</span>
            <div className="t-label muted">Players</div>
          </div>
          <div>
            <span className="roster-stat-value">{skaters.length}</span>
            <div className="t-label muted">Skaters</div>
          </div>
          <div>
            <span className="roster-stat-value">{goalies.length}</span>
            <div className="t-label muted">Goaltenders</div>
          </div>
          <div>
            <span className="roster-stat-value">{totalGoals}</span>
            <div className="t-label muted">Goals for</div>
          </div>
          <div>
            <span className="roster-stat-value">{totalAssists}</span>
            <div className="t-label muted">Assists</div>
          </div>
        </div>
      </div>

      <div className="roster-body">
        <div className="roster-controls" role="group" aria-label="Roster filters">
          {tabs.map((tab) => (
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
          <span className="t-label roster-controls-label roster-controls-sep">Sort by</span>
          {(["Number", "Points", "Goals", "Name"] as SortKey[]).map((s) => (
            <button
              key={s}
              type="button"
              className="ds-chip t-label"
              aria-pressed={sort === s}
              onClick={() => setSort(s)}
            >
              {s}
            </button>
          ))}
          <span className="t-data roster-controls-count">{filtered.length} players</span>
        </div>

        <RosterSection title="Goaltenders" players={goalies} variant="goalie" goalieStatsMap={goalieStatsMap} />
        <RosterSection title="Defence" players={defence} variant="skater" goalieStatsMap={goalieStatsMap} />
        <RosterSection title="Forwards" players={forwards} variant="skater" goalieStatsMap={goalieStatsMap} />

        <div className="roster-footer-note">
          <p>Select a player for their profile and season-by-season scoring. Squad numbers are held for the season.</p>
        </div>
      </div>
    </div>
  );
}
