import { Link } from "react-router";
import "./SeasonLeaders.css";

const CURRENT_SEASON = "25/26";

type SeasonStat = {
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
  number: number;
  stats: SeasonStat[];
};

type LeaderEntry = {
  id: string;
  name: string;
  number: number;
  value: number;
};

function getLeaders(
  players: Player[],
  statKey: keyof Pick<SeasonStat, "goals" | "assists" | "pims">
): LeaderEntry[] {
  return players
    .flatMap((player) => {
      const season = player.stats.find((s) => s.season === CURRENT_SEASON);
      if (!season) return [];
      return [{ id: player.id, name: player.name, number: player.number, value: season[statKey] }];
    })
    .filter((entry) => entry.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 4);
}

type PanelProps = {
  title: string;
  unit: string;
  entries: LeaderEntry[];
};

function LeaderPanel({ title, unit, entries }: PanelProps) {
  const [top, ...rest] = entries;

  return (
    <div className="sl-panel">
      <div className="sl-panel-top">
        <span className="t-label sl-kicker">{title}</span>

        {top ? (
          <>
            <div className="sl-hero">
              <span className="sl-hero-value">{top.value}</span>
              <span className="t-label sl-hero-unit">{unit}</span>
            </div>
            <div>
              <div className="sl-hero-name">{top.name}</div>
              <div className="t-label sl-hero-meta">#{top.number}</div>
            </div>
          </>
        ) : (
          <p className="sl-empty">No stats recorded yet</p>
        )}
      </div>

      {rest.length > 0 && (
        <ol className="sl-list">
          {rest.map((entry, index) => (
            <li key={entry.id} className="sl-row">
              <span className="t-data sl-rank">{index + 2}</span>
              <span className="sl-player-name">{entry.name}</span>
              <span className="t-label sl-player-pos">#{entry.number}</span>
              <span className="t-data sl-stat-value">{entry.value}</span>
            </li>
          ))}
        </ol>
      )}

      {top && (
        <div className="sl-link">
          <Link to="/stats" className="t-label">Full scoring stats</Link>
        </div>
      )}
    </div>
  );
}

export function SeasonLeaders({ players: rawPlayers }: { players: unknown[] }) {
  const players = rawPlayers as Player[];
  const goalLeaders = getLeaders(players, "goals");
  const assistLeaders = getLeaders(players, "assists");
  const pimsLeaders = getLeaders(players, "pims");

  return (
    <div className="sl-grid">
      <LeaderPanel title="Goals" unit="goals" entries={goalLeaders} />
      <LeaderPanel title="Assists" unit="assists" entries={assistLeaders} />
      <LeaderPanel title="PIMs" unit="pims" entries={pimsLeaders} />
    </div>
  );
}
