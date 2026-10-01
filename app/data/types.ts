import type { Season } from "~/types/season";

export interface PlayerStat {
  season: string;
  games: number;
  goals: number;
  assists: number;
  pims: number;
  points: number;
  manOfTheMatch?: number;
  warriorOfTheGame?: number;
}

export interface Player {
  id: string;
  name: string;
  nickname?: string;
  number: number;
  position: string;
  stats: PlayerStat[];
}

export interface Goal {
  playerId: string;
  minute: number;
  second: number;
  type: "EVEN" | "PP" | "SH";
  assists: string[];
}

/** Opponent scorers/assisters are free text and may be unrecorded (null). */
export interface OpponentGoal {
  playerId: string;
  minute: number;
  second: number;
  type: "EVEN" | "PP" | "SH";
  assists: (string | null)[];
}

export interface Penalty {
  offender: string;
  minute: number;
  second: number;
  duration: number;
  type: string;
}

export interface PeriodScore {
  warriorsScore: number;
  opponentScore: number;
  goals: Goal[];
  opponentGoals: OpponentGoal[];
  penalties: Penalty[];
  opponentPenalties: Penalty[];
}

export interface Period {
  one: PeriodScore;
  two: PeriodScore;
  three: PeriodScore;
}

/** A fixture from upcoming-games.json. */
export interface UpcomingGame {
  opponentTeam: string;
  /** The opponent logo's S3 key, or "" when it has no logo. */
  logoImage: string;
  gameType: string;
  date: string;
  time: string;
  location: string;
}

export interface Result {
  opponentTeam: string;
  /** The opponent logo's S3 key; omitted when it has no logo. */
  logoImage?: string;
  date: string;
  location: "HOME" | "AWAY";
  roster: string[];
  seasonId: Season;
  competition?: string;
  manOfTheMatchPlayerId?: string;
  warriorOfTheGamePlayerId?: string;
  netminderPlayerId?: string;
  score: {
    warriorsScore: number;
    opponentScore: number;
    period: Period;
  };
}

/** seasons.json, published by the portal. */
export interface SeasonsFile {
  /** The season the site opens on, e.g. "26/27". */
  activeSeason: string | null;
  /** Every season name, oldest first, including seasons with no games. */
  seasons: string[];
}
