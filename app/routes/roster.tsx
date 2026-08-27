import { useState, useMemo } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/roster";
import { getPlayers, getResults, getRosterConfig } from "~/data/client";
import { SectionHead } from "~/components/ds/SectionHead";
import { Stripe } from "~/components/ds/Stripe";
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
  score: { warriorsScore: number; opponentScore: number };
};

type GoalieSeasonStat = {
  games: number;
  goalsAgainst: number;
  wins: number;
  losses: number;
  draws: number;
};
type GoalieStatsMap = Record<string, Record<string, GoalieSeasonStat>>;

// ── Build goalie stats from results ─────────────────────────────────────────

export function buildGoalieStatsMap(results: ResultGame[]): GoalieStatsMap {
  const map: GoalieStatsMap = {};
  for (const game of results) {
    const id = game.netminderPlayerId;
    if (!id || id === "MISSING") continue;
    if (!map[id]) map[id] = {};
    const s = game.season;
    if (!map[id][s]) map[id][s] = { games: 0, goalsAgainst: 0, wins: 0, losses: 0, draws: 0 };
    const season = map[id][s];
    season.games++;
    season.goalsAgainst += game.score.opponentScore;
    if (game.score.warriorsScore > game.score.opponentScore) season.wins++;
    else if (game.score.warriorsScore < game.score.opponentScore) season.losses++;
    else season.draws++;
  }
  return map;
}

type GoalieCareer = {
  games: number;
  goalsAgainst: number;
  wins: number;
  losses: number;
  draws: number;
  gaa: number;
};

