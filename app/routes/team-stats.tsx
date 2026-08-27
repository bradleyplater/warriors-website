import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/team-stats";
import { getResults } from "~/data/client";
import { BarChart, type BarDatum } from "~/components/ds/BarChart";
import { DataTable, type DataTableColumn } from "~/components/ds/DataTable";
import { SectionHead } from "~/components/ds/SectionHead";
import { StatGrid, type Stat } from "~/components/ds/StatGrid";
import { Stripe } from "~/components/ds/Stripe";
import "./team-stats.css";

export function meta() {
  return [{ title: "Team Stats — Peterborough Warriors" }];
}

export async function clientLoader() {
  const results = await getResults<unknown[]>();
  return { results };
}

// ── Types ─────────────────────────────────────────────────────────────────────

type GoalEntry = { type: string };
type PenaltyEntry = { duration: number; type: string };
type PeriodScore = {
  goals: GoalEntry[];
  opponentGoals: GoalEntry[];
  penalties: PenaltyEntry[];
  opponentPenalties: PenaltyEntry[];
};
type RawResult = {
  seasonId: string;
  date: string;
  location: "HOME" | "AWAY";
  competition: string;
  opponentTeam: string;
  score: {
    warriorsScore: number;
    opponentScore: number;
    period: { one: PeriodScore; two: PeriodScore; three: PeriodScore };
  };
};

const ALL_TIME = "All time";
const ALL_COMPETITIONS = "All";

/** Game sheets carry three periods; recreational fixtures are not played to overtime. */
const PERIOD_LABELS: Array<[keyof RawResult["score"]["period"], string]> = [
  ["one", "1st"],
  ["two", "2nd"],
  ["three", "3rd"],
];

/** Beyond this the per-game bars stop being readable, so the chart shows the latest run. */
const CHART_GAMES = 12;

// ── Helpers ───────────────────────────────────────────────────────────────────

function periods(r: RawResult): PeriodScore[] {
  return PERIOD_LABELS.map(([key]) => r.score.period[key]);
}

function getResult(r: RawResult): "W" | "D" | "L" {
  if (r.score.warriorsScore > r.score.opponentScore) return "W";
  if (r.score.warriorsScore < r.score.opponentScore) return "L";
  return "D";
}

function calcBestStreak(games: RawResult[], type: "win" | "unbeaten"): number {
  let current = 0;
  let best = 0;
  for (const g of games) {
    const res = getResult(g);
    const qualifies = type === "win" ? res === "W" : res !== "L";
    if (qualifies) {
      current++;
      if (current > best) best = current;
    } else {
      current = 0;
    }
  }
  return best;
}

/** Three-letter opponent code for the chart axis; the full name stays in the tooltip. */
function abbreviate(name: string): string {
  const words = (name ?? "").replace(/[^A-Za-z ]/g, " ").split(/\s+/).filter(Boolean);
  if (words.length === 0) return "—";
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return (words[0][0] + words[words.length - 1].slice(0, 2)).toUpperCase();
}

const monthYear = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" });
const dayMonth = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

