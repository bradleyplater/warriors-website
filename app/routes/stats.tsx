import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { LineChart } from "@wonderflow/charts";
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

/** Cumulative goals per player, one data point per season. X axis is numeric (0 = origin). */
function buildSeasonCumulative(minGP: number): CumulativeChartResult {
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
      cum[p.id] = (cum[p.id] ?? 0) + s.goals;
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

/** Cumulative goals per player, one data point per club game. X axis is numeric (0 = origin). */
function buildGameCumulative(minGP: number): CumulativeChartResult {
  // First pass: count skater GP per player
  const gpCount: Record<string, number> = {};
  for (const result of chronologicalResults) {
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
  const dataRows = chronologicalResults.map((result, i) => {
    const row: Record<string, number> = { game: i + 1 };
    const net = result.netminderPlayerId;
    const periods = [result.score.period.one, result.score.period.two, result.score.period.three];

    for (const p of eligible) {
      const isSkater =
        result.roster.includes(p.id) &&
        !(net && net !== "MISSING" && p.id === net);
      if (isSkater) {
        const goals = periods.reduce(
          (s, pd) => s + pd.goals.filter((g) => g.playerId === p.id).length,
          0
        );
        cum[p.id] = (cum[p.id] ?? 0) + goals;
      }
      row[p.name] = cum[p.id] ?? 0;
    }
    return row;
  });

  return {
    data: [zeroRow, ...dataRows],
    players: eligible.map((p) => p.name),
    xMax: chronologicalResults.length,
    xTickLabel: (v) => (v === 0 ? "" : String(v)),
  };
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

  useEffect(() => {
    const getTheme = (): "light" | "dark" =>
      document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
    setChartTheme(getTheme());
    const observer = new MutationObserver(() => setChartTheme(getTheme()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const { data: lineData, players: linePlayers, xMax, xTickLabel } = useMemo(
    () => chartAxisMode === "season" ? buildSeasonCumulative(chartMinGP) : buildGameCumulative(chartMinGP),
    [chartAxisMode, chartMinGP]
  );

  // ── End-of-line labels ─────────────────────────────────────────────────────
  const wrapRef = useRef<HTMLDivElement>(null);
  type EndLabel = { name: string; xPx: number; yPx: number; color: string };
  const [endLabels, setEndLabels] = useState<EndLabel[]>([]);

  useEffect(() => {
    if (tab !== "charts" || linePlayers.length === 0) {
      setEndLabels([]);
      return;
    }

    // Give the chart time to finish painting
    const tid = setTimeout(() => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const svg = wrap.querySelector<SVGSVGElement>("svg");
      if (!svg) return;

      // Data line paths: no fill, contain cubic bezier 'C' commands
      const dataPaths = Array.from(svg.querySelectorAll<SVGPathElement>("path")).filter((p) => {
        const d = p.getAttribute("d") ?? "";
        const fill = (p.getAttribute("fill") ?? p.style.fill).trim().toLowerCase();
        return d.includes("C") && (fill === "none" || fill === "");
      });

      if (dataPaths.length === 0) return;

      const wrapRect = wrap.getBoundingClientRect();

      // Convert an SVG-user-unit point to wrapper-relative px
      function toWrapperPx(path: SVGPathElement, svgPt: DOMPoint): { x: number; y: number } {
        const ctm = path.getScreenCTM();
        if (!ctm) return { x: svgPt.x, y: svgPt.y };
        const screen = svgPt.matrixTransform(ctm);
        return { x: screen.x - wrapRect.left, y: screen.y - wrapRect.top };
      }

      // Get rightmost point of each data path
      const pathInfo = dataPaths.map((path) => {
        const len = path.getTotalLength();
        const ep = path.getPointAtLength(len);
        const pt = svg.createSVGPoint();
        pt.x = ep.x;
        pt.y = ep.y;
        const { x: xPx, y: yPx } = toWrapperPx(path, pt);
        const color = path.getAttribute("stroke") ?? "#888";
        return { xPx, yPx, color };
      });

      // Sort paths: ascending y (lower y = higher on screen = more goals)
      pathInfo.sort((a, b) => a.yPx - b.yPx);

      // Sort players: descending cumulative goals
      const lastRow = lineData[lineData.length - 1] ?? {};
      const playersByGoals = linePlayers
        .map((name) => ({ name, goals: (lastRow[name] as number) ?? 0 }))
        .sort((a, b) => b.goals - a.goals);

      // Pair top path → top scorer
      const count = Math.min(pathInfo.length, playersByGoals.length);
      const raw: EndLabel[] = Array.from({ length: count }, (_, i) => ({
        name: playersByGoals[i].name,
        xPx: pathInfo[i].xPx,
        yPx: pathInfo[i].yPx,
        color: pathInfo[i].color,
      }));

      // Collision avoidance: sort by y, push down if labels overlap
      const MIN_GAP = 14;
      raw.sort((a, b) => a.yPx - b.yPx);
      for (let i = 1; i < raw.length; i++) {
        if (raw[i].yPx - raw[i - 1].yPx < MIN_GAP) {
          raw[i].yPx = raw[i - 1].yPx + MIN_GAP;
        }
      }

      setEndLabels(raw);
    }, 350);

    return () => clearTimeout(tid);
  }, [tab, linePlayers, lineData, chartAxisMode, chartMinGP, chartTheme]);

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

              {linePlayers.length === 0 ? (
                <p className="stats-empty">No players match the selected filters.</p>
              ) : (
                <div className="stats-chart-card stats-chart-card-full">
                  <div ref={wrapRef} style={{ position: "relative" }}>
                    <LineChart
                      key={chartAxisMode}
                      title="Cumulative Goals"
                      subtitle={
                        chartAxisMode === "season"
                          ? "Running total per player at the end of each season"
                          : "Running total per player after each club game"
                      }
                      theme={chartTheme}
                      renderAs="curves"
                      data={lineData}
                      index={{
                        dataKey: chartAxisMode === "season" ? "season" : "game",
                        scaleType: "linear",
                        domain: [0, xMax],
                        label: chartAxisMode === "season" ? "Season" : "Game",
                        tickFormat: (v: any) => xTickLabel(Number(v)),
                        numTicks: chartAxisMode === "season" ? xMax + 1 : undefined,
                      }}
                      series={{
                        dataKey: linePlayers,
                        label: "Goals",
                      }}
                      showMarker={chartAxisMode === "season"}
                      hidePadding
                      height={520}
                      margin={{ top: 24, right: 130, bottom: 64, left: 72 }}
                    />
                    {endLabels.map((lbl) => (
                      <span
                        key={lbl.name}
                        className="stats-chart-end-label"
                        style={{ left: lbl.xPx + 8, top: lbl.yPx, color: lbl.color }}
                      >
                        {lbl.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
