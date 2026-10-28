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
  type: "EVEN" | "PP" | "SH" | "SO";
  assists: string[];
}

/** Opponent scorers/assisters are free text and may be unrecorded (null). */
export interface OpponentGoal {
  playerId: string;
  minute: number;
  second: number;
  type: "EVEN" | "PP" | "SH" | "SO";
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

/** Shootout goals sit outside the periods. The scores are each side's SO goal
 *  count; the winner gets just +1 in the game's final score. */
export interface ShootoutScore {
  warriorsScore: number;
  opponentScore: number;
  goals: Goal[];
  opponentGoals: OpponentGoal[];
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
    /** Present only when the game went to a shootout. */
    shootout?: ShootoutScore;
  };  /** Up to six game photos in display order; omitted when there are none. */
  photos?: ResultPhoto[];
}

/** A game photo the portal published: an S3 key plus its text. `alt` is
 *  always set (the portal generates one when the admin left it blank). */
export interface ResultPhoto {
  key: string;
  alt: string;
  caption?: string;
}

/** seasons.json, published by the portal. */
export interface SeasonsFile {
  /** The season the site opens on, e.g. "26/27". */
  activeSeason: string | null;
  /** Every season name, oldest first, including seasons with no games. */
  seasons: string[];
}
