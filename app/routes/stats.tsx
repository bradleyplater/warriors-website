import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { LinePath } from "@visx/shape";
import { scaleLinear } from "@visx/scale";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { GridRows } from "@visx/grid";
import { Group } from "@visx/group";
import { curveMonotoneX } from "@visx/curve";
import playersData from "../../public/data/players.json";
import resultsData from "../../public/data/results.json";
import "./stats.css";

export function meta() {
  return [{ title: "Stats — Peterborough Warriors" }];
}

// ── Types ─────────────────────────────────────────────────────────────────────

type GoalEntry = { playerId: string; assists: string[] };
type PenaltyEntry = { offender: string; duration: number };
type PeriodData = { goals: GoalEntry[]; penalties: PenaltyEntry[] };

type RawResult = {
  season: string;
  date: string;
  competition: string;
  roster: string[];
  netminderPlayerId: string;
  manOfTheMatchPlayerId: string;
  warriorOfTheGamePlayerId: string;
  score: {
    opponentScore: number;
    period: { one: PeriodData; two: PeriodData; three: PeriodData };
  };
};

type PlayerInfo = { id: string; name: string; number: number; position: string };

type StatEntry = { gp: number; goals: number; assists: number; pims: number; motm: number; wotg: number };
type GoalieEntry = { gp: number; ga: number };