function getCareerGoalieStats(playerId: string, goalieStatsMap: GoalieStatsMap): GoalieCareer | null {
  const seasons = goalieStatsMap[playerId];
  if (!seasons) return null;
  const totals = Object.values(seasons).reduce(
    (acc, s) => ({
      games: acc.games + s.games,
      goalsAgainst: acc.goalsAgainst + s.goalsAgainst,
      wins: acc.wins + s.wins,
      losses: acc.losses + s.losses,
      draws: acc.draws + s.draws,
    }),
    { games: 0, goalsAgainst: 0, wins: 0, losses: 0, draws: 0 }
  );
  const gaa = totals.games > 0 ? totals.goalsAgainst / totals.games : 0;
  return { ...totals, gaa };
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

type Tab = "active" | "previous" | "all";

function filterByTab(players: Player[], tab: Tab, activeIds: Set<string>): Player[] {
  if (tab === "active") return players.filter((p) => activeIds.has(p.id));
  if (tab === "previous") return players.filter((p) => !activeIds.has(p.id));
  return players;
}

type SortKey = "Number" | "Points" | "Goals" | "Name";

function sortSkaters(players: Player[], sort: SortKey, goalieStatsMap: GoalieStatsMap): Player[] {
  const withTotals = players.map((p) => ({ p, career: getSkaterCareerTotals(p, goalieStatsMap) }));
  withTotals.sort((a, b) => {
    if (sort === "Name") return a.p.name.localeCompare(b.p.name);
    if (sort === "Points") return b.career.points - a.career.points;
    if (sort === "Goals") return b.career.goals - a.career.goals;
    return a.p.number - b.p.number;
  });
  return withTotals.map((x) => x.p);
}

// Points and Goals mean nothing for a netminder, so those sorts fall back to
// squad number — the order keepers are listed in on a game sheet.
function sortGoalies(players: Player[], sort: SortKey): Player[] {
  return players
    .slice()
    .sort((a, b) => (sort === "Name" ? a.name.localeCompare(b.name) : a.number - b.number));
}

// ── Row rendering ────────────────────────────────────────────────────────────

type StatCell = { k: string; v: string | number; strong?: boolean };

const SKATER_LEGEND = "GP · G · A · PTS · PIM";
const GOALIE_LEGEND = "GP · W · L · D · GAA";

function skaterStatCells(career: CareerTotals): StatCell[] {
  return [
    { k: "GP", v: career.games },
    { k: "G", v: career.goals },
    { k: "A", v: career.assists },
    { k: "PTS", v: career.points, strong: true },
    { k: "PIM", v: career.pims },
  ];
}

function goalieStatCells(career: GoalieCareer): StatCell[] {
  return [
    { k: "GP", v: career.games },
    { k: "W", v: career.wins },
    { k: "L", v: career.losses },
    { k: "D", v: career.draws },
    { k: "GAA", v: career.gaa.toFixed(2), strong: true },
  ];
}

function PlayerRow({ player, stats }: { player: Player; stats: StatCell[] }) {
  return (
    <li className="roster-row">
      <Link to={`/roster/${player.id}`} className="roster-row-main">
        <span aria-hidden="true" className="t-display roster-row-number">
          {player.number}
        </span>
        <div className="roster-row-copy">
          <span className="t-heading roster-row-name">{player.name}</span>
          <span className="t-label roster-row-meta">
            #{player.number} · {player.position}
            {player.nickname ? ` · “${player.nickname}”` : ""}
          </span>
        </div>
      </Link>
      {/* column-reverse in CSS puts the value above its label while keeping the
          spec-required dt-before-dd order in the markup. */}
      <dl className="roster-row-stats">
        {stats.map((stat) => (
          <div key={stat.k} className="roster-row-stat">
            <dt className="t-label roster-row-stat-label">{stat.k}</dt>
            <dd
              className="t-data roster-row-stat-value"
              data-strong={stat.strong ? "true" : undefined}
            >
              {stat.v}
            </dd>
          </div>
        ))}
      </dl>
    </li>
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
        <span className="t-label roster-section-count">
          {players.length} {players.length === 1 ? "player" : "players"} ·{" "}
          {variant === "goalie" ? GOALIE_LEGEND : SKATER_LEGEND}
        </span>
      </div>
      <ul className="roster-list">
        {players.map((player) => {
          // A keeper with no recorded netminder appearances has nothing to show
          // in the goalie columns, so fall back to their skater line.
          const goalie = variant === "goalie" ? getCareerGoalieStats(player.id, goalieStatsMap) : null;
          const stats = goalie
            ? goalieStatCells(goalie)
            : skaterStatCells(getSkaterCareerTotals(player, goalieStatsMap));
          return <PlayerRow key={player.id} player={player} stats={stats} />;
        })}
      </ul>
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
  const forwards = sortSkaters(filtered.filter(isForward), sort, goalieStatsMap);
  const defence = sortSkaters(filtered.filter(isDefence), sort, goalieStatsMap);
  const goalies = sortGoalies(filtered.filter(isGoalie), sort);

  const skaters = filtered.filter((p) => !isGoalie(p));
  const skaterCareers = skaters.map((p) => getSkaterCareerTotals(p, goalieStatsMap));
  const totalGoals = skaterCareers.reduce((n, c) => n + c.goals, 0);
  const totalAssists = skaterCareers.reduce((n, c) => n + c.assists, 0);
  const totalPims = skaterCareers.reduce((n, c) => n + c.pims, 0);

  const squadStats = [
    { k: "Players", v: filtered.length },
    { k: "Skaters", v: skaters.length },
    { k: "Goaltenders", v: goalies.length },
    { k: "Goals for", v: totalGoals },
    { k: "Assists", v: totalAssists },
    { k: "Penalty minutes", v: totalPims },
  ];

  const tabs: { id: Tab; label: string }[] = [
    { id: "active", label: "Active" },
    { id: "previous", label: "Previous" },
    { id: "all", label: "All" },
  ];

  return (
    <div className="roster-page">
      <div className="roster-intro">
        <SectionHead eyebrow="EIH Recreational League South, Div 2" title="Roster">
          Career statistics for every player who has pulled on a Warriors shirt. A player must be
          registered with England Ice Hockey before taking the ice.
        </SectionHead>
        <div className="roster-stat-strip">
          {squadStats.map((stat) => (
            <div key={stat.k} className="roster-stat">
              <span className="roster-stat-value">{stat.v}</span>
              <span className="t-label muted">{stat.k}</span>
            </div>
          ))}
        </div>
      </div>

      <Stripe />

      <section className="roster-body">
        <div className="roster-controls" role="group" aria-label="Roster filters">
          <span className="t-label roster-controls-label">Show</span>
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
          <span className="t-data roster-controls-count">
            {filtered.length} {filtered.length === 1 ? "player" : "players"}
          </span>
        </div>

        {filtered.length === 0 ? (
          <p className="roster-empty">No players to show.</p>
        ) : (
          <>
            <RosterSection title="Goaltenders" players={goalies} variant="goalie" goalieStatsMap={goalieStatsMap} />
            <RosterSection title="Defence" players={defence} variant="skater" goalieStatsMap={goalieStatsMap} />
            <RosterSection title="Forwards" players={forwards} variant="skater" goalieStatsMap={goalieStatsMap} />
          </>
        )}

        <div className="roster-footer-note">
          <p className="roster-footer-note-text">
            Select a player for their profile and season-by-season scoring. Squad numbers are held
            for the season. Players listed under more than one position appear in each section.
          </p>
          <div className="roster-footer-note-actions">
            <a
              className="ds-btn ds-btn-primary ds-btn-md"
              href="https://www.facebook.com/"
              target="_blank"
              rel="noreferrer"
            >
              Join the squad
            </a>
            <Link to="/stats" className="ds-btn ds-btn-secondary ds-btn-md">
              Full season stats
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
