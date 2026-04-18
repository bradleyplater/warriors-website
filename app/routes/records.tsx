import { useState } from "react";
import resultsData from "../../public/data/results.json";
import playersData from "../../public/data/players.json";
import type { Result, Player } from "~/contexts/DataContext";
import {
  getMostGoals, getMostAssists, getMostPoints, getQuickestGoal,
  getQuickestHattrick, getMostPenaltyMinutesInAGame,
  getMostGoalsInASeason, getMostAssistsInASeason, getMostPointsInASeason,
  getMostHattricksInASeason, getMostPowerPlayGoalsInASeason,
  getMostShortHandedGoalsInASeason, getMostGameWinningGoalsInASeason,
  getMostShutoutsInASeason, getMostPIMsInASeason, getMostMOTMInASeason,
  getMostWOTGInASeason,
  getCareerGamesPlayedLeader, getCareerGoalsLeader, getCareerAssistsLeader,
  getCareerPointsLeader, getMostPowerPlayGoalsAllTime,
  getMostShortHandedGoalsAllTime, getMostGameWinningGoalsAllTime,
  getMostShutoutsAllTime, getMostCareerPenaltyMinutes,
  getMostCareerMOTM, getMostCareerWOTG,
} from "~/helpers/team-records-helper";
import type { TeamRecord, SeasonRecord, AllTimeRecord } from "~/helpers/team-records-helper";
import "./records.css";

export function meta() {
  return [{ title: "Records — Peterborough Warriors" }];
}

// ── Static data ───────────────────────────────────────────────────────────────

const allResults = resultsData as unknown as Result[];
const allPlayers = playersData as unknown as Player[];

// ── Pre-compute all records (outside component) ───────────────────────────────

const gameRecords: TeamRecord[] = [
  getMostGoals(allResults, allPlayers),
  getMostAssists(allResults, allPlayers),
  getMostPoints(allResults, allPlayers),
  getQuickestGoal(allResults, allPlayers),
  getQuickestHattrick(allResults, allPlayers),
  getMostPenaltyMinutesInAGame(allResults, allPlayers),
];

const seasonalRecords: SeasonRecord[] = [
  getMostGoalsInASeason(allPlayers),
  getMostAssistsInASeason(allPlayers),
  getMostPointsInASeason(allPlayers),
  getMostHattricksInASeason(allResults, allPlayers),
  getMostPowerPlayGoalsInASeason(allResults, allPlayers),
  getMostShortHandedGoalsInASeason(allResults, allPlayers),
  getMostGameWinningGoalsInASeason(allResults, allPlayers),
  getMostShutoutsInASeason(allResults, allPlayers),
  getMostPIMsInASeason(allPlayers),
  getMostMOTMInASeason(allPlayers),
  getMostWOTGInASeason(allPlayers),
];

const allTimeRecords: AllTimeRecord[] = [
  getCareerGamesPlayedLeader(allPlayers),
  getCareerGoalsLeader(allPlayers),
  getCareerAssistsLeader(allPlayers),
  getCareerPointsLeader(allPlayers),
  getMostPowerPlayGoalsAllTime(allResults, allPlayers),
  getMostShortHandedGoalsAllTime(allResults, allPlayers),
  getMostGameWinningGoalsAllTime(allResults, allPlayers),
  getMostShutoutsAllTime(allResults, allPlayers),
  getMostCareerPenaltyMinutes(allPlayers),
  getMostCareerMOTM(allPlayers),
  getMostCareerWOTG(allPlayers),
];

// ── Category badge ────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  goals: "Goals",
  assists: "Assists",
  points: "Points",
  performance: "Performance",
};

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className={`rec-category rec-category-${category}`}>
      {CATEGORY_LABELS[category] ?? category}
    </span>
  );
}

// ── Record cards ──────────────────────────────────────────────────────────────

const MAX_VISIBLE_HOLDERS = 3;