type PlayerStatRow = {
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

type GoalieStatRow = {
  playerId: string;
  name: string;
  number: number;
  gp: number;
  ga: number;
  gaa: number;
};

type PlayerSortField = "name" | "number" | "gp" | "goals" | "assists" | "points" | "ppg" | "pims" | "motm" | "wotg";
type GoalieSortField = "name" | "number" | "gp" | "ga" | "gaa";
type SortDir = "asc" | "desc";
type StatType = "goals" | "assists" | "points" | "pims";

// ── Static data ───────────────────────────────────────────────────────────────

const allResults = resultsData as unknown as RawResult[];
const playerInfoMap = new Map<string, PlayerInfo>(
  (playersData as PlayerInfo[]).map((p) => [p.id, p])
);

// ── Build stats maps from results ─────────────────────────────────────────────
// playerStats[playerId][season][competition] = StatEntry (skater, excludes netminder games)
// goalieStats[playerId][season][competition] = GoalieEntry

const playerStats: Record<string, Record<string, Record<string, StatEntry>>> = {};
const goalieStats: Record<string, Record<string, Record<string, GoalieEntry>>> = {};
const allSeasons = new Set<string>();
const allCompetitions = new Set<string>();

for (const result of allResults) {
  const season = result.season || "Unknown";
  const competition = result.competition || "Unknown";
  const netminder = result.netminderPlayerId;

  allSeasons.add(season);
  allCompetitions.add(competition);

  // Goalie stats
  if (netminder && netminder !== "MISSING") {
    if (!goalieStats[netminder]) goalieStats[netminder] = {};
    if (!goalieStats[netminder][season]) goalieStats[netminder][season] = {};
    if (!goalieStats[netminder][season][competition]) {
      goalieStats[netminder][season][competition] = { gp: 0, ga: 0 };
    }
    goalieStats[netminder][season][competition].gp++;
    goalieStats[netminder][season][competition].ga += result.score.opponentScore;
  }

  // Skater stats — exclude the netminder from this game's skater tally
  if (!Array.isArray(result.roster)) continue;

  const periods = [result.score.period.one, result.score.period.two, result.score.period.three];

  for (const playerId of result.roster) {
    if (netminder && netminder !== "MISSING" && playerId === netminder) continue;

    const goals = periods.reduce((s, p) => s + p.goals.filter((g) => g.playerId === playerId).length, 0);
    const assists = periods.reduce((s, p) => s + p.goals.filter((g) => g.assists.includes(playerId)).length, 0);
    const pims = periods
      .flatMap((p) => p.penalties)
      .filter((pen) => pen.offender === playerId)
      .reduce((s, pen) => s + pen.duration, 0);
    const motm = result.manOfTheMatchPlayerId === playerId ? 1 : 0;
    const wotg = result.warriorOfTheGamePlayerId === playerId ? 1 : 0;

    if (!playerStats[playerId]) playerStats[playerId] = {};
    if (!playerStats[playerId][season]) playerStats[playerId][season] = {};
    if (!playerStats[playerId][season][competition]) {
      playerStats[playerId][season][competition] = { gp: 0, goals: 0, assists: 0, pims: 0, motm: 0, wotg: 0 };
    }
    const e = playerStats[playerId][season][competition];
    e.gp++;
    e.goals += goals;
    e.assists += assists;
    e.pims += pims;
    e.motm += motm;
    e.wotg += wotg;
  }
}

const sortedSeasons = Array.from(allSeasons).sort(
  (a, b) => parseInt(b.split("/")[0], 10) - parseInt(a.split("/")[0], 10)
);
const sortedCompetitions = Array.from(allCompetitions).sort();

// ── Chart constants ───────────────────────────────────────────────────────────

const PALETTE = [
  "#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6",
  "#f97316", "#06b6d4", "#ec4899", "#84cc16", "#6366f1",
  "#14b8a6", "#f43f5e", "#a78bfa", "#34d399", "#fb923c",
];
const CHART_MARGIN = { top: 20, right: 155, bottom: 48, left: 52 };
const CHART_TOTAL_H = 480;

const STAT_OPTIONS: { value: StatType; label: string; axisLabel: string }[] = [
  { value: "goals",   label: "Goals",   axisLabel: "Goals" },
  { value: "assists", label: "Assists", axisLabel: "Assists" },
  { value: "points",  label: "Points",  axisLabel: "Points" },
  { value: "pims",    label: "PIMs",    axisLabel: "Penalty Mins" },
];

// ── Aggregation helpers ───────────────────────────────────────────────────────

function aggregatePlayer(playerId: string, season: string, comp: string): StatEntry {
  const out: StatEntry = { gp: 0, goals: 0, assists: 0, pims: 0, motm: 0, wotg: 0 };
  const bySeasons = playerStats[playerId];
  if (!bySeasons) return out;
  for (const [s, byComp] of Object.entries(bySeasons)) {
    if (season !== "All" && s !== season) continue;
    for (const [c, e] of Object.entries(byComp)) {
      if (comp !== "All" && c !== comp) continue;
      out.gp += e.gp;
      out.goals += e.goals;
      out.assists += e.assists;
      out.pims += e.pims;
      out.motm += e.motm;
      out.wotg += e.wotg;
    }
  }
  return out;
}

function aggregateGoalie(playerId: string, season: string, comp: string): GoalieEntry {
  const out: GoalieEntry = { gp: 0, ga: 0 };
  const bySeasons = goalieStats[playerId];
  if (!bySeasons) return out;
  for (const [s, byComp] of Object.entries(bySeasons)) {
    if (season !== "All" && s !== season) continue;
    for (const [c, e] of Object.entries(byComp)) {
      if (comp !== "All" && c !== comp) continue;
      out.gp += e.gp;
      out.ga += e.ga;
    }
  }
  return out;
}

// ── Chart helpers ─────────────────────────────────────────────────────────────

// Results sorted oldest → newest for the "by game" cumulative walk
const chronologicalResults = (allResults as (RawResult & { date: string })[])
  .filter((r) => Array.isArray(r.roster) && r.roster.length > 0)
  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

type CumulativeChartResult = {
  data: Record<string, number>[];
  players: string[];
  xMax: number;
  xTickLabel: (v: number) => string;
};

/** Cumulative stat per player, one data point per season. X axis is numeric (0 = origin). */
function buildSeasonCumulative(minGP: number, stat: StatType = "goals"): CumulativeChartResult {
  const seasons = sortedSeasons.slice().reverse(); // chronological: oldest first

  const eligible = Object.keys(playerStats)
    .map((id) => {
      const info = playerInfoMap.get(id);
      if (!info) return null;
      const totalGP = Object.values(playerStats[id])
        .flatMap(Object.values)
        .reduce((s, e) => s + e.gp, 0);
      return totalGP >= minGP ? { id, name: info.name } : null;
    })
    .filter((p): p is { id: string; name: string } => p !== null);

  // x=0 is the origin; seasons are x=1,2,3,...
  const zeroRow: Record<string, number> = { season: 0 };
  for (const p of eligible) zeroRow[p.name] = 0;

  const cum: Record<string, number> = {};
  const dataRows = seasons.map((season, i) => {
    const row: Record<string, number> = { season: i + 1 };
    for (const p of eligible) {
      const s = aggregatePlayer(p.id, season, "All");
      const value =
        stat === "goals"   ? s.goals :
        stat === "assists"  ? s.assists :
        stat === "points"   ? s.goals + s.assists :
        /* pims */            s.pims;
      cum[p.id] = (cum[p.id] ?? 0) + value;
      row[p.name] = cum[p.id];
    }
    return row;
  });

  // Build tick label map: 1 → "22/23", 2 → "23/24", etc.
  const labelMap: Record<number, string> = {};
  seasons.forEach((s, i) => { labelMap[i + 1] = s; });

  return {
    data: [zeroRow, ...dataRows],
    players: eligible.map((p) => p.name),
    xMax: seasons.length,
    xTickLabel: (v) => labelMap[v] ?? "",
  };
}

/** Cumulative stat per player, one data point per club game. X axis is numeric (0 = origin). */
function buildGameCumulative(minGP: number, season: string = "All", stat: StatType = "goals"): CumulativeChartResult {
  const filteredResults = season === "All"
    ? chronologicalResults
    : chronologicalResults.filter((r) => r.season === season);

  // Count skater GP within the filtered games to determine eligibility
  const gpCount: Record<string, number> = {};
  for (const result of filteredResults) {
    const net = result.netminderPlayerId;
    for (const id of result.roster) {
      if (net && net !== "MISSING" && id === net) continue;
      gpCount[id] = (gpCount[id] ?? 0) + 1;
    }
  }

  const eligible = Object.keys(gpCount)
    .filter((id) => gpCount[id] >= minGP && playerInfoMap.has(id))
    .map((id) => ({ id, name: playerInfoMap.get(id)!.name }));

  // x=0 is the origin; games are x=1,2,...,N
  const zeroRow: Record<string, number> = { game: 0 };
  for (const p of eligible) zeroRow[p.name] = 0;

  const cum: Record<string, number> = {};
  const dataRows = filteredResults.map((result, i) => {
    const row: Record<string, number> = { game: i + 1 };
    const net = result.netminderPlayerId;
    const periods = [result.score.period.one, result.score.period.two, result.score.period.three];

    for (const p of eligible) {
      const isSkater =
        result.roster.includes(p.id) &&
        !(net && net !== "MISSING" && p.id === net);
      if (isSkater) {
        let value = 0;
        if (stat === "goals" || stat === "points") {
          value += periods.reduce(
            (s, pd) => s + pd.goals.filter((g) => g.playerId === p.id).length, 0
          );
        }
        if (stat === "assists" || stat === "points") {
          value += periods.reduce(
            (s, pd) => s + pd.goals.filter((g) => g.assists.includes(p.id)).length, 0
          );
        }
        if (stat === "pims") {
          value = periods
            .flatMap((pd) => pd.penalties)
            .filter((pen) => pen.offender === p.id)
            .reduce((s, pen) => s + pen.duration, 0);
        }
        cum[p.id] = (cum[p.id] ?? 0) + value;
      }
      row[p.name] = cum[p.id] ?? 0;
    }
    return row;
  });

  return {
    data: [zeroRow, ...dataRows],
    players: eligible.map((p) => p.name),
    xMax: filteredResults.length,
    xTickLabel: (v) => (v === 0 ? "" : String(v)),
  };
}

// ── Reusable cumulative chart ─────────────────────────────────────────────────

type CumulativeChartProps = {
  lineData: Record<string, number>[];
  linePlayers: string[];
  xMax: number;
  xTickLabel: (v: number) => string;
  xKey: string;
  title: string;
  subtitle: string;
  axisLabel: string;
  chartAxisMode: "season" | "game";
  chartWidth: number;
  chartTheme: "light" | "dark";
  hoveredPlayer: string | null;
  setHoveredPlayer: (p: string | null) => void;
};

function CumulativeChart({
  lineData, linePlayers, xMax, xTickLabel, xKey,
  title, subtitle, axisLabel, chartAxisMode,
  chartWidth, chartTheme,
  hoveredPlayer, setHoveredPlayer,
}: CumulativeChartProps) {
  const innerW = Math.max(10, chartWidth - CHART_MARGIN.left - CHART_MARGIN.right);
  const innerH = CHART_TOTAL_H - CHART_MARGIN.top - CHART_MARGIN.bottom;

  const xScale = scaleLinear({ domain: [0, xMax], range: [0, innerW] });
  const yPeak = Math.max(1, ...lineData.flatMap((row) => linePlayers.map((p) => (row[p] as number) ?? 0)));
  const yScale = scaleLinear({ domain: [0, yPeak], range: [innerH, 0], nice: true });

  const lastDataRow = lineData[lineData.length - 1] ?? {};
  const endLabels = linePlayers
    .map((name, i) => ({ name, color: PALETTE[i % PALETTE.length], y: yScale((lastDataRow[name] as number) ?? 0) }))
    .sort((a, b) => a.y - b.y);
  const MIN_LABEL_GAP = 13;
  for (let i = 1; i < endLabels.length; i++) {
    if (endLabels[i].y - endLabels[i - 1].y < MIN_LABEL_GAP) {
      endLabels[i].y = endLabels[i - 1].y + MIN_LABEL_GAP;
    }
  }

  const playerColorMap: Record<string, string> = {};
  linePlayers.forEach((name, i) => { playerColorMap[name] = PALETTE[i % PALETTE.length]; });

  const renderOrder = hoveredPlayer
    ? [...linePlayers.filter((p) => p !== hoveredPlayer), hoveredPlayer]
    : linePlayers;

  const isDark = chartTheme === "dark";
  const axisStroke = isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.2)";
  const tickFill   = isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.5)";
  const gridStroke = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";

  return (
    <div className="stats-chart-card stats-chart-card-full">
      <div className="stats-chart-header">
        <p className="stats-chart-title">{title}</p>
        <p className="stats-chart-subtitle">{subtitle}</p>
      </div>
      <div className="stats-chart-scroll">
        <div style={{ width: "100%", minWidth: "600px" }}>
          <svg width={chartWidth} height={CHART_TOTAL_H} style={{ display: "block", overflow: "visible" }}>
            <Group left={CHART_MARGIN.left} top={CHART_MARGIN.top}>
              <GridRows scale={yScale} width={innerW} stroke={gridStroke} strokeWidth={1} />

              {renderOrder.map((player) => {
                const color = playerColorMap[player];
                const isHovered = hoveredPlayer === player;
                const isDimmed = hoveredPlayer !== null && !isHovered;
                return (
                  <g key={player}>
                    <LinePath<Record<string, number>>
                      data={lineData as Record<string, number>[]}
                      x={(d) => xScale(d[xKey] ?? 0)}
                      y={(d) => yScale(d[player] ?? 0)}
                      stroke={color}
                      strokeWidth={isHovered ? 3 : 2}
                      strokeOpacity={isDimmed ? 0.12 : 1}
                      curve={curveMonotoneX}
                      style={{ transition: "stroke-opacity 0.15s, stroke-width 0.15s", pointerEvents: "none" }}
                    />
                    <LinePath<Record<string, number>>
                      data={lineData as Record<string, number>[]}
                      x={(d) => xScale(d[xKey] ?? 0)}
                      y={(d) => yScale(d[player] ?? 0)}
                      stroke="transparent"
                      strokeWidth={16}
                      fill="none"
                      curve={curveMonotoneX}
                      style={{ cursor: "pointer" }}
                      onMouseEnter={() => setHoveredPlayer(player)}
                      onMouseLeave={() => setHoveredPlayer(null)}
                    />
                  </g>
                );
              })}

              {endLabels.map((lbl) => {
                const isHovered = hoveredPlayer === lbl.name;
                const isDimmed = hoveredPlayer !== null && !isHovered;
                return (
                  <text
                    key={lbl.name}
                    x={innerW + 6}
                    y={lbl.y}
                    fill={lbl.color}
                    fontSize={isHovered ? 12 : 11}
                    fontWeight={isHovered ? 700 : 600}
                    dominantBaseline="middle"
                    opacity={isDimmed ? 0.2 : 1}
                    style={{ fontFamily: "inherit", transition: "opacity 0.15s" }}
                  >
                    {lbl.name}
                  </text>
                );
              })}

              <AxisBottom
                scale={xScale}
                top={innerH}
                stroke={axisStroke}
                tickStroke={axisStroke}
                numTicks={chartAxisMode === "season" ? xMax + 1 : undefined}
                tickFormat={(v) => xTickLabel(Number(v))}
                label={chartAxisMode === "season" ? "Season" : "Game #"}
                tickLabelProps={() => ({ fill: tickFill, fontSize: 11, textAnchor: "middle", fontFamily: "inherit" })}
                labelProps={{ fill: tickFill, fontSize: 12, textAnchor: "middle", fontFamily: "inherit" }}
              />
              <AxisLeft
                scale={yScale}
                stroke={axisStroke}
                tickStroke={axisStroke}
                label={axisLabel}
                tickLabelProps={() => ({ fill: tickFill, fontSize: 11, textAnchor: "end", dy: "0.33em", fontFamily: "inherit" })}
                labelProps={{ fill: tickFill, fontSize: 12, textAnchor: "middle", fontFamily: "inherit" }}
              />
            </Group>
          </svg>
        </div>
      </div>
    </div>
  );
}

