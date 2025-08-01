import { useState } from 'react';
import { useParams } from 'react-router';
import type { Route } from '../+types/root';
import PlayerHeader from '../components/player-header/player-header';
import PlayerTabs from '../components/player-tabs/player-tabs';

export function meta({ params }: Route.MetaArgs) {
  // In a real app, you'd fetch the player data here
  const playerId = params.playerId;
  return [
    { title: `Player ${playerId} - Warriors` },
  ];
}

// Mock player data
const mockPlayerData = {
  id: '1',
  name: 'Connor McDavid',
  number: 97,
  position: 'Center',
  seasonsWithWarriors: 3,
  age: 27,
  height: '6\'1"',
  weight: '193 lbs',
  birthplace: 'Richmond Hill, ON',
  imageUrl: null, // Will show placeholder
};

// Mock season stats
const mockSeasonStats = [
  {
    season: '24/25',
    gamesPlayed: 45,
    goals: 28,
    assists: 42,
    points: 70,
    plusMinus: 15,
    pim: 12,
    powerPlayGoals: 8,
    powerPlayAssists: 18,
    shortHandedGoals: 1,
    gameWinningGoals: 6,
  },
  {
    season: '23/24',
    gamesPlayed: 76,
    goals: 42,
    assists: 68,
    points: 110,
    plusMinus: 22,
    pim: 18,
    powerPlayGoals: 12,
    powerPlayAssists: 28,
    shortHandedGoals: 2,
    gameWinningGoals: 8,
  },
  {
    season: '22/23',
    gamesPlayed: 72,
    goals: 38,
    assists: 59,
    points: 97,
    plusMinus: 18,
    pim: 14,
    powerPlayGoals: 10,
    powerPlayAssists: 22,
    shortHandedGoals: 1,
    gameWinningGoals: 7,
  },
];

// Mock recent games
const mockRecentGames = [
  {
    date: '2025-01-30',
    opponent: 'Toronto Maple Leafs',
    result: 'W 4-2',
    goals: 1,
    assists: 2,
    points: 3,
    plusMinus: 2,
    shots: 6,
    timeOnIce: '22:15',
  },
  {
    date: '2025-01-28',
    opponent: 'Montreal Canadiens',
    result: 'W 3-1',
    goals: 0,
    assists: 1,
    points: 1,
    plusMinus: 1,
    shots: 4,
    timeOnIce: '21:45',
  },
  {
    date: '2025-01-25',
    opponent: 'Ottawa Senators',
    result: 'L 2-3',
    goals: 2,
    assists: 0,
    points: 2,
    plusMinus: -1,
    shots: 8,
    timeOnIce: '23:30',
  },
  {
    date: '2025-01-22',
    opponent: 'Calgary Flames',
    result: 'W 5-2',
    goals: 1,
    assists: 3,
    points: 4,
    plusMinus: 3,
    shots: 5,
    timeOnIce: '24:12',
  },
  {
    date: '2025-01-20',
    opponent: 'Vancouver Canucks',
    result: 'W 4-1',
    goals: 0,
    assists: 2,
    points: 2,
    plusMinus: 1,
    shots: 3,
    timeOnIce: '20:55',
  },
];

export default function PlayerDetail() {
  const { playerId } = useParams();
  const [activeTab, setActiveTab] = useState<'stats' | 'charts' | 'games'>('stats');

  // In a real app, you'd fetch player data based on playerId
  const player = mockPlayerData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Player Header */}
      <PlayerHeader player={player} />
      
      {/* Player Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <PlayerTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          seasonStats={mockSeasonStats}
          recentGames={mockRecentGames}
          playerId={playerId || '1'}
        />
      </div>
    </div>
  );
}
