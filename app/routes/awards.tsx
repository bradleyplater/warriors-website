import { useState } from "react";
import awardsData from "../../public/data/awards.json";
import "./awards.css";

type Award = {
  tier: 1 | 2 | 3 | 4 | 5;
  category: string;
  winner: string;
  playerId: string | null;
};

type AwardsEvening = {
  id: string;
  title: string;
  season: string;
  images: string[];
  awards: Award[];
};

const evenings = awardsData as AwardsEvening[];

const playerImageModules = import.meta.glob("/public/images/players/*.jpg", { eager: true });
const PLAYER_IMAGE_IDS = new Set(
  Object.keys(playerImageModules).map((path) => path.split("/").pop()!.replace(".jpg", ""))
);

const TIERS = [
  { id: 1 as const, label: "Elite" },
  { id: 2 as const, label: "Honours" },
  { id: 3 as const, label: "Performance" },
  { id: 4 as const, label: "Improved" },
  { id: 5 as const, label: "Club Awards" },
];

export function meta() {
  return [{ title: "Awards — Peterborough Warriors" }];
}

function TrophyIcon({ featured }: { featured?: boolean }) {
  return (
    <svg
      className={featured ? "aw-trophy-icon aw-trophy-icon-featured" : "aw-trophy-icon"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9H4a2 2 0 0 1-2-2V5h4" />
      <path d="M18 9h2a2 2 0 0 0 2-2V5h-4" />
      <path d="M6 5h12v6a6 6 0 0 1-12 0V5z" />
      <line x1="12" y1="17" x2="12" y2="21" />
      <line x1="8" y1="21" x2="16" y2="21" />
    </svg>
  );
}

function PlayerAvatar({ playerId, featured }: { playerId: string | null; featured?: boolean }) {
  const cls = featured ? "aw-avatar aw-avatar-featured" : "aw-avatar";

  if (!playerId || !PLAYER_IMAGE_IDS.has(playerId)) {
    return (
      <div className={`${cls} aw-avatar-fallback`} aria-hidden="true">
        <svg viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="38" r="24" fill="currentColor" />
          <path d="M10 120 C10 82 90 82 90 120Z" fill="currentColor" />
        </svg>
      </div>
    );
  }

  return (
    <img
      className={cls}
      src={`/images/players/${playerId}.jpg`}
      alt=""
      aria-hidden="true"
      loading="lazy"
    />
  );
}

function AwardCard({ award }: { award: Award }) {
  const featured = award.tier === 1;
  return (
    <div className={featured ? "aw-card aw-card-featured" : "aw-card"}>
      <PlayerAvatar playerId={award.playerId} featured={featured} />
      <TrophyIcon featured={featured} />
      <p className="aw-card-category">{award.category}</p>
      <p className="aw-card-winner">{award.winner}</p>
    </div>
  );
}

export default function Awards() {
  const [activeId, setActiveId] = useState(evenings[0]?.id ?? "");

  const active = evenings.find((e) => e.id === activeId) ?? evenings[0];

  const byTier = TIERS.reduce<Record<number, Award[]>>((acc, t) => {
    acc[t.id] = active?.awards.filter((a) => a.tier === t.id) ?? [];
    return acc;
  }, {});

  return (
    <div className="aw-page">
      <section className="aw-hero">
        <div className="aw-hero-inner">
          <span className="aw-kicker">Club History</span>
          <h1 className="aw-title">Awards</h1>
          <p className="aw-subtitle">
            Peterborough Warriors Ice Hockey Club — Annual Awards Evenings
          </p>
        </div>
      </section>

      <section className="aw-body">
        <div className="aw-frame">
          <div className="aw-tabs" role="tablist">
            {evenings.map((evening) => (
              <button
                key={evening.id}
                role="tab"
                aria-selected={activeId === evening.id}
                className={activeId === evening.id ? "aw-tab aw-tab-active" : "aw-tab"}
                onClick={() => setActiveId(evening.id)}
              >
                {evening.season}
              </button>
            ))}
          </div>

          {active && (
            <div className="aw-evening">
              <h2 className="aw-evening-title">{active.title}</h2>

              {active.awards.length === 0 ? (
                <p className="aw-empty">Awards for this season haven't been announced yet.</p>
              ) : (
                <div className="aw-pyramid">
                  {TIERS.map((tier) => {
                    const awards = byTier[tier.id];
                    if (!awards || awards.length === 0) return null;
                    return (
                      <div key={tier.id} className={`aw-tier aw-tier-${tier.id}`}>
                        <div className="aw-tier-label">
                          <span className={`aw-tier-badge aw-tier-badge-${tier.id}`}>
                            {tier.label}
                          </span>
                        </div>
                        <div className={`aw-grid aw-grid-${tier.id}`}>
                          {awards.map((award, i) => (
                            <AwardCard key={i} award={award} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
