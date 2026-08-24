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
  opponentGoals: Goal[];
  penalties: Penalty[];
  opponentPenalties: Penalty[];
}

export interface Period {
  one: PeriodScore;
  two: PeriodScore;
  three: PeriodScore;
}

export interface Result {
  opponentTeam: string;
  logoImage: string;
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
