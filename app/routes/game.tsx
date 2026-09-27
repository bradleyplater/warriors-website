import { useState } from "react";
import { Link, useParams } from "react-router";
import type { Route } from "./+types/game";
import { getPlayers, getResults } from "~/data/client";
import type { Penalty, Result } from "~/data/types";
import { Badge } from "~/components/ds/Badge";
import { DataTable } from "~/components/ds/DataTable";
import { Stripe } from "~/components/ds/Stripe";
import { GamePhotos } from "~/components/GamePhotos/GamePhotos";
import { getInitials } from "~/components/TeamLogo/TeamLogo";
import { opponentCrestSrc } from "~/components/LatestResultCard/LatestResultCard";
import "./game.css";

type Player = { id: string; name: string; number: number; position: string };

/** The club plays out of Planet Ice; away venues aren't recorded in the feed. */
const HOME_VENUE = "Planet Ice Peterborough";

const PERIOD_LABELS = ["1st", "2nd", "3rd"] as const;

/** Game-sheet offence codes as published by the stats service. */
const OFFENCE_LABELS: Record<string, string> = {
  ABUSE: "Abuse of officials",
  AGGR: "Aggressor",
  BDYCH: "Body checking",
  BOARD: "Boarding",
  CHARG: "Charging",
  CHEB: "Checking from behind",
  CHECK: "Checking",
  CROSS: "Cross-checking",
  DELAY: "Delay of game",
  ELBOW: "Elbowing",
  EMBEL: "Embellishment",
  FIGHT: "Fighting",
  GOALINTRF: "Goaltender interference",
  HIST: "High sticking",
  HOLD: "Holding",
  HOOK: "Hooking",
  HOST: "Holding the stick",
  ILLEQUIP: "Illegal equipment",
  INTRF: "Interference",
  KNEE: "Kneeing",
  MATCH: "Match penalty",
  MISC: "Misconduct",
  RETAL: "Retaliation",
  ROUGH: "Roughing",
  SLASH: "Slashing",
  THROWSTICK: "Throwing stick",
  TOOM: "Too many players",
  TRIP: "Tripping",
  UNSP: "Unsportsmanlike conduct",
};

const STRENGTH_LABELS: Record<"EVEN" | "PP" | "SH", string> = {
  EVEN: "even strength",
  PP: "power play",
  SH: "short-handed",
};

export async function clientLoader() {
  const [players, results] = await Promise.all([
    getPlayers<unknown[]>(),
    getResults<unknown[]>(),
  ]);
  return { players, results };
}

export function meta({ params, data }: Route.MetaArgs) {
  const allResults = data?.results as Result[] | undefined;
  const date = decodeURIComponent(params.gameId ?? "");
  const game = allResults?.find((r) => r.date === date);
  const title = game
    ? `vs ${game.opponentTeam} — Peterborough Warriors`
    : "Game — Peterborough Warriors";
  return [{ title }];
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).replace(",", ""); // "Sat 18 Jul 2026", not "Sat, 18 Jul 2026"
}

/** Feed clocks run across the whole game; the score sheet reads per period. */
function formatPeriodClock(minute: number, second: number, period: number) {
  const inPeriod = minute - 20 * (period - 1);
  return `${String(inPeriod).padStart(2, "0")}:${String(second).padStart(2, "0")}`;
}

function getOutcome(ws: number, os: number): "W" | "L" | "D" {
  if (ws > os) return "W";
  if (ws < os) return "L";
  return "D";
}

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function offenceLabel(type: string) {
  return OFFENCE_LABELS[type] ?? type;
}

type GoalEntry = {
  id: string;
  team: "warriors" | "opponent";
  scorerName: string;
  assistNames: string[];
  minute: number;
  second: number;
  type: "EVEN" | "PP" | "SH";
  period: number;
  warriorsRunning: number;
  opponentRunning: number;
  isGWG: boolean;
};

