import { useMemo } from "react";
import { Link } from "react-router";
import type { Result } from "~/data/types";
import { getDuos } from "~/helpers/player-breakdown";
import "./DeadliestDuos.css";

const SHOWN = 10;

type Named = { name: string };

function PlayerLink({ id, players }: { id: string; players: Map<string, Named> }) {
  return (
    <Link to={`/roster/${id}`} className="duos-name">
      {players.get(id)?.name ?? "Former player"}
    </Link>
  );
}

/** The top pairs by goals both got a point on, across whichever games the
 *  page passes in (the caller does the season and competition filtering). */
export function DeadliestDuos({ games, players }: { games: Result[]; players: Map<string, Named> }) {
  const duos = useMemo(() => getDuos(games).slice(0, SHOWN), [games]);
  const first = (id: string) => players.get(id)?.name.split(" ")[0] ?? "?";

  if (duos.length === 0) return <p className="duos-empty">No goals combined yet.</p>;

  return (
    <>
      <ol className="duos">
        {duos.map((d, i) => (
          <li key={`${d.a}|${d.b}`} className="duos-row">
            <span className="t-data duos-muted">{i + 1}</span>
            <span className="duos-who">
              <span className="duos-pair">
                <PlayerLink id={d.a} players={players} />
                <span className="duos-muted"> &amp; </span>
                <PlayerLink id={d.b} players={players} />
              </span>
              <span className="t-label duos-muted">
                {first(d.b)} → {first(d.a)} {d.aFromB} · {first(d.a)} → {first(d.b)} {d.bFromA} ·{" "}
                {d.games} GP together
              </span>
            </span>
            <span className="duos-value">{d.together}</span>
          </li>
        ))}
      </ol>
      <p className="t-label duos-muted duos-note">
        Counts every goal both got a point on: one scoring from the other, or both assisting ·
        arrows show who set up whom · shootout goals not included
      </p>
    </>
  );
}
