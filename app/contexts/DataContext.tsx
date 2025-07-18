import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface PeriodScore {
  warriorsScore: number;
  opponentScore: number;
}

interface Period {
  one: PeriodScore;
  two: PeriodScore;
  three: PeriodScore;
}

interface Result {
  opponentTeam: string;
  logoImage: string;
  date: string;
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
}

export interface DataContextType {
  data: Data;
  loading: boolean;
  error: string | null;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>({ upcomingGames: [], results: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const upcomingGamesResponse = await fetch('/data/upcoming-games.json');
        const resultsResponse = await fetch('/data/results.json');

        if (!upcomingGamesResponse.ok || !resultsResponse.ok) {
          throw new Error(`Failed to fetch data: ${upcomingGamesResponse.status} ${upcomingGamesResponse.statusText}`);
        }
        
        const upcomingGames = await upcomingGamesResponse.json();
        const results = await resultsResponse.json();
        
        setData({ upcomingGames, results });
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