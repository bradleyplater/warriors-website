import { Link } from "react-router";
import type { Player, Result, UpcomingGame } from "~/data/types";
import {
  buildCompetitionLeaders,
  type CompetitionLeaders,
  type LeaderCategory,
} from "~/helpers/season-leaders";
import "./SeasonLeaders.css";

function CategoryColumn({ category }: { category: LeaderCategory }) {
  const [leader, ...rest] = category.entries;
  if (!leader) return null;

  return (
    <div className="sl-cat">
      <h4 className="t-label sl-cat-label">{category.label}</h4>
      <div className="sl-leader">
        <span className="sl-leader-value">{leader.value}</span>
        <div className="sl-leader-who">
          <span className="sl-leader-name">{leader.name}</span>
          <span className="sl-leader-number">#{leader.number}</span>
        </div>
      </div>
      {rest.length > 0 && (
        <ol className="sl-rest" start={2}>
          {rest.map((entry, index) => (
            <li key={entry.id} className="sl-rest-row">
              <span className="sl-rest-rank">{index + 2}</span>
              <span className="sl-rest-name">{entry.name}</span>
              <span className="sl-rest-value">{entry.value}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function CompetitionRow({ competition }: { competition: CompetitionLeaders }) {
  const { code, name, gamesPlayed, categories } = competition;

  return (
    <article className="sl-comp">
      <div className="sl-comp-side">
        <h3 className="sl-comp-name">{name}</h3>
        <span className="sl-comp-played">
          {gamesPlayed} {gamesPlayed === 1 ? "game" : "games"} played
        </span>
        <Link to={`/stats?competition=${encodeURIComponent(code)}`} className="sl-comp-link">
          Full stats
        </Link>
      </div>

      {categories.length > 0 ? (
        <div className="sl-cats">
          {categories.map((category) => (
            <CategoryColumn key={category.stat} category={category} />
          ))}
        </div>
      ) : (
        <div className="sl-comp-empty">
          <span className="sl-comp-empty-title">
            {gamesPlayed === 0 ? "No games played yet" : "No points or penalties yet"}
          </span>
          <span className="sl-comp-empty-body">
            Leaders for this competition appear here after the first{" "}
            {gamesPlayed === 0 ? "game" : "goal or penalty"}.
          </span>
        </div>
      )}
    </article>
  );
}

export function SeasonLeaders({
  players,
  results,
  upcomingGames,
  season,
}: {
  players: unknown[];
  results: unknown[];
  upcomingGames: UpcomingGame[];
  /** The season to rank, e.g. "26/27". */
  season: string | undefined;
}) {
  const competitions = buildCompetitionLeaders(
    results as Result[],
    players as Player[],
    season,
    upcomingGames
  );

  if (competitions.length === 0) {
    return <p className="sl-none">No games this season yet.</p>;
  }

  return (
    <div className="sl-board">
      {competitions.map((competition) => (
        <CompetitionRow key={competition.code} competition={competition} />
      ))}
    </div>
  );
}