function GameRecordCard({ record }: { record: TeamRecord }) {
  const visible = record.holders.slice(0, MAX_VISIBLE_HOLDERS);
  const overflow = record.holders.length - MAX_VISIBLE_HOLDERS;

  return (
    <div className={`rec-card rec-card-${record.category}`}>
      <div className="rec-card-top">
        <CategoryBadge category={record.category} />
        <p className="rec-record-value">{record.value}</p>
        <p className="rec-record-title">{record.title}</p>
        <p className="rec-record-desc">{record.description}</p>
      </div>
      <div className="rec-card-divider" />
      <div className="rec-card-holders">
        {visible.length === 0 ? (
          <p className="rec-no-data">No data recorded yet.</p>
        ) : (
          visible.map((h, i) => (
            <div key={i} className="rec-holder">
              <span className="rec-holder-name">{h.playerName}</span>
              <span className="rec-holder-meta">
                vs {h.gameInfo.opponent} · {h.gameInfo.date} · {h.gameInfo.result}
              </span>
            </div>
          ))
        )}
        {overflow > 0 && (
          <span className="rec-overflow">+{overflow} more</span>
        )}
      </div>
    </div>
  );
}

function SeasonRecordCard({ record }: { record: SeasonRecord }) {
  const visible = record.holders.slice(0, MAX_VISIBLE_HOLDERS);
  const overflow = record.holders.length - MAX_VISIBLE_HOLDERS;

  return (
    <div className={`rec-card rec-card-${record.category}`}>
      <div className="rec-card-top">
        <CategoryBadge category={record.category} />
        <p className="rec-record-value">{record.value}</p>
        <p className="rec-record-title">{record.title}</p>
        <p className="rec-record-desc">{record.description}</p>
      </div>
      <div className="rec-card-divider" />
      <div className="rec-card-holders">
        {visible.length === 0 ? (
          <p className="rec-no-data">No data recorded yet.</p>
        ) : (
          visible.map((h, i) => (
            <div key={i} className="rec-holder">
              <span className="rec-holder-name">{h.playerName}</span>
              <span className="rec-holder-meta">Season {h.season}</span>
            </div>
          ))
        )}
        {overflow > 0 && (
          <span className="rec-overflow">+{overflow} more</span>
        )}
      </div>
    </div>
  );
}

function AllTimeRecordCard({ record }: { record: AllTimeRecord }) {
  const visible = record.holders.slice(0, MAX_VISIBLE_HOLDERS);
  const overflow = record.holders.length - MAX_VISIBLE_HOLDERS;

  return (
    <div className={`rec-card rec-card-${record.category}`}>
      <div className="rec-card-top">
        <CategoryBadge category={record.category} />
        <p className="rec-record-value">{record.value}</p>
        <p className="rec-record-title">{record.title}</p>
        <p className="rec-record-desc">{record.description}</p>
      </div>
      <div className="rec-card-divider" />
      <div className="rec-card-holders">
        {visible.length === 0 ? (
          <p className="rec-no-data">No data recorded yet.</p>
        ) : (
          visible.map((h, i) => (
            <div key={i} className="rec-holder">
              <span className="rec-holder-name">{h.playerName}</span>
            </div>
          ))
        )}
        {overflow > 0 && (
          <span className="rec-overflow">+{overflow} more</span>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type Tab = "game" | "season" | "alltime";

export default function Records() {
  const [tab, setTab] = useState<Tab>("game");

  return (
    <div className="rec-page">
      <section className="rec-hero">
        <div className="rec-hero-inner">
          <span className="rec-kicker">Club History</span>
          <h1 className="rec-title">Records</h1>
          <p className="rec-subtitle">
            Peterborough Warriors Ice Hockey Club — Individual Records &amp; Achievements
          </p>
        </div>
      </section>

      <section className="rec-body">
        <div className="rec-frame">
          <div className="rec-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={tab === "game"}
              className={tab === "game" ? "rec-tab rec-tab-active" : "rec-tab"}
              onClick={() => setTab("game")}
            >
              Single Game
            </button>
            <button
              role="tab"
              aria-selected={tab === "season"}
              className={tab === "season" ? "rec-tab rec-tab-active" : "rec-tab"}
              onClick={() => setTab("season")}
            >
              Season
            </button>
            <button
              role="tab"
              aria-selected={tab === "alltime"}
              className={tab === "alltime" ? "rec-tab rec-tab-active" : "rec-tab"}
              onClick={() => setTab("alltime")}
            >
              All Time
            </button>
          </div>

          {tab === "game" && (
            <div className="rec-grid">
              {gameRecords.map((r, i) => (
                <GameRecordCard key={i} record={r} />
              ))}
            </div>
          )}

          {tab === "season" && (
            <div className="rec-grid">
              {seasonalRecords.map((r, i) => (
                <SeasonRecordCard key={i} record={r} />
              ))}
            </div>
          )}

          {tab === "alltime" && (
            <div className="rec-grid">
              {allTimeRecords.map((r, i) => (
                <AllTimeRecordCard key={i} record={r} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
