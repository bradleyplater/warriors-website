import { useMemo, useState } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/stats";
import { getPlayers, getResults } from "~/data/client";
import { BarChart } from "~/components/ds/BarChart";
import { Button } from "~/components/ds/Button";
import { DataTable, type DataTableColumn } from "~/components/ds/DataTable";
import { SectionHead } from "~/components/ds/SectionHead";
import { Stripe } from "~/components/ds/Stripe";
import "./stats.css";

export function meta() {
  return [{ title: "Stats — Peterborough Warriors" }];
}

export async function clientLoader() {
  const [players, results] = await Promise.all([
    getPlayers<unknown[]>(),
    getResults<unknown[]>(),
  ]);
  return { players, results };
}

// ── Types ─────────────────────────────────────────────────────────────────────

type GoalEntry = { playerId: string; assists?: string[] };
type PenaltyEntry = { offender: string; duration: number };
type PeriodData = { goals?: GoalEntry[]; penalties?: PenaltyEntry[] };

type RawResult = {
  season: string;
  date: string;
  competition: string;
  roster: string[];
  netminderPlayerId: string;
  manOfTheMatchPlayerId: string;
  warriorOfTheGamePlayerId: string;
  score: {
    warriorsScore: number;
    opponentScore: number;
    period?: { one?: PeriodData; two?: PeriodData; three?: PeriodData };
  };
};

type PlayerInfo = { id: string; name: string; number: number; position: string };

type SkaterRow = {
  playerId: string;
  name: string;
  number: number;
  position: string;
  gp: number;
  goals: number;
  assists: number;
  points: number;
  ppg: number;
  pims: number;
  motm: number;
  wotg: number;
};

type GoalieRow = {
  playerId: string;
  name: string;
  number: number;
  gp: number;
  w: number;
  l: number;
  d: number;
  ga: number;
  gaa: number;
  so: number;
};

type SkaterSort = keyof Pick<
  SkaterRow,
  "name" | "number" | "gp" | "goals" | "assists" | "points" | "ppg" | "pims" | "motm" | "wotg"
>;
type GoalieSort = keyof Pick<
  GoalieRow,
  "name" | "number" | "gp" | "w" | "l" | "d" | "ga" | "gaa" | "so"
>;
type SortDir = "asc" | "desc";
type Metric = "points" | "goals" | "assists" | "pims";

/** Sentinel season value for the "All time" chip. */
const ALL_TIME = "All";

// ── Preparation ───────────────────────────────────────────────────────────────

type Prepared = {
  games: RawResult[]; // chronological, oldest first
  playerInfoMap: Map<string, PlayerInfo>;
  seasons: string[]; // newest first
  competitions: string[];
};

function prepare(results: RawResult[], players: PlayerInfo[]): Prepared {
  const playerInfoMap = new Map(players.map((p) => [p.id, p]));

  const games = results
    .filter((r) => r?.score && Array.isArray(r.roster) && r.roster.length > 0)
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const seasons = Array.from(new Set(games.map((g) => g.season || "Unknown"))).sort(
    (a, b) => parseInt(b.split("/")[0], 10) - parseInt(a.split("/")[0], 10)
  );
  const competitions = Array.from(new Set(games.map((g) => g.competition || "Unknown"))).sort();

  return { games, playerInfoMap, seasons, competitions };
}

function periodsOf(game: RawResult): PeriodData[] {
  const p = game.score.period;
  return p ? ([p.one, p.two, p.three].filter(Boolean) as PeriodData[]) : [];
}

/** "MISSING" is the pipeline's null — treat it as no netminder recorded. */
function netminderOf(game: RawResult): string | null {
  const n = game.netminderPlayerId;
  return n && n !== "MISSING" ? n : null;
}

function tallyInGame(game: RawResult, playerId: string) {
  let goals = 0;
  let assists = 0;
  let pims = 0;
  for (const period of periodsOf(game)) {
    for (const goal of period.goals ?? []) {
      if (goal.playerId === playerId) goals++;
      if (goal.assists?.includes(playerId)) assists++;
    }
    for (const pen of period.penalties ?? []) {
      if (pen.offender === playerId) pims += pen.duration;
    }
  }
  return { goals, assists, pims };
}

