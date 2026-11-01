import { useMemo, useState } from "react";
import { data, Link } from "react-router";
import type { Route } from "./+types/awards";
import { assetUrl, getAwards, getPlayers } from "~/data/client";
import type { AwardsFile, Player } from "~/data/types";
import { Stripe } from "~/components/ds/Stripe";
import {
  buildAwardsPage,
  buildRollOfHonour,
  findEvening,
  fullSeason,
  seasonFromSlug,
  type AwardView,
  type RollCell,
  type WinnerView,
} from "~/helpers/awards";
import { seoMeta } from "~/helpers/seo";
import "./awards.css";

// Serves both /awards (the newest evening) and /awards/:season ("24-25").
export function meta({ params }: Route.MetaArgs) {
  const season = params.season ? fullSeason(seasonFromSlug(params.season)) : undefined;
  return seoMeta({
    path: params.season ? `/awards/${params.season}` : "/awards/",
    title: season
      ? `Awards ${season} — Peterborough Warriors`
      : "Awards — Peterborough Warriors",
    description: "Peterborough Warriors end-of-season awards and award winners.",
  });
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const [awards, players] = await Promise.all([getAwards(), getPlayers<Player[]>()]);
  if (!findEvening(awards, params.season)) {
    throw data("No awards evening for that season", { status: 404 });
  }
  return { awards, players };
}

/** The winner's picture: their photo from the night, else the back of their
 *  shirt, else an empty "to be announced" slot. Sized by its container. */
function WinnerPhoto({ winner, className = "" }: { winner: WinnerView; className?: string }) {
  if (winner.state === "photo" && winner.photo) {
    return (
      <img
        className={`aw-photo ${className}`}
        src={winner.photo.url}
        alt={winner.photo.alt}
        loading="lazy"
      />
    );
  }
  if (winner.state === "jersey") {
    return (
      <div aria-hidden="true" className={`aw-jersey ${className}`}>
        <span className="aw-jersey-name">{winner.surname}</span>
        <span className="aw-jersey-num">{winner.mark}</span>
        <div className="ds-stripe aw-jersey-stripe" />
      </div>
    );
  }
  return (
    <div aria-hidden="true" className={`aw-tba ${className}`}>
      <span className="t-label muted">To be announced</span>
    </div>
  );
}

function WinnerName({ winner, className }: { winner: WinnerView; className: string }) {
  return (
    <span className={`${className}${winner.state === "tba" ? " muted" : ""}`}>{winner.name}</span>
  );
}

function CompetitionRow({ award }: { award: AwardView }) {
  return (
    <div className="aw-row">
      <WinnerPhoto winner={award.winner} className="aw-row-photo" />
      <div className="aw-row-text">
        <span className="t-label muted">{award.name}</span>
        <WinnerName winner={award.winner} className="aw-row-name" />
      </div>
      {award.total && (
        <div className="aw-row-stat">
          <span className="t-display aw-row-value">{award.total.value}</span>
          <span className="t-label muted aw-row-unit">{award.total.unit}</span>
        </div>
      )}
    </div>
  );
}

function HonourCard({ award }: { award: AwardView }) {
  return (
    <article className="aw-card aw-honour">
      <WinnerPhoto winner={award.winner} className="aw-honour-photo" />
      <div className="aw-honour-text">
        <h3 className="t-label muted aw-card-title">{award.name}</h3>
        <WinnerName winner={award.winner} className="aw-honour-name" />
        {(award.total || award.note) && (
          <span className="t-data muted aw-honour-sub">
            {award.total ? `${award.total.value} ${award.total.unit}` : award.note}
          </span>
        )}
      </div>
    </article>
  );
}

function ClubCard({ award }: { award: AwardView }) {
  return (
    <article className="aw-card aw-club">
      <WinnerPhoto winner={award.winner} className="aw-club-photo" />
      <div className="aw-club-body">
        <h3 className="t-label muted aw-card-title">{award.name}</h3>
        <WinnerName winner={award.winner} className="aw-club-name" />
      </div>
    </article>
  );
}

function RollCellView({ cell }: { cell: RollCell | null }) {
  if (!cell) return <span aria-label="Not awarded" className="muted">—</span>;
  return (
    <>
      <span className={cell.who === "To be announced" ? "muted" : undefined}>{cell.who}</span>
      {cell.sub && <span className="t-data muted aw-roll-sub">{cell.sub}</span>}
    </>
  );
}