function signed(n: number): string {
  return n > 0 ? `+${n}` : String(n);
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

// ── Stats computation ─────────────────────────────────────────────────────────

type Split = { key: string; gp: number; w: number; d: number; l: number; gf: number; ga: number };
type PeriodSplit = { label: string; for: number; against: number };
type Streak = { key: string; win: number; unbeaten: number };

interface TeamStats {
  gp: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  wins: number;
  draws: number;
  losses: number;
  winPct: number;
  gpg: number;
  gcpg: number;
  periodSplits: PeriodSplit[];
  perGame: BarDatum[];
  perGameShown: number;
  splits: Split[];
  streaks: Streak[];
  currentForm: Array<"W" | "D" | "L">;
  pimTotal: number;
  pimPerGame: number;
  minors: number;
  majors: number;
  misconducts: number;
  ppGoals: number;
  ppOpps: number;
  ppPct: number;
  pkOpps: number;
  pkKills: number;
  pkPct: number;
  range: string;
}

function splitFor(key: string, games: RawResult[]): Split {
  return {
    key,
    gp: games.length,
    w: games.filter((g) => getResult(g) === "W").length,
    d: games.filter((g) => getResult(g) === "D").length,
    l: games.filter((g) => getResult(g) === "L").length,
    gf: games.reduce((s, g) => s + g.score.warriorsScore, 0),
    ga: games.reduce((s, g) => s + g.score.opponentScore, 0),
  };
}

function computeStats(results: RawResult[]): TeamStats {
  const chrono = [...results].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const gp = chrono.length;
  const goalsFor = chrono.reduce((s, r) => s + r.score.warriorsScore, 0);
  const goalsAgainst = chrono.reduce((s, r) => s + r.score.opponentScore, 0);
  const wins = chrono.filter((r) => getResult(r) === "W").length;
  const losses = chrono.filter((r) => getResult(r) === "L").length;
  const draws = chrono.filter((r) => getResult(r) === "D").length;

  const homeGames = chrono.filter((r) => r.location === "HOME");
  const awayGames = chrono.filter((r) => r.location === "AWAY");

  const periodSplits = PERIOD_LABELS.map(([key, label]) => ({
    label,
    for: chrono.reduce((s, r) => s + r.score.period[key].goals.length, 0),
    against: chrono.reduce((s, r) => s + r.score.period[key].opponentGoals.length, 0),
  }));

  const shown = chrono.slice(-CHART_GAMES);
  const perGame: BarDatum[] = shown.map((r) => ({
    label: abbreviate(r.opponentTeam),
    value: r.score.warriorsScore,
    title: `${dayMonth.format(new Date(r.date))} ${r.location === "HOME" ? "vs" : "at"} ${
      r.opponentTeam
    } — ${r.score.warriorsScore}-${r.score.opponentScore}`,
  }));

  let ppGoals = 0;
  let ppOpps = 0;
  let pkOpps = 0;
  let ppGoalsAgainst = 0;
  let pimTotal = 0;
  let minors = 0;
  let majors = 0;
  let misconducts = 0;
  for (const r of chrono) {
    for (const p of periods(r)) {
      ppGoals += p.goals.filter((g) => g.type === "PP").length;
      ppOpps += p.opponentPenalties.length;
      pkOpps += p.penalties.length;
      ppGoalsAgainst += p.opponentGoals.filter((g) => g.type === "PP").length;
      for (const pen of p.penalties) {
        pimTotal += pen.duration;
        // A double minor is still a minor; anything from ten up is a misconduct.
        if (pen.duration <= 4) minors++;
        else if (pen.duration < 10) majors++;
        else misconducts++;
      }
    }
  }

  const first = chrono[0];
  const last = chrono[chrono.length - 1];
  const firstLabel = first ? monthYear.format(new Date(first.date)) : "";
  const lastLabel = last ? monthYear.format(new Date(last.date)) : "";

  return {
    gp,
    goalsFor,
    goalsAgainst,
    goalDiff: goalsFor - goalsAgainst,
    wins,
    draws,
    losses,
    winPct: gp > 0 ? (wins / gp) * 100 : 0,
    gpg: gp > 0 ? goalsFor / gp : 0,
    gcpg: gp > 0 ? goalsAgainst / gp : 0,
    periodSplits,
    perGame,
    perGameShown: shown.length,
    splits: [splitFor("Home", homeGames), splitFor("Away", awayGames)],
    streaks: [
      { key: "Overall", win: calcBestStreak(chrono, "win"), unbeaten: calcBestStreak(chrono, "unbeaten") },
      { key: "Home", win: calcBestStreak(homeGames, "win"), unbeaten: calcBestStreak(homeGames, "unbeaten") },
      { key: "Away", win: calcBestStreak(awayGames, "win"), unbeaten: calcBestStreak(awayGames, "unbeaten") },
    ],
    currentForm: chrono.slice(-5).map(getResult),
    pimTotal,
    pimPerGame: gp > 0 ? pimTotal / gp : 0,
    minors,
    majors,
    misconducts,
    ppGoals,
    ppOpps,
    ppPct: ppOpps > 0 ? (ppGoals / ppOpps) * 100 : 0,
    pkOpps,
    pkKills: pkOpps - ppGoalsAgainst,
    pkPct: pkOpps > 0 ? Math.max(0, (pkOpps - ppGoalsAgainst) / pkOpps) * 100 : 0,
    range: firstLabel === lastLabel ? firstLabel : `${firstLabel} – ${lastLabel}`,
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Chip({
  label,
  active,
  onClick,
  variant = "label",
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  variant?: "label" | "data";
}) {
  return (
    <button
      type="button"
      className={`ds-chip ${variant === "data" ? "t-data ts-chip-data" : "t-label"}`}
      aria-pressed={active}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function SectionBar({ title, note }: { title: string; note?: string }) {
  return (
    <div className="ts-section-bar">
      <h2 className="t-heading ts-section-title">{title}</h2>
      {note ? <span className="t-label ts-muted">{note}</span> : null}
    </div>
  );
}

function PeriodBars({ periodSplits }: { periodSplits: PeriodSplit[] }) {
  const max = Math.max(1, ...periodSplits.map((p) => Math.max(p.for, p.against)));
  return (
    <ul className="ts-periods">
      {periodSplits.map((p) => (
        <li className="ts-period" key={p.label}>
          <span className="t-label ts-muted ts-period-label">{p.label}</span>
          <div className="ts-period-bars">
            <div className="ts-period-line">
              <div className="ts-period-track">
                <div className="ts-period-fill ts-period-fill-for" style={{ width: `${(p.for / max) * 100}%` }} />
              </div>
              <span className="t-data ts-period-value">{p.for}</span>
            </div>
            <div className="ts-period-line">
              <div className="ts-period-track">
                <div
                  className="ts-period-fill ts-period-fill-against"
                  style={{ width: `${(p.against / max) * 100}%` }}
                />
              </div>
              <span className="t-data ts-period-value ts-muted">{p.against}</span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function FormBadge({ result }: { result: "W" | "D" | "L" }) {
  const tone = result === "W" ? "ts-form-w" : result === "L" ? "ts-form-l" : "ts-form-d";
  return <span className={`ts-form-badge ${tone}`}>{result}</span>;
}

// ── Page component ────────────────────────────────────────────────────────────

export default function TeamStats({ loaderData }: Route.ComponentProps) {
  const allResults = useMemo(
    () => (loaderData.results as RawResult[]).filter((r) => r.score !== undefined),
    [loaderData.results]
  );
  const seasons = useMemo(
    () =>
      Array.from(new Set(allResults.map((r) => r.seasonId))).sort(
        (a, b) => parseInt(b.split("/")[0], 10) - parseInt(a.split("/")[0], 10)
      ),
    [allResults]
  );

  // null means "not chosen yet" — the page opens on the most recent season.
  const [pickedSeason, setSeason] = useState<string | null>(null);
  const season = pickedSeason ?? seasons[0] ?? ALL_TIME;
  const allTime = season === ALL_TIME;
  const [competition, setCompetition] = useState(ALL_COMPETITIONS);

  const seasonResults = useMemo(
    () => (allTime ? allResults : allResults.filter((r) => r.seasonId === season)),
    [allResults, allTime, season]
  );

  const competitions = useMemo(
    () => Array.from(new Set(seasonResults.map((r) => r.competition))).sort(),
    [seasonResults]
  );

  useEffect(() => {
    if (competition !== ALL_COMPETITIONS && !competitions.includes(competition)) {
      setCompetition(ALL_COMPETITIONS);
    }
  }, [competitions, competition]);

  const scopedGames = useMemo(() => {
    if (competition === ALL_COMPETITIONS || !competitions.includes(competition)) {
      return seasonResults;
    }
    return seasonResults.filter((r) => r.competition === competition);
  }, [seasonResults, competition, competitions]);

  const stats = useMemo(() => computeStats(scopedGames), [scopedGames]);

  const seasonNote =
    stats.gp === 0 ? "No games recorded" : `${plural(stats.gp, "game")} · ${stats.range}`;

  const topline: Stat[] = [
    { label: "Games played", value: stats.gp },
    { label: "Goals for", value: stats.goalsFor },
    { label: "Goals against", value: stats.goalsAgainst },
    { label: "Goals for / game", value: stats.gpg.toFixed(2) },
    { label: "Goals against / game", value: stats.gcpg.toFixed(2) },
    { label: "Win rate", value: Math.round(stats.winPct), unit: "%" },
    { label: "Power play", value: stats.ppPct.toFixed(1), unit: "%" },
    { label: "Penalty kill", value: stats.pkPct.toFixed(1), unit: "%" },
  ];

  const splitColumns: DataTableColumn[] = [
    { header: "" },
    { header: "GP", numeric: true, align: "right" },
    { header: "W", numeric: true, align: "right" },
    { header: "D", numeric: true, align: "right" },
    { header: "L", numeric: true, align: "right" },
    { header: "GF", numeric: true, align: "right" },
    { header: "GA", numeric: true, align: "right" },
    { header: "GD", numeric: true, align: "right", strong: true },
  ];
  const splitRows = stats.splits.map((s) => [
    s.key,
    s.gp,
    s.w,
    s.d,
    s.l,
    s.gf,
    s.ga,
    signed(s.gf - s.ga),
  ]);

  const pimColumns: DataTableColumn[] = [
    { header: "" },
    { header: "Total", numeric: true, align: "right", strong: true },
  ];
  const pimRows: (string | number)[][] = [
    ["Total penalty minutes", stats.pimTotal],
    ["Penalty minutes / game", stats.pimPerGame.toFixed(1)],
    ["Minors", stats.minors],
    ["Majors", stats.majors],
    ["Misconducts", stats.misconducts],
    ["Power play goals", stats.ppOpps > 0 ? `${stats.ppGoals} / ${stats.ppOpps}` : "—"],
    ["Penalties killed", stats.pkOpps > 0 ? `${stats.pkKills} / ${stats.pkOpps}` : "—"],
  ];

  const streakColumns: DataTableColumn[] = [
    { header: "" },
    { header: "Wins", numeric: true, align: "right", strong: true },
    { header: "Unbeaten", numeric: true, align: "right" },
  ];
  const streakRows = stats.streaks.map((s) => [s.key, s.win, s.unbeaten]);

  const scored = stats.perGame.map((g) => g.value);
  const perGameNote =
    scored.length === 0
      ? ""
      : `Highest ${Math.max(...scored)} · lowest ${Math.min(...scored)} · average ${(
          scored.reduce((a, b) => a + b, 0) / scored.length
        ).toFixed(1)}`;
  const perGameHead =
    stats.perGameShown < stats.gp
      ? `Last ${stats.perGameShown} of ${stats.gp} games`
      : "Scored, game by game";

  return (
    <div className="ts-page">
      <section className="ts-intro">
        <SectionHead eyebrow="England Ice Hockey recreational" title="Team stats">
          Club totals taken from the official game sheets. Shots and face-offs are not recorded in
          recreational competition, so no shooting or possession figures are held.
        </SectionHead>

        <div className="ts-filter-row" role="group" aria-label="Season">
          <span className="t-label ts-muted">Season</span>
          <div className="ts-chip-set">
            <Chip
              label={ALL_TIME}
              active={allTime}
              onClick={() => setSeason(ALL_TIME)}
              variant="data"
            />
            {seasons.map((s) => (
              <Chip
                key={s}
                label={s}
                active={season === s}
                onClick={() => setSeason(s)}
                variant="data"
              />
            ))}
          </div>
          <span className="t-label ts-muted ts-filter-note">{seasonNote}</span>
        </div>

        <div className="ts-filter-row" role="group" aria-label="Competition">
          <span className="t-label ts-muted">Competition</span>
          <div className="ts-chip-set">
            <Chip
              label={ALL_COMPETITIONS}
              active={competition === ALL_COMPETITIONS}
              onClick={() => setCompetition(ALL_COMPETITIONS)}
            />
            {competitions.map((c) => (
              <Chip
                key={c}
                label={c}
                active={competition === c}
                onClick={() => setCompetition(c)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="ts-record" aria-label="Season record">
        <div className="ts-record-inner">
          <div className="ts-record-heads">
            <div className="ts-record-item">
              <span className="t-label ts-muted">Record — W · D · L</span>
              <span className="ts-record-value">
                {stats.wins}-{stats.draws}-{stats.losses}
              </span>
            </div>
            <div className="ts-record-item">
              <span className="t-label ts-muted">Goal difference</span>
              <span className="ts-record-value">{signed(stats.goalDiff)}</span>
            </div>
          </div>
          <StatGrid stats={topline} min={130} />
        </div>
      </section>

      <Stripe />

      <section className="ts-grid ts-grid-top">
        <div>
          <SectionBar title="Goals by period" note="Scored · conceded" />
          {stats.gp === 0 ? (
            <p className="ts-empty">No games match these filters.</p>
          ) : (
            <PeriodBars periodSplits={stats.periodSplits} />
          )}
        </div>
        <div>
          <SectionBar title="Goals per game" note={perGameHead} />
          {stats.perGame.length === 0 ? (
            <p className="ts-empty">Nothing to plot for these filters.</p>
          ) : (
            <>
              <BarChart data={stats.perGame} height={200} showValues />
              <p className="t-label ts-muted ts-chart-note">{perGameNote}</p>
            </>
          )}
        </div>
      </section>

      <section className="ts-grid">
        <div>
          <SectionBar title="Home and away" />
          <div className="ts-table-scroll">
            <DataTable className="ts-table-wide" columns={splitColumns} rows={splitRows} />
          </div>
          <p className="t-label ts-muted ts-chart-note">
            GP games played · W wins · D draws · L losses · GF goals for · GA goals against · GD
            goal difference
          </p>
        </div>
        <div>
          <SectionBar title="Discipline" />
          <div className="ts-table-scroll">
            <DataTable className="ts-table-wide" columns={pimColumns} rows={pimRows} />
          </div>
        </div>
      </section>

      <section className="ts-grid">
        <div>
          <SectionBar title="Current form" note="Oldest to most recent" />
          <div className="ts-form-badges">
            {stats.currentForm.length === 0 ? (
              <span className="ts-muted">No results available.</span>
            ) : (
              stats.currentForm.map((r, i) => <FormBadge key={i} result={r} />)
            )}
          </div>
        </div>
        <div>
          <SectionBar title="Best streaks" />
          <div className="ts-table-scroll">
            <DataTable className="ts-table-wide" columns={streakColumns} rows={streakRows} />
          </div>
        </div>
      </section>

      <section className="ts-grid ts-grid-foot">
        <div className="ts-footer-note">
          <p className="ts-footer-note-text">
            Individual scoring, goaltending and penalty minutes are on the player statistics page.
            Every figure here is taken from the same game sheets.
          </p>
          <div className="ts-footer-note-actions">
            <Link to="/stats" className="ds-btn ds-btn-primary ds-btn-md">
              Player statistics
            </Link>
            <Link to="/results" className="ds-btn ds-btn-secondary ds-btn-md">
              All results
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