/** Skater and goaltending tables for one filtered set of games, in one pass. */
function buildRows(games: RawResult[], playerInfoMap: Map<string, PlayerInfo>) {
  const skaterMap = new Map<string, SkaterRow>();
  const goalieMap = new Map<string, GoalieRow>();

  for (const game of games) {
    const net = netminderOf(game);
    const info = net ? playerInfoMap.get(net) : undefined;

    if (net && info) {
      const row =
        goalieMap.get(net) ??
        { playerId: net, name: info.name, number: info.number, gp: 0, w: 0, l: 0, d: 0, ga: 0, gaa: 0, so: 0 };
      row.gp++;
      row.ga += game.score.opponentScore;
      if (game.score.warriorsScore > game.score.opponentScore) row.w++;
      else if (game.score.warriorsScore < game.score.opponentScore) row.l++;
      else row.d++;
      if (game.score.opponentScore === 0) row.so++;
      goalieMap.set(net, row);
    }

    // The netminder is excluded from this game's skater tally.
    for (const playerId of game.roster) {
      if (playerId === net) continue;
      const skater = playerInfoMap.get(playerId);
      if (!skater) continue;

      const row =
        skaterMap.get(playerId) ??
        {
          playerId,
          name: skater.name,
          number: skater.number,
          position: skater.position,
          gp: 0, goals: 0, assists: 0, points: 0, ppg: 0, pims: 0, motm: 0, wotg: 0,
        };
      const tally = tallyInGame(game, playerId);
      row.gp++;
      row.goals += tally.goals;
      row.assists += tally.assists;
      row.pims += tally.pims;
      if (game.manOfTheMatchPlayerId === playerId) row.motm++;
      if (game.warriorOfTheGamePlayerId === playerId) row.wotg++;
      skaterMap.set(playerId, row);
    }
  }

  const skaters = Array.from(skaterMap.values()).map((r) => ({
    ...r,
    points: r.goals + r.assists,
    ppg: r.gp ? (r.goals + r.assists) / r.gp : 0,
  }));
  const goalies = Array.from(goalieMap.values()).map((r) => ({
    ...r,
    gaa: r.gp ? r.ga / r.gp : 0,
  }));

  return { skaters, goalies };
}

// ── Small helpers ─────────────────────────────────────────────────────────────

const POS_SHORT: Record<string, string> = { Forward: "F", Defence: "D", Goaltender: "G" };

/** "Forward / Defence" → "F/D". */
function posAbbrev(position: string) {
  return position
    .split("/")
    .map((part) => POS_SHORT[part.trim()] ?? part.trim().charAt(0).toUpperCase())
    .join("/");
}

function lastName(name: string) {
  return name.trim().split(/\s+/).slice(-1)[0];
}

function sortRows<T extends SkaterRow | GoalieRow>(rows: T[], key: keyof T, dir: SortDir): T[] {
  return rows.slice().sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    const cmp =
      typeof av === "string" && typeof bv === "string"
        ? av.localeCompare(bv)
        : (av as number) - (bv as number);
    return dir === "asc" ? cmp : -cmp;
  });
}

