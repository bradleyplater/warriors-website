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

interface PeriodScore {
  warriorsScore: number;
  opponentScore: number;
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
  season: Season;
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

interface Data {
  upcomingGames: UpcomingGame[];
  results: Result[];
  players: Player[];
  team: Team;
}

export interface DataContextType {
  data: Data;
  loading: boolean;
  error: string | null;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>({ upcomingGames: [], results: [], players: [], team: { stats: []} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const upcomingGamesResponse = await fetch('/data/upcoming-games.json');
        const resultsResponse = await fetch('/data/results.json');
        const playerResponse = await fetch('/data/players.json')
        const teamResponse = await fetch('/data/team.json')

        if (!upcomingGamesResponse.ok || !resultsResponse.ok || !playerResponse.ok || !teamResponse.ok) {
          throw new Error(`Failed to fetch data: ${upcomingGamesResponse.status} ${upcomingGamesResponse.statusText}`);
        }
        
        const upcomingGames = await upcomingGamesResponse.json();
        const results = await resultsResponse.json();
        const players = await playerResponse.json();
        const team = await teamResponse.json();
        
        setData({ upcomingGames, results, players, team });
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