function buildGoalTimeline(game: Result, playerMap: Map<string, Player>): GoalEntry[] {
  const periods = [
    { data: game.score.period.one, num: 1 },
    { data: game.score.period.two, num: 2 },
    { data: game.score.period.three, num: 3 },
  ];

  const entries: GoalEntry[] = [];

  for (const { data, num } of periods) {
    for (const goal of data.goals) {
      entries.push({
        id: `w-${num}-${goal.minute}-${goal.second}-${goal.playerId}`,
        team: "warriors",
        scorerName: playerMap.get(goal.playerId)?.name ?? goal.playerId,
        assistNames: goal.assists.map((a) => playerMap.get(a)?.name ?? a),
        minute: goal.minute,
        second: goal.second,
        type: goal.type,
        period: num,
        warriorsRunning: 0,
        opponentRunning: 0,
        isGWG: false,
      });
    }
    for (const goal of data.opponentGoals) {
      entries.push({
        id: `o-${num}-${goal.minute}-${goal.second}-${goal.playerId}`,
        team: "opponent",
        scorerName: goal.playerId,
        assistNames: (goal.assists as (string | null)[]).filter((a): a is string => !!a),
        minute: goal.minute,
        second: goal.second,
        type: goal.type,
        period: num,
        warriorsRunning: 0,
        opponentRunning: 0,
        isGWG: false,
      });
    }
  }

  entries.sort((a, b) => {
    if (a.period !== b.period) return a.period - b.period;
    return a.minute * 60 + a.second - (b.minute * 60 + b.second);
  });

  let wScore = 0;
  let oScore = 0;
  for (const e of entries) {
    if (e.team === "warriors") wScore++;
    else oScore++;
    e.warriorsRunning = wScore;
    e.opponentRunning = oScore;
  }

  // Mark the game-winning goal: the first goal that gives the winner a lead
  // equal to the loser's final score + 1 (i.e. the lead they never surrendered)
  const { warriorsScore: wFinal, opponentScore: oFinal } = game.score;
  if (wFinal !== oFinal) {
    const winningTeam = wFinal > oFinal ? "warriors" : "opponent";
    const gwgScore = wFinal > oFinal ? oFinal + 1 : wFinal + 1;
    const gwg = entries.find(
      (e) =>
        e.team === winningTeam &&
        (winningTeam === "warriors" ? e.warriorsRunning : e.opponentRunning) === gwgScore
    );
    if (gwg) gwg.isGWG = true;
  }

  return entries;
}

type PenaltyEntry = {
  id: string;
  period: number;
  minute: number;
  second: number;
  who: string;
  team: "warriors" | "opponent";
  offence: string;
  mins: number;
};

function buildPenaltyList(
  game: Result,
  playerMap: Map<string, Player>,
  opponentTeam: string
): PenaltyEntry[] {
  const periods = [
    { data: game.score.period.one, num: 1 },
    { data: game.score.period.two, num: 2 },
    { data: game.score.period.three, num: 3 },
  ];

  const entries: PenaltyEntry[] = [];
  const add = (
    penalty: Penalty,
    num: number,
    team: "warriors" | "opponent",
    name: string
  ) => {
    entries.push({
      id: `${team}-${num}-${penalty.minute}-${penalty.second}-${penalty.offender}`,
      period: num,
      minute: penalty.minute,
      second: penalty.second,
      // Warriors offenders are player ids; opponents are free text off the sheet.
      // The row's team tag says whose penalty it is, so no team suffix.
      who: name,
      team,
      offence: offenceLabel(penalty.type),
      mins: penalty.duration,
    });
  };

  for (const { data, num } of periods) {
    for (const p of data.penalties ?? []) {
      add(p, num, "warriors", playerMap.get(p.offender)?.name ?? p.offender);
    }
    for (const p of data.opponentPenalties ?? []) {
      add(p, num, "opponent", p.offender);
    }
  }

  return entries.sort((a, b) => {
    if (a.period !== b.period) return a.period - b.period;
    return a.minute * 60 + a.second - (b.minute * 60 + b.second);
  });
}

type Star = {
  key: string;
  team: "warriors" | "opponent";
  name: string;
  goals: number;
  assists: number;
};

