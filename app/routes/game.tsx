import { Link, useParams } from "react-router";
import resultsData from "../../public/data/results.json";
import playersData from "../../public/data/players.json";
import type { Result } from "~/contexts/DataContext";
import "./game.css";

type Player = { id: string; name: string; number: number; position: string };

const allResults = resultsData as Result[];
const allPlayers = playersData as Player[];
const playerMap = new Map(allPlayers.map((p) => [p.id, p]));

export function meta({ params }: { params: { gameId?: string } }) {
  const date = decodeURIComponent(params.gameId ?? "");
  const game = allResults.find((r) => r.date === date);
  const title = game
    ? `vs ${game.opponentTeam} — Peterborough Warriors`
    : "Game — Peterborough Warriors";
  return [{ title }];
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(minute: number, second: number) {
  return `${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`;
}

function getOutcome(ws: number, os: number): "W" | "L" | "D" {
  if (ws > os) return "W";
  if (ws < os) return "L";
  return "D";
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

function buildGoalTimeline(game: Result): GoalEntry[] {
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

function TypeBadge({ type }: { type: "EVEN" | "PP" | "SH" }) {
  if (type === "PP") return <span className="game-goal-type game-goal-type--pp">PP</span>;
  if (type === "SH") return <span className="game-goal-type game-goal-type--sh">SH</span>;
  return null;
}

function GWGBadge() {
  return <span className="game-goal-type game-goal-type--gwg">GWG</span>;
}

function RosterCard({
  playerId,
  isMotm,
  isWotg,
  isNetminder,
}: {
  playerId: string;
  isMotm: boolean;
  isWotg: boolean;
  isNetminder: boolean;
}) {
  const player = playerMap.get(playerId);
  if (!player) return null;
  return (
    <Link to={`/roster/${playerId}`} className="game-roster-card">
      <span className="game-roster-number">#{player.number}</span>
      <span className="game-roster-name">{player.name}</span>
      <span className="game-roster-position">{player.position}</span>
      {(isMotm || isWotg || isNetminder) && (
        <div className="game-roster-badges">
          {isNetminder && <span className="game-roster-badge game-roster-badge--nm">GK</span>}
          {isMotm && <span className="game-roster-badge game-roster-badge--motm">MOTM</span>}
          {isWotg && <span className="game-roster-badge game-roster-badge--wotg">WOTG</span>}
        </div>
      )}
    </Link>
  );
}

export default function Game() {
  const { gameId } = useParams();
  const date = decodeURIComponent(gameId ?? "");
  const game = allResults.find((r) => r.date === date);

  if (!game) {
    return (
      <div className="game-page">
        <div className="game-not-found">
          <p>Game not found.</p>
          <Link to="/results" className="game-back-link">← Back to Results</Link>
        </div>
      </div>
    );
  }

  const outcome = getOutcome(game.score.warriorsScore, game.score.opponentScore);
  const goals = buildGoalTimeline(game);
  const p = game.score.period;

  const motmId = game.manOfTheMatchPlayerId !== "MISSING" ? game.manOfTheMatchPlayerId : null;
  const wotgId = game.warriorOfTheGamePlayerId !== "MISSING" ? game.warriorOfTheGamePlayerId : null;
  const nmId = game.netminderPlayerId !== "MISSING" ? game.netminderPlayerId : null;

  return (
    <div className="game-page">
      {/* ── Hero ── */}
      <header className="game-hero">
        <div className="game-hero-inner">
          <Link to="/results" className="game-back-link">← Back to Results</Link>

          <div className="game-hero-content">
            <div className="game-hero-meta">
              <span className="game-hero-kicker">Peterborough Warriors</span>
              <h1 className="game-hero-title">vs {game.opponentTeam}</h1>
              <div className="game-hero-info">
                {game.competition && (
                  <span className="game-hero-pill game-hero-pill--comp">{game.competition}</span>
                )}
                {(game.location === "HOME" || game.location === "AWAY") && (
                  <span className={`game-hero-pill game-hero-pill--loc game-hero-pill--${game.location.toLowerCase()}`}>
                    {game.location === "HOME" ? "Home" : "Away"}
                  </span>
                )}
                <span className="game-hero-date">{formatDate(game.date)}</span>
              </div>
            </div>

            <div className="game-hero-score-wrap">
              <div className={`game-hero-outcome game-hero-outcome--${outcome.toLowerCase()}`}>
                {outcome}
              </div>
              <div className="game-hero-score">
                <span className="game-hero-score-num">{game.score.warriorsScore}</span>
                <span className="game-hero-score-sep">–</span>
                <span className="game-hero-score-num">{game.score.opponentScore}</span>
              </div>
              <div className="game-hero-score-teams">
                <span>Warriors</span>
                <span>{game.opponentTeam}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="game-body">
        {/* ── Period Scores ── */}
        <section className="game-section">
          <h2 className="game-section-title">Period Scores</h2>
          <div className="game-periods">
            <table className="game-periods-table">
              <thead>
                <tr>
                  <th className="game-periods-team-col"></th>
                  <th>P1</th>
                  <th>P2</th>
                  <th>P3</th>
                  <th className="game-periods-total">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="game-periods-team-col">Warriors</td>
                  <td>{p.one.warriorsScore}</td>
                  <td>{p.two.warriorsScore}</td>
                  <td>{p.three.warriorsScore}</td>
                  <td className="game-periods-total">{game.score.warriorsScore}</td>
                </tr>
                <tr>
                  <td className="game-periods-team-col">{game.opponentTeam}</td>
                  <td>{p.one.opponentScore}</td>
                  <td>{p.two.opponentScore}</td>
                  <td>{p.three.opponentScore}</td>
                  <td className="game-periods-total">{game.score.opponentScore}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Goals Timeline ── */}
        <section className="game-section">
          <h2 className="game-section-title">Goals</h2>
          {goals.length === 0 ? (
            <p className="game-empty">No goals recorded.</p>
          ) : (
            <div className="game-goals-list">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  className={`game-goal game-goal--${goal.team}`}
                >
                  <div className="game-goal-time">
                    <span className="game-goal-period">P{goal.period}</span>
                    <span className="game-goal-clock">{formatTime(goal.minute, goal.second)}</span>
                  </div>

                  <div className="game-goal-body">
                    <div className="game-goal-scorer-row">
                      <span className="game-goal-scorer">{goal.scorerName}</span>
                      <TypeBadge type={goal.type} />
                      {goal.isGWG && <GWGBadge />}
                      <span className="game-goal-team-label">
                        {goal.team === "warriors" ? "Warriors" : game.opponentTeam}
                      </span>
                    </div>
                    {goal.assistNames.length > 0 && (
                      <div className="game-goal-assists">
                        Assists: {goal.assistNames.join(", ")}
                      </div>
                    )}
                  </div>

                  <div className="game-goal-score">
                    {goal.warriorsRunning}–{goal.opponentRunning}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Roster ── */}
        {game.roster && game.roster.length > 0 && (
          <section className="game-section">
            <h2 className="game-section-title">Roster</h2>
            <div className="game-roster-grid">
              {game.roster.map((id) => (
                <RosterCard
                  key={id}
                  playerId={id}
                  isMotm={id === motmId}
                  isWotg={id === wotgId}
                  isNetminder={id === nmId}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
