import players from "../../../public/data/players.json";
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
  statKey: keyof Pick<SeasonStat, "goals" | "assists" | "pims">
): LeaderEntry[] {
  return (players as Player[])
    .flatMap((player) => {
      const season = player.stats.find((s) => s.season === CURRENT_SEASON);
      if (!season) return [];
      return [{ id: player.id, name: player.name, number: player.number, value: season[statKey] }];
    })
    .filter((entry) => entry.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}

type PanelProps = {
  title: string;
  label: string;
  entries: LeaderEntry[];
};

function LeaderPanel({ title, label, entries }: PanelProps) {
  const [top, ...rest] = entries;

  return (
    <div className="sl-panel">
      <span className="sl-kicker">{title}</span>

      {top ? (
        <>
          <div className="sl-hero">
            <div className="sl-hero-avatar-wrap">
              <img
                src={`/images/players/${top.id}.jpg`}
                alt={top.name}
                className="sl-hero-avatar"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div className="sl-hero-stat">{top.value}</div>
            <div className="sl-hero-stat-label">{label}</div>
            <div className="sl-hero-name">{top.name}</div>
            <div className="sl-hero-number">#{top.number}</div>
          </div>

          {rest.length > 0 && (
            <ol className="sl-list" start={2}>
              {rest.map((entry, index) => (
                <li key={entry.id} className="sl-row">
                  <div className="sl-player-info">
                    <span className="sl-player-number">#{entry.number}</span>
                    <span className="sl-player-name">{entry.name}</span>
                  </div>
                  <span className="sl-stat-value">{entry.value}</span>
                  <span className="sl-stat-label">{label}</span>
                </li>
              ))}
            </ol>
          )}
        </>
      ) : (
        <p className="sl-empty">No stats recorded yet</p>
      )}
    </div>
  );
}

export function SeasonLeaders() {
  const goalLeaders = getLeaders("goals");
  const assistLeaders = getLeaders("assists");
  const pimsLeaders = getLeaders("pims");

  return (
    <div className="sl-shell">
      <div className="sl-grid">
        <LeaderPanel title="Top Goal Scorers" label="Goals" entries={goalLeaders} />
        <LeaderPanel title="Top Assists" label="Assists" entries={assistLeaders} />
        <LeaderPanel title="Most PIMs" label="PIMs" entries={pimsLeaders} />
      </div>
    </div>
  );
}