/** Derived from the game sheet — the club doesn't publish an official selection. */
function buildStars(goals: GoalEntry[]): Star[] {
  const tally = new Map<string, Star>();
  const bump = (team: Star["team"], name: string, field: "goals" | "assists") => {
    if (!name || name === "Unknown" || name === "MISSING") return;
    const key = `${team}-${name}`;
    const existing = tally.get(key) ?? { key, team, name, goals: 0, assists: 0 };
    existing[field] += 1;
    tally.set(key, existing);
  };

  for (const goal of goals) {
    bump(goal.team, goal.scorerName, "goals");
    for (const assist of goal.assistNames) bump(goal.team, assist, "assists");
  }

  return Array.from(tally.values())
    .sort((a, b) => b.goals + b.assists - (a.goals + a.assists) || b.goals - a.goals)
    .slice(0, 3);
}

function starDetail(star: Star, opponentTeam: string, award: string | null) {
  const parts: string[] = [];
  if (star.goals) parts.push(plural(star.goals, "goal"));
  if (star.assists) parts.push(plural(star.assists, "assist"));
  const team = star.team === "warriors" ? "Warriors" : opponentTeam;
  return [`${team} · ${parts.join(", ")}`, award].filter(Boolean).join(" · ");
}

function SectionHeading({ title, note }: { title: string; note?: string }) {
  return (
    <div className="game-panel-head">
      <h2 className="t-heading game-panel-title">{title}</h2>
      {note ? <span className="t-label muted">{note}</span> : null}
    </div>
  );
}

function RosterCard({
  playerId,
  isMotm,
  isWotg,
  isNetminder,
  playerMap,
}: {
  playerId: string;
  isMotm: boolean;
  isWotg: boolean;
  isNetminder: boolean;
  playerMap: Map<string, Player>;
}) {
  const player = playerMap.get(playerId);
  if (!player) return null;
  return (
    <Link to={`/roster/${playerId}`} className="game-roster-card">
      <span className="t-data game-roster-number">#{player.number}</span>
      <span className="game-roster-name">{player.name}</span>
      <span className="t-label muted game-roster-pos">{player.position}</span>
      {(isMotm || isWotg || isNetminder) && (
        <div className="game-roster-badges">
          {isNetminder && <span className="game-roster-badge game-roster-badge--nm">GK</span>}
          {isMotm && <abbr title="Player of the game" className="game-roster-badge game-roster-badge--potg">POTG</abbr>}
          {isWotg && <abbr title="Warrior of the game" className="game-roster-badge game-roster-badge--wotg">WOTG</abbr>}
        </div>
      )}
    </Link>
  );
}

/** Row tag naming the side: WAR for us, the opponent's nickname cut to three
 *  letters ("Cambridge Cobras" -> COB), as in the design. */
function TeamTag({ warriors, opponentTeam }: { warriors: boolean; opponentTeam: string }) {
  const code = warriors ? "WAR" : (opponentTeam.trim().split(/\s+/).pop() ?? "").slice(0, 3).toUpperCase();
  return (
    <abbr title={warriors ? "Peterborough Warriors" : opponentTeam} className={`t-label game-team-tag${warriors ? " game-team-tag--warriors" : ""}`}>
      {code}
    </abbr>
  );
}

/** Opponent crest from /images/team-logos, falling back to initials when a
 *  team has no artwork (same lookup as the homepage's last result). */
function OpponentMark({ game }: { game: Result }) {
  const [failed, setFailed] = useState(false);
  return (
    <span aria-hidden="true" className="game-team-mark">
      {failed ? (
        <span className="game-team-initials">{getInitials(game.opponentTeam)}</span>
      ) : (
        <img src={opponentCrestSrc(game)} alt="" className="game-team-crest" onError={() => setFailed(true)} />
      )}
    </span>
  );
}