// ── Sort icon helper ──────────────────────────────────────────────────────────

function SortIcon({ field, active, dir }: { field: string; active: string; dir: SortDir }) {
  if (field !== active) return <span className="stats-sort-icon">⇅</span>;
  return <span className="stats-sort-icon stats-sort-icon-on">{dir === "asc" ? "↑" : "↓"}</span>;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Stats() {
  const [tab, setTab] = useState<"players" | "goalies" | "charts">("players");

  const [chartTheme, setChartTheme] = useState<"light" | "dark">("dark");
  const [chartAxisMode, setChartAxisMode] = useState<"season" | "game">("season");
  const [chartMinGP, setChartMinGP] = useState(5);
  const [chartSeason, setChartSeason] = useState("All");
  const [hoveredPlayer, setHoveredPlayer] = useState<string | null>(null);

  useEffect(() => {
    const getTheme = (): "light" | "dark" =>
      document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
    setChartTheme(getTheme());
    const observer = new MutationObserver(() => setChartTheme(getTheme()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const allChartData = useMemo(
    () => STAT_OPTIONS.map(({ value: stat }) =>
      chartAxisMode === "season"
        ? buildSeasonCumulative(chartMinGP, stat)
        : buildGameCumulative(chartMinGP, chartSeason, stat)
    ),
    [chartAxisMode, chartMinGP, chartSeason]
  );
  // All stat datasets share the same eligible players (GP-filtered, stat-independent)
  const linePlayers = allChartData[0]?.players ?? [];

  // ── Responsive chart width ─────────────────────────────────────────────────
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(900);

  useEffect(() => {
    if (tab !== "charts") return;
    const el = chartContainerRef.current;
    if (!el) return;
    setChartWidth(Math.floor(el.getBoundingClientRect().width) || 900);
    const ro = new ResizeObserver(([entry]) =>
      setChartWidth(Math.floor(entry.contentRect.width))
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, [tab]);

  const [pSeason, setPSeason] = useState("All");
  const [pComp, setPComp] = useState("All");
  const [pPos, setPPos] = useState("All");
  const [pSort, setPSort] = useState<PlayerSortField>("points");
  const [pDir, setPDir] = useState<SortDir>("desc");

  const [gSeason, setGSeason] = useState("All");
  const [gComp, setGComp] = useState("All");
  const [gSort, setGSort] = useState<GoalieSortField>("gaa");
  const [gDir, setGDir] = useState<SortDir>("asc");

  const playerRows = useMemo<PlayerStatRow[]>(() => {
    const rows: PlayerStatRow[] = [];
    for (const playerId of Object.keys(playerStats)) {
      const info = playerInfoMap.get(playerId);
      if (!info) continue;
      if (pPos !== "All" && info.position !== pPos) continue;

      const s = aggregatePlayer(playerId, pSeason, pComp);
      if (s.gp === 0) continue;

      rows.push({
        playerId,
        name: info.name,
        number: info.number,
        position: info.position,
        gp: s.gp,
        goals: s.goals,
        assists: s.assists,
        points: s.goals + s.assists,
        ppg: (s.goals + s.assists) / s.gp,
        pims: s.pims,
        motm: s.motm,
        wotg: s.wotg,
      });
    }

    rows.sort((a, b) => {
      if (pSort === "name") return pDir === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      const av = a[pSort as Exclude<PlayerSortField, "name">] as number;
      const bv = b[pSort as Exclude<PlayerSortField, "name">] as number;
      return pDir === "asc" ? av - bv : bv - av;
    });

    return rows;
  }, [pSeason, pComp, pPos, pSort, pDir]);

  const goalieRows = useMemo<GoalieStatRow[]>(() => {
    const rows: GoalieStatRow[] = [];
    for (const playerId of Object.keys(goalieStats)) {
      const info = playerInfoMap.get(playerId);
      if (!info) continue;

      const s = aggregateGoalie(playerId, gSeason, gComp);
      if (s.gp === 0) continue;

      rows.push({
        playerId,
        name: info.name,
        number: info.number,
        gp: s.gp,
        ga: s.ga,
        gaa: s.ga / s.gp,
      });
    }

    rows.sort((a, b) => {
      if (gSort === "name") return gDir === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      const av = a[gSort as Exclude<GoalieSortField, "name">] as number;
      const bv = b[gSort as Exclude<GoalieSortField, "name">] as number;
      return gDir === "asc" ? av - bv : bv - av;
    });

    return rows;
  }, [gSeason, gComp, gSort, gDir]);

  function handlePlayerSort(field: PlayerSortField) {
    if (field === pSort) {
      setPDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setPSort(field);
      setPDir(field === "name" ? "asc" : "desc");
    }
  }

  function handleGoalieSort(field: GoalieSortField) {
    if (field === gSort) {
      setGDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setGSort(field);
      setGDir(field === "name" || field === "number" ? "asc" : field === "gaa" ? "asc" : "desc");
    }
  }

  const xKey = chartAxisMode === "season" ? "season" : "game";

  return (
    <div className="stats-page">
      <section className="stats-hero">
        <div className="stats-hero-inner">
          <span className="stats-kicker">Season Statistics</span>
          <h1 className="stats-title">Player Stats</h1>
          <p className="stats-subtitle">Warriors Ice Hockey Club — Career &amp; Season Statistics</p>
        </div>
      </section>

      <section className="stats-body">
        <div className="stats-frame">
          <div className="stats-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={tab === "players"}
              className={tab === "players" ? "stats-tab stats-tab-active" : "stats-tab"}
              onClick={() => setTab("players")}
            >
              Player Stats
            </button>
            <button
              role="tab"
              aria-selected={tab === "goalies"}
              className={tab === "goalies" ? "stats-tab stats-tab-active" : "stats-tab"}
              onClick={() => setTab("goalies")}
            >
              Goalie Stats
            </button>
            <button
              role="tab"
              aria-selected={tab === "charts"}
              className={tab === "charts" ? "stats-tab stats-tab-active" : "stats-tab"}
              onClick={() => setTab("charts")}
            >
              Charts
            </button>
          </div>

          {tab === "players" && (
            <div>
              <div className="stats-filters">
                <div className="stats-filter-group">
                  <label className="stats-filter-label" htmlFor="p-season">Season</label>
                  <select id="p-season" className="stats-select" value={pSeason} onChange={(e) => setPSeason(e.target.value)}>
                    <option value="All">All Seasons</option>
                    {sortedSeasons.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="stats-filter-group">
                  <label className="stats-filter-label" htmlFor="p-comp">Competition</label>
                  <select id="p-comp" className="stats-select" value={pComp} onChange={(e) => setPComp(e.target.value)}>
                    <option value="All">All Competitions</option>
                    {sortedCompetitions.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="stats-filter-group">
                  <label className="stats-filter-label" htmlFor="p-pos">Position</label>
                  <select id="p-pos" className="stats-select" value={pPos} onChange={(e) => setPPos(e.target.value)}>
                    <option value="All">All Positions</option>
                    <option value="Forward">Forward</option>
                    <option value="Defence">Defence</option>
                    <option value="Goaltender">Goaltender</option>
                  </select>
                </div>
              </div>

              <div className="stats-table-wrap">
                <table className="stats-table">
                  <thead>
                    <tr>
                      <th className="stats-th stats-th-rank">#</th>
                      <th className="stats-th stats-th-name">
                        <button className="stats-sort-btn" onClick={() => handlePlayerSort("name")}>
                          Player <SortIcon field="name" active={pSort} dir={pDir} />
                        </button>
                      </th>
                      <th className="stats-th">
                        <button className="stats-sort-btn" onClick={() => handlePlayerSort("gp")} title="Games Played">
                          GP <SortIcon field="gp" active={pSort} dir={pDir} />
                        </button>
                      </th>
                      <th className="stats-th">
                        <button className="stats-sort-btn" onClick={() => handlePlayerSort("goals")} title="Goals">
                          G <SortIcon field="goals" active={pSort} dir={pDir} />
                        </button>
                      </th>
                      <th className="stats-th">
                        <button className="stats-sort-btn" onClick={() => handlePlayerSort("assists")} title="Assists">
                          A <SortIcon field="assists" active={pSort} dir={pDir} />
                        </button>
                      </th>
                      <th className="stats-th">
                        <button className="stats-sort-btn" onClick={() => handlePlayerSort("points")} title="Points">
                          PTS <SortIcon field="points" active={pSort} dir={pDir} />
                        </button>
                      </th>
                      <th className="stats-th">
                        <button className="stats-sort-btn" onClick={() => handlePlayerSort("ppg")} title="Points Per Game">
                          PPG <SortIcon field="ppg" active={pSort} dir={pDir} />
                        </button>
                      </th>
                      <th className="stats-th">
                        <button className="stats-sort-btn" onClick={() => handlePlayerSort("pims")} title="Penalty Minutes">
                          PIM <SortIcon field="pims" active={pSort} dir={pDir} />
                        </button>
                      </th>
                      <th className="stats-th">
                        <button className="stats-sort-btn" onClick={() => handlePlayerSort("motm")} title="Man of the Match">
                          MOTM <SortIcon field="motm" active={pSort} dir={pDir} />
                        </button>
                      </th>
                      <th className="stats-th">
                        <button className="stats-sort-btn" onClick={() => handlePlayerSort("wotg")} title="Warrior of the Game">
                          WOTG <SortIcon field="wotg" active={pSort} dir={pDir} />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {playerRows.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="stats-empty">No data for selected filters.</td>
                      </tr>
                    ) : (
                      playerRows.map((row, i) => (
                        <tr key={row.playerId} className={i % 2 === 1 ? "stats-row stats-row-alt" : "stats-row"}>
                          <td className="stats-td stats-td-rank">{i + 1}</td>
                          <td className="stats-td stats-td-name">
                            <Link to={`/roster/${row.playerId}`} className="stats-player-link">
                              <span className="stats-player-num">#{row.number}</span>
                              <span className="stats-player-name">{row.name}</span>
                            </Link>
                          </td>
                          <td className="stats-td">{row.gp}</td>
                          <td className="stats-td">{row.goals}</td>
                          <td className="stats-td">{row.assists}</td>
                          <td className="stats-td stats-td-hi">{row.points}</td>
                          <td className="stats-td">{row.ppg.toFixed(2)}</td>
                          <td className="stats-td">{row.pims}</td>
                          <td className="stats-td">{row.motm > 0 ? row.motm : "—"}</td>
                          <td className="stats-td">{row.wotg > 0 ? row.wotg : "—"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "goalies" && (
            <div>
              <div className="stats-filters">
                <div className="stats-filter-group">
                  <label className="stats-filter-label" htmlFor="g-season">Season</label>
                  <select id="g-season" className="stats-select" value={gSeason} onChange={(e) => setGSeason(e.target.value)}>
                    <option value="All">All Seasons</option>
                    {sortedSeasons.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="stats-filter-group">
                  <label className="stats-filter-label" htmlFor="g-comp">Competition</label>
                  <select id="g-comp" className="stats-select" value={gComp} onChange={(e) => setGComp(e.target.value)}>
                    <option value="All">All Competitions</option>
                    {sortedCompetitions.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="stats-table-wrap">
                <table className="stats-table">
                  <thead>
                    <tr>
                      <th className="stats-th stats-th-rank">#</th>
                      <th className="stats-th stats-th-name">
                        <button className="stats-sort-btn" onClick={() => handleGoalieSort("name")}>
                          Player <SortIcon field="name" active={gSort} dir={gDir} />
                        </button>
                      </th>
                      <th className="stats-th">
                        <button className="stats-sort-btn" onClick={() => handleGoalieSort("gp")} title="Games Played">
                          GP <SortIcon field="gp" active={gSort} dir={gDir} />
                        </button>
                      </th>
                      <th className="stats-th">
                        <button className="stats-sort-btn" onClick={() => handleGoalieSort("ga")} title="Goals Against">
                          GA <SortIcon field="ga" active={gSort} dir={gDir} />
                        </button>
                      </th>
                      <th className="stats-th">
                        <button className="stats-sort-btn" onClick={() => handleGoalieSort("gaa")} title="Goals Against Average">
                          GAA <SortIcon field="gaa" active={gSort} dir={gDir} />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {goalieRows.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="stats-empty">No goalie data for selected filters.</td>
                      </tr>
                    ) : (
                      goalieRows.map((row, i) => (
                        <tr key={row.playerId} className={i % 2 === 1 ? "stats-row stats-row-alt" : "stats-row"}>
                          <td className="stats-td stats-td-rank">{i + 1}</td>
                          <td className="stats-td stats-td-name">
                            <Link to={`/roster/${row.playerId}`} className="stats-player-link">
                              <span className="stats-player-num">#{row.number}</span>
                              <span className="stats-player-name">{row.name}</span>
                            </Link>
                          </td>
                          <td className="stats-td">{row.gp}</td>
                          <td className="stats-td">{row.ga}</td>
                          <td className="stats-td stats-td-hi">{row.gaa.toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {tab === "charts" && (
            <div className="stats-charts">
              <div className="stats-filters">
                <div className="stats-filter-group">
                  <label className="stats-filter-label">X Axis</label>
                  <div className="stats-toggle">
                    <button
                      className={chartAxisMode === "season" ? "stats-toggle-btn stats-toggle-btn-active" : "stats-toggle-btn"}
                      onClick={() => setChartAxisMode("season")}
                    >
                      By Season
                    </button>
                    <button
                      className={chartAxisMode === "game" ? "stats-toggle-btn stats-toggle-btn-active" : "stats-toggle-btn"}
                      onClick={() => setChartAxisMode("game")}
                    >
                      By Game
                    </button>
                  </div>
                </div>
                {chartAxisMode === "game" && (
                  <div className="stats-filter-group">
                    <label className="stats-filter-label" htmlFor="chart-season">Season</label>
                    <select id="chart-season" className="stats-select" value={chartSeason} onChange={(e) => setChartSeason(e.target.value)}>
                      <option value="All">All Seasons</option>
                      {sortedSeasons.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}
                <div className="stats-filter-group">
                  <label className="stats-filter-label" htmlFor="chart-mingp">Min. Games Played</label>
                  <select id="chart-mingp" className="stats-select" value={chartMinGP} onChange={(e) => setChartMinGP(Number(e.target.value))}>
                    <option value={1}>1+</option>
                    <option value={5}>5+</option>
                    <option value={10}>10+</option>
                    <option value={20}>20+</option>
                    <option value={30}>30+</option>
                  </select>
                </div>
                <span className="stats-chart-count">{linePlayers.length} players</span>
              </div>

              {/* Invisible width gauge — ResizeObserver reads this */}
              <div ref={chartContainerRef} style={{ width: "100%", height: 0, overflow: "hidden" }} />

              {linePlayers.length === 0 ? (
                <p className="stats-empty">No players match the selected filters.</p>
              ) : (
                <>
                  {STAT_OPTIONS.map(({ value: stat, label, axisLabel }, i) => (
                    <CumulativeChart
                      key={stat}
                      lineData={allChartData[i].data}
                      linePlayers={allChartData[i].players}
                      xMax={allChartData[i].xMax}
                      xTickLabel={allChartData[i].xTickLabel}
                      xKey={xKey}
                      title={`Cumulative ${label}`}
                      subtitle={
                        chartAxisMode === "season"
                          ? "Running total per player at the end of each season"
                          : "Running total per player after each club game"
                      }
                      axisLabel={axisLabel}
                      chartAxisMode={chartAxisMode}
                      chartWidth={chartWidth}
                      chartTheme={chartTheme}
                      hoveredPlayer={hoveredPlayer}
                      setHoveredPlayer={setHoveredPlayer}
                    />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