function RollOfHonour({ awards, players }: { awards: AwardsFile; players: Player[] }) {
  const roll = useMemo(() => buildRollOfHonour(awards, players), [awards, players]);
  const anySplit = roll.columns.some((column) => column.competitions.length > 0);
  const width = roll.columns.reduce(
    (total, column) => total + Math.max(column.competitions.length, 1),
    1,
  );

  return (
    <div className="aw-card aw-roll-wrap">
      <table className="aw-roll">
        <thead>
          <tr>
            <th scope="col" rowSpan={anySplit ? 2 : 1} className="aw-roll-award">
              Award
            </th>
            {roll.columns.map((column) =>
              column.competitions.length > 0 ? (
                <th
                  key={column.season}
                  scope="colgroup"
                  colSpan={column.competitions.length}
                  className="aw-roll-split-head"
                >
                  <Link to={`/awards/${column.slug}`}>{column.full}</Link>
                </th>
              ) : (
                <th key={column.season} scope="col" rowSpan={anySplit ? 2 : 1}>
                  <Link to={`/awards/${column.slug}`}>{column.full}</Link>
                </th>
              ),
            )}
          </tr>
          {anySplit && (
            <tr>
              {roll.columns.flatMap((column) =>
                column.competitions.map((label, index) => (
                  <th
                    key={`${column.season}-${label}`}
                    scope="col"
                    className={`aw-roll-split${index > 0 ? " aw-roll-divide" : ""}`}
                  >
                    {label}
                  </th>
                )),
              )}
            </tr>
          )}
        </thead>
        {roll.groups.map((group) => (
          <tbody key={group.name}>
            <tr>
              <th scope="colgroup" colSpan={width} className="aw-roll-group">
                <span className="t-label">{group.name}</span>
              </th>
            </tr>
            {group.rows.map((row) => (
              <tr key={row.name}>
                <th scope="row" className="aw-roll-name">
                  {row.name}
                </th>
                {row.entries.map((entry, index) => {
                  const season = roll.columns[index]!.season;
                  if (entry.kind === "split") {
                    return entry.cells.map((cell, i) => (
                      <td
                        key={`${season}-${i}`}
                        className={`aw-roll-split${i > 0 ? " aw-roll-divide" : ""}`}
                      >
                        <RollCellView cell={cell} />
                      </td>
                    ));
                  }
                  if (entry.kind === "span") {
                    return (
                      <td
                        key={season}
                        colSpan={roll.columns[index]!.competitions.length}
                        className="aw-roll-split aw-roll-span"
                      >
                        <RollCellView cell={entry.cell} />{" "}
                        <span className="t-label aw-roll-tag">Club-wide</span>
                      </td>
                    );
                  }
                  return (
                    <td key={season}>
                      <RollCellView cell={entry.cell} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        ))}
      </table>
    </div>
  );
}

export default function Awards({ loaderData, params }: Route.ComponentProps) {
  const awards = loaderData.awards as AwardsFile;
  const players = loaderData.players as Player[];
  const evening = findEvening(awards, params.season)!;
  const page = useMemo(
    () => buildAwardsPage(awards, evening, players, assetUrl),
    [awards, evening, players],
  );
  // On a phone the competitions show one at a time (see awards.css).
  const [shownCompetition, setShownCompetition] = useState(page.competitions[0]?.label);
  const split = page.competitions.length > 0;
  const clubWideCount = page.clubWide.reduce((total, group) => total + group.awards.length, 0);

  const jump = [
    ...page.competitions.map((c) => ({ name: c.label, href: `#${c.id}`, count: String(c.count) })),
    ...(page.clubWide.length > 0
      ? [{ name: split ? "Honours" : "Season awards", href: "#honours", count: String(clubWideCount) }]
      : []),
    ...(page.club.length > 0 ? [{ name: "Club awards", href: "#club", count: String(page.club.length) }] : []),
    { name: "Roll of honour", href: "#roll", count: "" },
  ];

  return (
    <div className="aw-root">
      <div className="aw-main">
        <section className="aw-intro">
          <div className="aw-intro-text">
            <span className="t-label muted">Club history · {page.title}</span>
            <h1 className="t-display aw-h1">Awards {page.full}</h1>
          </div>
          <nav className="aw-scroll aw-seasons" aria-label="Season">
            {page.seasons.map((season) =>
              season.current ? (
                <span key={season.season} aria-current="page" className="aw-season aw-season-current">
                  {season.full}
                </span>
              ) : (
                <Link key={season.season} to={`/awards/${season.slug}`} className="aw-season">
                  {season.full}
                </Link>
              ),
            )}
          </nav>
        </section>

        {!page.announced && (
          <p className="muted aw-pending">
            The winners are announced on the night. Check back after the awards evening.
          </p>
        )}

        {page.mvps.length > 0 && (
          <section aria-labelledby="mvp-h" className="aw-mvp-section">
            <h2 id="mvp-h" className="t-label muted aw-section-label">
              {page.mvps.length > 1 ? "Most valuable players" : "Most valuable player"}
            </h2>
            <div className="aw-mvps">
              {page.mvps.map((mvp) => (
                <article key={mvp.label ?? "club"} className="aw-mvp">
                  <div className="aw-mvp-photo">
                    <WinnerPhoto winner={mvp.winner} className="aw-mvp-img" />
                  </div>
                  <div className="aw-mvp-text">
                    <div className="aw-mvp-heading">
                      <span className="t-display aw-mvp-code">{mvp.label ?? "MVP"}</span>
                      <span className="muted aw-mvp-full">Most valuable player</span>
                    </div>
                    <div className="aw-mvp-winner">
                      <span className="aw-mvp-badge">MVP · {page.full}</span>
                      <WinnerName winner={mvp.winner} className="t-display aw-mvp-name" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <nav className="aw-scroll aw-jump" aria-label="On this page">
          {jump.map((link) => (
            <a key={link.href} href={link.href} className="aw-jump-link">
              <span className="t-label">{link.name}</span>
              {link.count && <span className="t-data muted aw-jump-count">{link.count}</span>}
            </a>
          ))}
        </nav>

        <Stripe />

        {split && (
          <section id="competitions" aria-labelledby="comp-h" className="aw-section">
            <div className="aw-section-head">
              <div>
                <h2 id="comp-h" className="t-heading aw-h2">Competition awards</h2>
                <p className="muted aw-section-intro">
                  Each competition has its own set of awards, listed in the same order so you can read across.
                </p>
              </div>
              <a href="#roll" className="aw-past-link">Past winners</a>
            </div>
            <div className="aw-compswitch" role="group" aria-label="Competition">
              {page.competitions.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  aria-pressed={shownCompetition === c.label}
                  onClick={() => setShownCompetition(c.label)}
                  className="aw-compswitch-btn"
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="aw-comps">
              {page.competitions.map((c) => (
                <section
                  key={c.label}
                  id={c.id}
                  aria-labelledby={`${c.id}-h`}
                  className="aw-card aw-comp"
                  data-hidden={shownCompetition !== c.label}
                >
                  <div className="aw-comphead">
                    <h3 id={`${c.id}-h`} className="t-display aw-comp-code">{c.label}</h3>
                    <span className="t-data muted">
                      {c.count} {c.count === 1 ? "award" : "awards"}
                    </span>
                  </div>
                  {c.groups.map((group) => (
                    <div key={group.name} className="aw-compgroup">
                      <h4 className="t-label muted aw-group-label">{group.name}</h4>
                      {group.awards.map((award, index) => (
                        <CompetitionRow key={`${award.name}-${index}`} award={award} />
                      ))}
                    </div>
                  ))}
                </section>
              ))}
            </div>
          </section>
        )}

        {page.clubWide.length > 0 && (
          <section id="honours" aria-labelledby="honours-h" className="aw-section">
            <div className="aw-section-head aw-section-rule">
              <div>
                <h2 id="honours-h" className="t-heading aw-h2">
                  {split ? "Coaches’ and manager’s honours" : "Season awards"}
                </h2>
                {split && (
                  <p className="muted aw-section-intro">Chosen across the whole season, both competitions.</p>
                )}
              </div>
              <a href="#roll" className="aw-past-link">Past winners</a>
            </div>
            {page.clubWide.map((group) => (
              <div key={group.name} className="aw-honour-group">
                {page.clubWide.length > 1 && (
                  <h3 className="t-label muted aw-group-label">{group.name}</h3>
                )}
                <div className="aw-honours">
                  {group.awards.map((award, index) => (
                    <HonourCard key={`${award.name}-${index}`} award={award} />
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {page.club.length > 0 && (
          <section id="club" aria-labelledby="club-h" className="aw-section">
            <div className="aw-section-head aw-section-rule">
              <div>
                <h2 id="club-h" className="t-heading aw-h2">Club awards</h2>
                <p className="muted aw-section-intro">Voted on in the changing room. New categories every year.</p>
              </div>
              <span className="t-data muted">
                {page.club.length} {page.club.length === 1 ? "award" : "awards"}
              </span>
            </div>
            <div className="aw-club-grid">
              {page.club.map((award, index) => (
                <ClubCard key={`${award.name}-${index}`} award={award} />
              ))}
            </div>
          </section>
        )}

        <Stripe />

        <section id="roll" aria-labelledby="roll-h" className="aw-section">
          <div className="aw-intro-text">
            <span className="t-label muted">All seasons</span>
            <h2 id="roll-h" className="t-heading aw-h2">Roll of honour</h2>
            <p className="muted aw-section-intro">
              Every recurring award, season by season. Where a season split its awards between competitions, each
              gets its own column.
            </p>
          </div>
          <RollOfHonour awards={awards} players={players} />
          <p className="muted aw-roll-foot">Select a season to see its full awards evening.</p>
        </section>
      </div>
    </div>
  );
}
