import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Season } from '~/components/season-filter/season-filter';

export interface TeamStat {
  season: Season;
  games: number;
  goalsFor: number;
  goalsAgainst: number;
  wins: number;
  losses: number;
  draws: number;
}

interface Team {
  stats: TeamStat[];
}

interface PlayerStat {
  season: string;
  games: number;
  goals: number;
  assists: number;
  pims: number;
  points: number;
}

export interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
  stats: PlayerStat[];
}

interface Goal {
    playerId: string;
    minute: number;
    second: number;
    type: 'EVEN' | 'PP' | 'SH';
    assists: string[];
}

interface Penalty {
  offender: string;
  minute: number;
  second: number;
  duration: number;
  type: string;
}

interface PeriodScore {
  warriorsScore: number;
  opponentScore: number;
  goals: Goal[];
  opponentGoals: Goal[];
  penalties: Penalty[];
  opponentPenalties: Penalty[];
}

interface Period {
  one: PeriodScore;
  two: PeriodScore;
  three: PeriodScore;
}

export interface Result {
  opponentTeam: string;
  logoImage: string;
  date: string;
  roster: string[];
  seasonId: Season;
  score: {
    warriorsScore: number;
    opponentScore: number;
    period: Period;
  };
}

interface UpcomingGame {
  opponentTeam: string;
  logoImage: string;
  gameType: string;
  date: string;
  time: string;
  location: string;
}

interface TournamentData {
  season: string;
  year: string;
  winner: string;
  runnerUp: string;
  finalScore: string;
  groupStage: Record<string, {
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    points: number;
  }>;
  semiFinals: Array<{
    team1: string;
    team2: string;
    score: string;
    date: string;
  }>;
  final: {
    team1: string;
    team2: string;
    score: string;
    date: string;
  };
}

interface Data {
  upcomingGames: UpcomingGame[];
  results: Result[];
  players: Player[];
  team: Team;
  botbTournaments: TournamentData[];
  llihcTournaments: TournamentData[];
}

export interface DataContextType {
  data: Data;
  loading: boolean;
  error: string | null;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>({ 
    upcomingGames: [], 
    results: [], 
    players: [], 
    team: { stats: []},
    botbTournaments: [],
    llihcTournaments: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [upcomingGamesResponse, resultsResponse, playerResponse, teamResponse, botbResponse, llihcResponse] = await Promise.all([
          fetch('/data/upcoming-games.json'),
          fetch('/data/results.json'),
          fetch('/data/players.json'),
          fetch('/data/team.json'),
          fetch('/data/botb-tournaments.json'),
          fetch('/data/llihc-tournaments.json')
        ]);

        if (!upcomingGamesResponse.ok || !resultsResponse.ok || !playerResponse.ok || !teamResponse.ok || !botbResponse.ok || !llihcResponse.ok) {
          throw new Error(`Failed to fetch data: ${upcomingGamesResponse.status} ${upcomingGamesResponse.statusText}`);
        }
        
        const [upcomingGames, results, players, team, botbTournaments, llihcTournaments] = await Promise.all([
          upcomingGamesResponse.json(),
          resultsResponse.json(),
          playerResponse.json(),
          teamResponse.json(),
          botbResponse.json(),
          llihcResponse.json()
        ]);
        
        setData({ upcomingGames, results, players, team, botbTournaments, llihcTournaments });
      } catch (error) {
        console.error('Error loading JSON:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <DataContext.Provider value={{ data, loading, error }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}