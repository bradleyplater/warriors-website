import { useMemo } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/records";
import { getPlayers, getResults } from "~/data/client";
import type { Result, Player } from "~/data/types";
import { SectionHead } from "~/components/ds/SectionHead";
import { Stripe } from "~/components/ds/Stripe";
import { buildRecordSets, type RecordCard as Card } from "~/helpers/records";
import "./records.css";

export function meta() {
  return [{ title: "Records — Peterborough Warriors" }];
}

export async function clientLoader() {
  const [players, results] = await Promise.all([
    getPlayers<unknown[]>(),
    getResults<unknown[]>(),
  ]);
  return { players, results };
}

const POS_SHORT: Record<string, string> = { Forward: "F", Defence: "D", Goaltender: "G" };

function RecordCard({ record, players }: { record: Card; players: Map<string, Player> }) {
  const [first, ...rest] = record.top;
  const holder = first ? players.get(first.playerId) : undefined;
  const pos = holder?.position
    .split("/")
    .map((p) => POS_SHORT[p.trim()] ?? p.trim().charAt(0))
    .join("/");

  return (
    <article className="rec-card">
      <div className="rec-card-head">
        <h3 className="t-label rec-card-title">
          {record.title}
          {record.note ? ` · ${record.note}` : ""}
        </h3>
        <span className="rec-card-value">{first ? first.value : "—"}</span>
      </div>

      {first ? (
        <div className="rec-card-holder">
          <Link to={`/roster/${first.playerId}`} className="t-heading rec-card-name">{first.name}</Link>
          {holder && <span className="t-label rec-muted">#{holder.number} · {pos}</span>}
          <span className="rec-card-context">{first.context}</span>
        </div>
      ) : (
        <p className="rec-card-context">Not set yet.</p>
      )}

      {rest.length > 0 && (
        <ol className="rec-card-rest">
          {rest.map((entry, i) => (
            <li key={`${entry.playerId}-${entry.context}`} className="rec-card-rest-row">
              <span className="t-data rec-muted">{i + 2}</span>
              <span className="rec-card-rest-who">
                <Link to={`/roster/${entry.playerId}`} className="rec-card-rest-name">{entry.name}</Link>
                <span className="t-label rec-muted rec-card-rest-context">{entry.context}</span>
              </span>
              <span className="t-data rec-card-rest-value">{entry.value}</span>
            </li>
          ))}
        </ol>
      )}
    </article>
  );
}

export default function Records({ loaderData }: Route.ComponentProps) {
  const results = loaderData.results as Result[];
  const players = loaderData.players as Player[];
  const sets = useMemo(() => buildRecordSets(results, players), [results, players]);
  const playerMap = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);

  return (
    <div className="rec-page">
      <section className="rec-intro">
        <SectionHead title="Records">
          Individual club records taken from the official game sheets. League and cup games.
        </SectionHead>
        <nav aria-label="Record sets" className="rec-jump">
          <span className="t-label rec-muted">Jump to</span>
          <div className="rec-jump-links">
            {sets.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="t-label rec-jump-link">{s.title}</a>
            ))}
          </div>
        </nav>
      </section>

      {sets.map((set) => (
        <div key={set.id}>
          <Stripe />
          <section id={set.id} aria-label={`${set.title} records`} className="rec-set">
            <div className="rec-set-head">
              <h2 className="t-heading rec-set-title">{set.title}</h2>
              <span className="t-label rec-muted">{set.note}</span>
            </div>
            {set.groups.map((group) => (
              <div key={group.label} className="rec-group">
                <span className="t-label rec-muted rec-group-label">{group.label}</span>
                <div className="rec-grid">
                  {group.records.map((record) => (
                    <RecordCard key={record.title} record={record} players={playerMap} />
                  ))}
                </div>
              </div>
            ))}
          </section>
        </div>
      ))}
    </div>
  );
}