function csvCell(value: string | number) {
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// ── Filter option tables ──────────────────────────────────────────────────────

const POS_FILTERS: { label: string; value: string }[] = [
  { label: "All", value: "All" },
  { label: "Forwards", value: "Forward" },
  { label: "Defence", value: "Defence" },
  { label: "Goaltenders", value: "Goaltender" },
];

const SORT_CHIPS: { label: string; field: SkaterSort }[] = [
  { label: "Points", field: "points" },
  { label: "Goals", field: "goals" },
  { label: "Assists", field: "assists" },
  { label: "Per game", field: "ppg" },
  { label: "PIM", field: "pims" },
  { label: "Number", field: "number" },
];

const METRIC_CHIPS: { label: string; value: Metric }[] = [
  { label: "Points", value: "points" },
  { label: "Goals", value: "goals" },
  { label: "Assists", value: "assists" },
  { label: "PIM", value: "pims" },
];

const SERIES = ["var(--series-1)", "var(--series-2)", "var(--series-3)", "var(--series-4)"];

// Chart geometry, in viewBox units. Tick labels are real HTML positioned over
// the plot as a percentage, so they keep the token type and stay crisp.
const VW = 760;
const VH = 300;
const PAD_L = 46;
const PAD_R = 14;
const PAD_T = 14;
const PAD_B = 34;

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
      className={`ds-chip ${variant === "data" ? "t-data stats-chip-data" : "t-label"}`}
      aria-pressed={active}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function SectionBar({ title, note }: { title: string; note: string }) {
  return (
    <div className="stats-section-bar">
      <h2 className="t-heading stats-section-title">{title}</h2>
      <span className="t-label stats-muted">{note}</span>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Stats({ loaderData }: Route.ComponentProps) {
  const { games, playerInfoMap, seasons, competitions } = useMemo(
    () => prepare(loaderData.results as RawResult[], loaderData.players as PlayerInfo[]),
    [loaderData.results, loaderData.players]
  );

  // null means "not chosen yet" — the page opens on the most recent season.
  const [pickedSeason, setSeason] = useState<string | null>(null);
  const season = pickedSeason ?? seasons[0] ?? "";
  const allTime = season === ALL_TIME;
  const [competition, setCompetition] = useState("All");
  const [pos, setPos] = useState("All");
  const [skaterSort, setSkaterSort] = useState<SkaterSort>("points");
  const [skaterDir, setSkaterDir] = useState<SortDir>("desc");
  const [goalieSort, setGoalieSort] = useState<GoalieSort>("gaa");
  const [goalieDir, setGoalieDir] = useState<SortDir>("asc");
  const [metric, setMetric] = useState<Metric>("points");

  /** The season and competition chips scope every section on the page. */
  const scopedGames = useMemo(
    () =>
      games.filter(
        (g) =>
          (allTime || g.season === season) &&
          (competition === "All" || g.competition === competition)
      ),
    [games, allTime, season, competition]
  );

  const { skaters, goalies } = useMemo(
    () => buildRows(scopedGames, playerInfoMap),
    [scopedGames, playerInfoMap]
  );

  const filteredSkaters = useMemo(
    () => (pos === "All" ? skaters : skaters.filter((r) => r.position.includes(pos))),
    [skaters, pos]
  );
  const skaterRows = useMemo(
    () => sortRows(filteredSkaters, skaterSort, skaterDir),
    [filteredSkaters, skaterSort, skaterDir]
  );
  const goalieRows = useMemo(
    () => sortRows(goalies, goalieSort, goalieDir),
    [goalies, goalieSort, goalieDir]
  );

  // ── Season leaders ─────────────────────────────────────────────────────────

  // A netminder with one appearance can post a flattering average, so the GAA
  // leader has to have played a share of the games in scope.
  const gaaMinGP = Math.max(3, Math.round(scopedGames.length * 0.1));

  const leaders = useMemo(() => {
    const best = (key: "goals" | "assists" | "points") =>
      skaters.slice().sort((a, b) => b[key] - a[key])[0];
    const byGaa = (rows: GoalieRow[]) => rows.slice().sort((a, b) => a.gaa - b.gaa || b.gp - a.gp)[0];
    const qualified = goalies.filter((g) => g.gp >= gaaMinGP);
    const keeper = byGaa(qualified.length ? qualified : goalies);

    const skaterLeader = (title: string, key: "goals" | "assists" | "points") => {
      const p = best(key);
      return {
        title,
        value: p ? String(p[key]) : "—",
        name: p ? p.name : "No games recorded",
        meta: p ? `#${p.number} · ${posAbbrev(p.position)} · ${p.gp} GP` : "",
      };
    };

    return [
      skaterLeader("Goals", "goals"),
      skaterLeader("Assists", "assists"),
      skaterLeader("Points", "points"),
      {
        title: "Goals against average",
        value: keeper ? keeper.gaa.toFixed(2) : "—",
        name: keeper ? keeper.name : "No netminder recorded",
        meta: keeper ? `#${keeper.number} · G · ${keeper.gp} GP` : "",
      },
    ];
  }, [skaters, goalies, gaaMinGP]);

  // ── Progression chart ──────────────────────────────────────────────────────

  const seasonsAsc = useMemo(
    () => Array.from(new Set(scopedGames.map((g) => g.season))),
    [scopedGames]
  );

  const chart = useMemo(() => {
    const picked = skaters
      .slice()
      .sort((a, b) => b[metric] - a[metric])
      .slice(0, 4)
      .filter((p) => p[metric] > 0);

    const valueInGame = (game: RawResult, playerId: string) => {
      if (netminderOf(game) === playerId || !game.roster.includes(playerId)) return 0;
      const t = tallyInGame(game, playerId);
      if (metric === "goals") return t.goals;
      if (metric === "assists") return t.assists;
      if (metric === "pims") return t.pims;
      return t.goals + t.assists;
    };

    // The axis is always one step per game; the range toggle only changes which
    // games are on it.
    const series = picked.map((player) => {
      const cum = [0];
      let run = 0;
      for (const game of scopedGames) {
        run += valueInGame(game, player.playerId);
        cum.push(run);
      }
      return { player, cum };
    });

    const steps = Math.max(1, scopedGames.length);
    const peak = Math.max(1, ...series.map((s) => s.cum[s.cum.length - 1]));
    const grain = peak > 40 ? 5 : 2;
    const step = Math.max(1, Math.ceil(peak / 4 / grain) * grain);
    const niceMax = step * 4;

    const px = (i: number) => PAD_L + (i * (VW - PAD_L - PAD_R)) / steps;
    const py = (v: number) => VH - PAD_B - (v / niceMax) * (VH - PAD_B - PAD_T);

    const lines = series.map((s, i) => ({
      key: s.player.playerId,
      name: s.player.name,
      meta: `#${s.player.number} · ${posAbbrev(s.player.position)}`,
      color: SERIES[i],
      total: s.cum[s.cum.length - 1],
      d: s.cum.map((v, j) => `${j ? "L" : "M"}${px(j).toFixed(1)} ${py(v).toFixed(1)}`).join(" "),
      endX: px(s.cum.length - 1).toFixed(1),
      endY: py(s.cum[s.cum.length - 1]).toFixed(1),
    }));

    const yTicks = [0, 1, 2, 3, 4].map((k) => ({
      v: step * k,
      y: py(step * k).toFixed(1),
      top: `${((py(step * k) / VH) * 100).toFixed(2)}%`,
    }));

    const xStep = Math.max(1, Math.ceil(steps / 12));
    const xTicks: { key: string; label: string; left: string }[] = [];
    for (let j = xStep; j <= steps; j += xStep) {
      xTicks.push({ key: String(j), label: String(j), left: `${((px(j) / VW) * 100).toFixed(2)}%` });
    }

    // Dividers mark where one season hands over to the next — all-time only.
    let acc = 0;
    const seasonMarks =
      seasonsAsc.length > 1
        ? seasonsAsc
            .map((label) => {
              const at = acc;
              acc += scopedGames.filter((g) => g.season === label).length;
              return {
                label,
                x: px(at).toFixed(1),
                left: `${((px(at) / VW) * 100).toFixed(2)}%`,
                show: at > 0,
              };
            })
            .filter((m) => m.show)
        : [];

    return { lines, yTicks, xTicks, seasonMarks, steps };
  }, [skaters, scopedGames, seasonsAsc, metric]);

  // ── Points breakdown and the two rate charts ───────────────────────────────

  const breakdown = useMemo(() => {
    const top = skaters.slice().sort((a, b) => b.points - a.points).slice(0, 10);
    const max = Math.max(1, ...top.map((p) => p.points));
    return top.map((p) => ({
      ...p,
      goalWidth: `${((p.goals / max) * 100).toFixed(1)}%`,
      assistWidth: `${((p.assists / max) * 100).toFixed(1)}%`,
    }));
  }, [skaters]);

  const pimData = useMemo(
    () =>
      skaters
        .slice()
        .sort((a, b) => b.pims - a.pims)
        .slice(0, 6)
        .filter((p) => p.pims > 0)
        .map((p) => ({ label: lastName(p.name), value: p.pims })),
    [skaters]
  );

  const ppgMinGP = Math.max(3, Math.round(scopedGames.length * 0.4));
  const ppgData = useMemo(
    () =>
      skaters
        .filter((p) => p.gp >= ppgMinGP)
        .sort((a, b) => b.ppg - a.ppg)
        .slice(0, 6)
        .map((p) => ({ label: lastName(p.name), value: Number(p.ppg.toFixed(2)) })),
    [skaters, ppgMinGP]
  );

  // ── Copy ───────────────────────────────────────────────────────────────────

  const gameCount = `${scopedGames.length} game${scopedGames.length === 1 ? "" : "s"}`;
  const seasonNote = allTime
    ? `${gameCount} · ${seasonsAsc.length} season${seasonsAsc.length === 1 ? "" : "s"}`
    : gameCount;
  const metricLabel = METRIC_CHIPS.find((m) => m.value === metric)!.label;
  const chartNote = `Cumulative ${metricLabel.toLowerCase()} · top four · ${gameCount}`;
  const rangeNote = `${allTime ? "All time" : season} · ${
    competition === "All" ? "All competitions" : competition
  }`;
  const axisFoot = allTime
    ? `Horizontal axis is game number, running from the first game of ${seasonsAsc[0] ?? "the record"} to the latest. A flat run is a game missed.`
    : "Horizontal axis is game number. A flat run is a game missed.";

  // ── Sort handling ──────────────────────────────────────────────────────────

  function pickSkaterSort(field: SkaterSort) {
    if (field === skaterSort) {
      setSkaterDir((d) => (d === "asc" ? "desc" : "asc"));
      return;
    }
    setSkaterSort(field);
    setSkaterDir(field === "name" || field === "number" ? "asc" : "desc");
  }

  function pickGoalieSort(field: GoalieSort) {
    if (field === goalieSort) {
      setGoalieDir((d) => (d === "asc" ? "desc" : "asc"));
      return;
    }
    setGoalieSort(field);
    setGoalieDir(field === "name" || field === "number" || field === "gaa" || field === "ga" ? "asc" : "desc");
  }

  function downloadCsv() {
    const head = ["#", "Player", "Position", "GP", "G", "A", "PTS", "PPG", "PIM", "MOTM", "WOTG"];
    const body = skaterRows.map((r) => [
      r.number, r.name, r.position, r.gp, r.goals, r.assists, r.points, r.ppg.toFixed(2), r.pims, r.motm, r.wotg,
    ]);
    const csv = [head, ...body].map((cols) => cols.map(csvCell).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const slug = allTime ? "all-time" : season.replace("/", "-");
    const link = document.createElement("a");
    link.href = url;
    link.download = `warriors-skater-stats-${slug}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  // ── Table definitions ──────────────────────────────────────────────────────

  const skaterColumns: DataTableColumn[] = [
    { header: "#", numeric: true, align: "right", sortKey: "number" },
    { header: "Player", sortKey: "name" },
    { header: "Pos" },
    { header: "GP", numeric: true, align: "right", sortKey: "gp" },
    { header: "G", numeric: true, align: "right", sortKey: "goals" },
    { header: "A", numeric: true, align: "right", sortKey: "assists" },
    { header: "PTS", numeric: true, align: "right", strong: true, sortKey: "points" },
    { header: "PPG", numeric: true, align: "right", sortKey: "ppg" },
    { header: "PIM", numeric: true, align: "right", sortKey: "pims" },
    { header: "MOTM", numeric: true, align: "right", sortKey: "motm" },
    { header: "WOTG", numeric: true, align: "right", sortKey: "wotg" },
  ];

  const goalieColumns: DataTableColumn[] = [
    { header: "#", numeric: true, align: "right", sortKey: "number" },
    { header: "Goaltender", sortKey: "name" },
    { header: "GP", numeric: true, align: "right", sortKey: "gp" },
    { header: "W", numeric: true, align: "right", sortKey: "w" },
    { header: "L", numeric: true, align: "right", sortKey: "l" },
    { header: "D", numeric: true, align: "right", sortKey: "d" },
    { header: "GA", numeric: true, align: "right", sortKey: "ga" },
    { header: "GAA", numeric: true, align: "right", strong: true, sortKey: "gaa" },
    { header: "SO", numeric: true, align: "right", sortKey: "so" },
  ];

  return (
    <div className="stats-page">
      <section className="stats-intro">
        <SectionHead eyebrow="England Ice Hockey recreational" title="Player statistics">
          Scoring is taken from the official game sheets. A netminder's appearances count
          towards their goaltending record, not their skater record.
        </SectionHead>

        <div className="stats-filter-row" role="group" aria-label="Season">
          <span className="t-label stats-muted">Season</span>
          <div className="stats-chip-set">
            <Chip
              label="All time"
              active={allTime}
              onClick={() => setSeason(ALL_TIME)}
              variant="data"
            />
            {seasons.map((s) => (
              <Chip key={s} label={s} active={season === s} onClick={() => setSeason(s)} variant="data" />
            ))}
          </div>
          <span className="t-label stats-muted stats-filter-note">{seasonNote}</span>
        </div>

        <div className="stats-filter-row" role="group" aria-label="Competition">
          <span className="t-label stats-muted">Competition</span>
          <div className="stats-chip-set">
            <Chip label="All" active={competition === "All"} onClick={() => setCompetition("All")} />
            {competitions.map((c) => (
              <Chip key={c} label={c} active={competition === c} onClick={() => setCompetition(c)} />
            ))}
          </div>
        </div>
      </section>

      <section className="stats-leaders" aria-label="Leaders">
        <div className="stats-leaders-inner">
          {leaders.map((l) => (
            <div className="stats-leader" key={l.title}>
              <span className="t-label stats-muted">{l.title}</span>
              <span className="stats-leader-value">{l.value}</span>
              <span className="t-heading stats-leader-name">{l.name}</span>
              <span className="t-label stats-muted">{l.meta}</span>
            </div>
          ))}
        </div>
      </section>

      <Stripe />

      <section className="stats-section stats-section-top">
        <SectionBar
          title="Goaltending"
          note={`${goalieRows.length} goaltender${goalieRows.length === 1 ? "" : "s"} · ${scopedGames.length} games`}
        />
        {goalieRows.length === 0 ? (
          <p className="stats-empty">No goaltending recorded for these filters.</p>
        ) : (
          <div className="stats-table-scroll">
            <DataTable
              className="stats-table-goalies"
              columns={goalieColumns}
              sortKey={goalieSort}
              sortDirection={goalieDir}
              onSort={(key) => pickGoalieSort(key as GoalieSort)}
              rows={goalieRows.map((r) => [
                r.number,
                <Link key={r.playerId} to={`/roster/${r.playerId}`} className="stats-player-link">
                  {r.name}
                </Link>,
                r.gp,
                r.w,
                r.l,
                r.d,
                r.ga,
                r.gaa.toFixed(2),
                r.so,
              ])}
            />
          </div>
        )}
        <p className="t-label stats-muted stats-legend">
          GP games played · W wins · L losses · D draws · GA goals against · GAA goals against
          average · SO shutouts
        </p>
      </section>

      <section className="stats-section">
        <SectionBar
          title="Skater scoring"
          note={`${skaterRows.length} skater${skaterRows.length === 1 ? "" : "s"} · ${scopedGames.length} games`}
        />
        <div className="stats-controls" role="group" aria-label="Sort and filter skaters">
          <span className="t-label stats-muted">Sort by</span>
          <div className="stats-chip-set">
            {SORT_CHIPS.map((s) => (
              <Chip
                key={s.field}
                label={s.label}
                active={skaterSort === s.field}
                onClick={() => pickSkaterSort(s.field)}
              />
            ))}
          </div>
          <div className="stats-chip-set stats-chip-set-end">
            {POS_FILTERS.map((p) => (
              <Chip key={p.value} label={p.label} active={pos === p.value} onClick={() => setPos(p.value)} />
            ))}
          </div>
        </div>
        {skaterRows.length === 0 ? (
          <p className="stats-empty">No skaters match these filters.</p>
        ) : (
          <div className="stats-table-scroll">
            <DataTable
              className="stats-table-skaters"
              columns={skaterColumns}
              sortKey={skaterSort}
              sortDirection={skaterDir}
              onSort={(key) => pickSkaterSort(key as SkaterSort)}
              rows={skaterRows.map((r) => [
                r.number,
                <Link key={r.playerId} to={`/roster/${r.playerId}`} className="stats-player-link">
                  {r.name}
                </Link>,
                posAbbrev(r.position),
                r.gp,
                r.goals,
                r.assists,
                r.points,
                r.ppg.toFixed(2),
                r.pims,
                r.motm > 0 ? r.motm : "—",
                r.wotg > 0 ? r.wotg : "—",
              ])}
            />
          </div>
        )}
        <p className="t-label stats-muted stats-legend">
          GP games played · G goals · A assists · PTS points · PPG points per game · PIM penalties
          in minutes · MOTM man of the match · WOTG warrior of the game
        </p>
      </section>

      <Stripe />

      <section className="stats-section stats-section-top" aria-label="Scoring progression">
        <SectionBar
          title={allTime ? "All-time progression" : "Season progression"}
          note={chartNote}
        />

        <div className="stats-controls">
          <div className="stats-control-group" role="group" aria-label="Metric">
            <span className="t-label stats-muted">Metric</span>
            {METRIC_CHIPS.map((m) => (
              <Chip key={m.value} label={m.label} active={metric === m.value} onClick={() => setMetric(m.value)} />
            ))}
          </div>
          <span className="t-label stats-muted stats-filter-note">{rangeNote}</span>
        </div>

        {chart.lines.length === 0 ? (
          <p className="stats-empty">Nothing to plot for these filters.</p>
        ) : (
          <div className="stats-chart-card">
            <div className="stats-chart-scroll">
              <div className="stats-chart-plot">
                <svg viewBox={`0 0 ${VW} ${VH}`} role="img" aria-label={chartNote}>
                  {chart.yTicks.map((t) => (
                    <line
                      key={t.v}
                      x1={PAD_L}
                      x2={VW - PAD_R}
                      y1={t.y}
                      y2={t.y}
                      style={{ stroke: "var(--border-hairline)" }}
                      strokeWidth={1}
                    />
                  ))}
                  {chart.seasonMarks.map((m) => (
                    <line
                      key={m.label}
                      x1={m.x}
                      x2={m.x}
                      y1={PAD_T}
                      y2={VH - PAD_B}
                      style={{ stroke: "var(--border-functional)" }}
                      strokeWidth={1}
                      strokeDasharray="3 4"
                    />
                  ))}
                  {chart.lines.map((l) => (
                    <g key={l.key}>
                      <path
                        d={l.d}
                        fill="none"
                        style={{ stroke: l.color }}
                        strokeWidth={2.5}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                      <circle cx={l.endX} cy={l.endY} r={4} style={{ fill: l.color }} />
                    </g>
                  ))}
                </svg>
                {chart.yTicks.map((t) => (
                  <span
                    key={t.v}
                    className="stats-chart-ytick"
                    style={{ top: t.top, right: `calc(100% - ${(((PAD_L - 6) / VW) * 100).toFixed(2)}%)` }}
                  >
                    {t.v}
                  </span>
                ))}
                {chart.xTicks.map((t) => (
                  <span key={t.key} className="stats-chart-xtick" style={{ left: t.left }}>
                    {t.label}
                  </span>
                ))}
                {chart.seasonMarks.map((m) => (
                  <span key={m.label} className="t-label stats-chart-seasonmark" style={{ left: m.left }}>
                    {m.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="stats-chart-legend">
              {chart.lines.map((l) => (
                <div className="stats-chart-legend-item" key={l.key}>
                  <span aria-hidden="true" className="stats-chart-swatch" style={{ background: l.color }} />
                  <span className="t-label">{l.name}</span>
                  <span className="t-label stats-muted">{l.meta}</span>
                  <span className="stats-chart-total">{l.total}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <p className="t-label stats-muted stats-legend">
          {axisFoot} Vertical axis is cumulative {metric === "pims" ? "penalty minutes" : metricLabel.toLowerCase()}.
        </p>
      </section>

      <section className="stats-section" aria-label="Points breakdown">
        <div className="stats-section-bar">
          <h2 className="t-heading stats-section-title">
            {allTime ? "All-time goals and assists" : "Goals and assists"}
          </h2>
          <div className="stats-key">
            <span className="t-label stats-muted stats-key-item">
              <span aria-hidden="true" className="stats-key-swatch stats-key-goals" />
              Goals
            </span>
            <span className="t-label stats-muted stats-key-item">
              <span aria-hidden="true" className="stats-key-swatch stats-key-assists" />
              Assists
            </span>
          </div>
        </div>
        {breakdown.length === 0 ? (
          <p className="stats-empty">No scoring recorded for these filters.</p>
        ) : (
          <div className="stats-breakdown">
            {breakdown.map((b) => (
              <div className="stats-breakdown-row" key={b.playerId}>
                <div className="stats-breakdown-who">
                  <span className="t-heading stats-breakdown-name">{b.name}</span>
                  <span className="t-label stats-muted">
                    #{b.number} · {posAbbrev(b.position)}
                  </span>
                </div>
                <div className="stats-breakdown-bar">
                  <span className="stats-breakdown-goals" style={{ width: b.goalWidth }} />
                  <span className="stats-breakdown-assists" style={{ width: b.assistWidth }} />
                </div>
                <div className="stats-breakdown-figures">
                  <span className="stats-muted">
                    {b.goals}·{b.assists}
                  </span>
                  <span className="stats-breakdown-points">{b.points}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="t-label stats-muted stats-legend">
          Top ten by points. Figures read goals · assists, then total points.
        </p>
      </section>

      <section className="stats-section stats-rates" aria-label="Discipline and rate">
        <div>
          <SectionBar title="Penalty minutes" note="Top six" />
          {pimData.length === 0 ? (
            <p className="stats-empty">No penalties recorded.</p>
          ) : (
            <BarChart data={pimData} height={200} />
          )}
          <p className="t-label stats-muted stats-legend">Minutes served across the selected games.</p>
        </div>
        <div>
          <SectionBar title="Points per game" note={`Top six · minimum ${ppgMinGP} GP`} />
          {ppgData.length === 0 ? (
            <p className="stats-empty">No skater has reached {ppgMinGP} games.</p>
          ) : (
            <BarChart data={ppgData} height={200} formatValue={(v) => v.toFixed(2)} />
          )}
          <p className="t-label stats-muted stats-legend">
            Scoring rate rather than volume, so part-season players are comparable.
          </p>
        </div>
      </section>

      <section className="stats-section stats-section-foot">
        <div className="stats-cta">
          <p className="stats-cta-copy">
            Corrections to a game sheet are applied within a week of the game. Report a
            discrepancy through Facebook and the secretary will check it against the sheet.
          </p>
          <div className="stats-cta-actions">
            <Button onClick={downloadCsv} disabled={skaterRows.length === 0}>
              Download as CSV
            </Button>
            <Link to="/records" className="ds-btn ds-btn-secondary ds-btn-md">
              Club records
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