export default function Game({ loaderData }: Route.ComponentProps) {
  const { gameId } = useParams();
  const allResults = loaderData.results as Result[];
  const allPlayers = loaderData.players as Player[];
  const playerMap = new Map(allPlayers.map((p) => [p.id, p]));

  const date = decodeURIComponent(gameId ?? "");
  const game = allResults.find((r) => r.date === date);

  if (!game) {
    return (
      <div className="game-page">
        <div className="game-not-found">
          <p>Game not found.</p>
          <Link to="/results" className="t-label">← All results</Link>
        </div>
      </div>
    );
  }

  const outcome = getOutcome(game.score.warriorsScore, game.score.opponentScore);
  const outcomeLabel = outcome === "W" ? "Won" : outcome === "L" ? "Lost" : "Drawn";
  const outcomeTone = outcome === "W" ? "success" : outcome === "L" ? "danger" : "neutral";

  const goals = buildGoalTimeline(game, playerMap);
  const penalties = buildPenaltyList(game, playerMap, game.opponentTeam);
  const stars = buildStars(goals);
  const p = game.score.period;

  const motmId = game.manOfTheMatchPlayerId !== "MISSING" ? game.manOfTheMatchPlayerId : null;
  const wotgId = game.warriorOfTheGamePlayerId !== "MISSING" ? game.warriorOfTheGamePlayerId : null;
  const nmId = game.netminderPlayerId !== "MISSING" ? game.netminderPlayerId : null;
  const netminder = nmId ? playerMap.get(nmId) : undefined;
  const awardNames = new Map<string, string>();
  if (motmId) awardNames.set(playerMap.get(motmId)?.name ?? "", "Player of the game");
  if (wotgId) awardNames.set(playerMap.get(wotgId)?.name ?? "", "Warrior of the game");

  const periodScores = [p.one, p.two, p.three].map((period, i) => ({
    label: PERIOD_LABELS[i],
    line: `${period.warriorsScore}–${period.opponentScore}`,
  }));

  const kickoff = new Date(game.date);
  // 00:00Z means the face-off time was never recorded, not a midnight game.
  const hasFaceOff = !(kickoff.getUTCHours() === 0 && kickoff.getUTCMinutes() === 0);
  const faceOff = kickoff.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const venue = game.location === "HOME" ? HOME_VENUE : `Away to ${game.opponentTeam}`;

  const warriorsPim = penalties.filter((x) => x.team === "warriors").reduce((n, x) => n + x.mins, 0);
  const opponentPim = penalties.filter((x) => x.team === "opponent").reduce((n, x) => n + x.mins, 0);

  return (
    <div className="game-page">
      <nav aria-label="Breadcrumb" className="game-breadcrumb">
        <Link to="/results" className="t-label">← All results</Link>
      </nav>

      <section aria-label="Final score" className="game-scoreboard">
        <div className="game-scoreboard-meta">
          <Badge tone={outcomeTone}>{outcomeLabel}</Badge>
          <span className="t-data game-scoreboard-when">
            {formatDate(game.date)} · {venue}
          </span>
        </div>

        <div className="game-scoreboard-teams">
          <div className="game-team-row">
            <span aria-hidden="true" className="game-team-mark game-team-mark--warriors" />
            <span className="t-heading game-team-name">Peterborough Warriors</span>
            <span className="game-team-score">{game.score.warriorsScore}</span>
          </div>
          <div className="game-team-row game-team-row--opponent">
            <OpponentMark game={game} />
            <span className="t-heading game-team-name">{game.opponentTeam}</span>
            <span className="game-team-score">{game.score.opponentScore}</span>
          </div>

          <div className="game-scoreboard-facts">
            <div className="game-fact">
              <span className="t-label muted">By period</span>
              <div className="game-fact-periods">
                {periodScores.map((period) => (
                  <div key={period.label} className="game-fact-period">
                    <span className="t-data game-fact-period-line">{period.line}</span>
                    <span className="t-label muted game-fact-period-label">{period.label}</span>
                  </div>
                ))}
              </div>
            </div>
            {hasFaceOff && (
              <div className="game-fact">
                <span className="t-label muted">Face-off</span>
                <span className="t-data game-fact-value">{faceOff}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <Stripe />

      <section className="game-panels">
        <div className="game-panel">
          <SectionHeading title="Scoring" note={plural(goals.length, "goal")} />
          {goals.length === 0 ? (
            <p className="game-empty">No goals recorded.</p>
          ) : (
            <ol className="game-list">
              {goals.map((goal) => {
                const assists =
                  goal.assistNames.length > 0
                    ? `Assisted by ${goal.assistNames.join(", ")}`
                    : "Unassisted";
                const opponentGoal = goal.team !== "warriors";
                const detail = [
                  assists,
                  STRENGTH_LABELS[goal.type],
                  goal.isGWG ? "game winner" : null,
                ]
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <li key={goal.id} className={`game-list-row${opponentGoal ? " game-list-row--opponent" : ""}`}>
                    <span className="t-data muted game-list-clock">
                      {PERIOD_LABELS[goal.period - 1]} {formatPeriodClock(goal.minute, goal.second, goal.period)}
                    </span>
                    <TeamTag warriors={!opponentGoal} opponentTeam={game.opponentTeam} />
                    <div className="game-list-body">
                      <span className="game-list-primary">{goal.scorerName}</span>
                      <span className="t-label muted">{detail}</span>
                    </div>
                    <span className="t-data game-list-score">
                      {goal.warriorsRunning}–{goal.opponentRunning}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <div className="game-panel">
          <SectionHeading
            title="Penalties"
            note={
              penalties.length > 0
                ? `Warriors ${warriorsPim} · ${game.opponentTeam} ${opponentPim}`
                : undefined
            }
          />
          {penalties.length === 0 ? (
            <p className="game-empty">No penalties recorded.</p>
          ) : (
            <ul className="game-list">
              {penalties.map((penalty) => (
                <li
                  key={penalty.id}
                  className={`game-list-row game-penalty-row${penalty.team === "opponent" ? " game-list-row--opponent" : ""}`}
                >
                  <span className="t-data muted game-list-clock">
                    {PERIOD_LABELS[penalty.period - 1]} {formatPeriodClock(penalty.minute, penalty.second, penalty.period)}
                  </span>
                  <TeamTag warriors={penalty.team === "warriors"} opponentTeam={game.opponentTeam} />
                  <span className="game-list-primary game-penalty-who">{penalty.who}</span>
                  <span className="t-label muted game-penalty-offence">{penalty.offence}</span>
                  <span className="t-data game-penalty-mins">{penalty.mins}&apos;</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {netminder && (
          <div className="game-panel">
            <SectionHeading title="Goaltending" />
            <div className="game-table-scroll">
              <DataTable
                columns={[
                  { header: "Goaltender" },
                  { header: "Team" },
                  { header: "GA", numeric: true, align: "right", strong: true },
                  { header: "Result" },
                ]}
                rows={[
                  [
                    `${netminder.name} (#${netminder.number})`,
                    "Warriors",
                    game.score.opponentScore,
                    outcomeLabel,
                  ],
                ]}
              />
            </div>
          </div>
        )}

        {stars.length > 0 && (
          <div className="game-panel">
            <SectionHeading title="Three stars" />
            <ol className="game-list">
              {stars.map((star, i) => (
                <li key={star.key} className="game-list-row game-star">
                  <span className="t-display game-star-rank">{i + 1}</span>
                  <div className="game-list-body">
                    <span className="t-heading game-star-name">{star.name}</span>
                    <span className="t-label muted">
                      {starDetail(star, game.opponentTeam, star.team === "warriors" ? awardNames.get(star.name) ?? null : null)}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>

      {/* Placeholder until game photos are added: pass them as `photos`. */}
      <GamePhotos />

      {game.roster && game.roster.length > 0 && (
        <section aria-label="Lineup" className="game-lineup">
          <SectionHeading title="Lineup" note={plural(game.roster.length, "player")} />
          <div className="game-roster-grid">
            {game.roster.map((id) => (
              <RosterCard
                key={id}
                playerId={id}
                isMotm={id === motmId}
                isWotg={id === wotgId}
                isNetminder={id === nmId}
                playerMap={playerMap}
              />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
