import PlayerStatsTab from '../player-stats-tab/player-stats-tab';
import PlayerChartsTab from '../player-charts-tab/player-charts-tab';
import PlayerGamesTab from '../player-games-tab/player-games-tab';

interface SeasonStats {
  season: string;
  gamesPlayed: number;
  goals: number;
  assists: number;
  points: number;
  pim: number;
  powerPlayGoals: number;
  shortHandedGoals: number;
  gameWinningGoals: number;
}

interface RecentGame {
  date: string;
  opponent: string;
  result: string;
  goals: number;
  assists: number;
  points: number;
  pointsPerGame: number;
  teamPlusMinus: number;
  penaltyMinutes: number;
}

interface PlayerTabsProps {
  activeTab: 'stats' | 'charts' | 'games';
  onTabChange: (tab: 'stats' | 'charts' | 'games') => void;
  seasonStats: SeasonStats[];
  recentGames: RecentGame[];
  playerId: string;
}

export default function PlayerTabs({ 
  activeTab, 
  onTabChange, 
  seasonStats, 
  recentGames, 
  playerId 
}: PlayerTabsProps) {
  const tabs = [
    { id: 'stats' as const, label: 'Season Stats', icon: '📊' },
    { id: 'charts' as const, label: 'Charts & Analytics', icon: '📈' },
    { id: 'games' as const, label: 'Recent Games', icon: '🏒' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 md:px-6 md:py-4
                text-sm md:text-base font-medium whitespace-nowrap
                border-b-2 transition-colors duration-200
                ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-4 md:p-6">
        {activeTab === 'stats' && (
          <PlayerStatsTab seasonStats={seasonStats} />
        )}
        
        {activeTab === 'charts' && (
          <PlayerChartsTab seasonStats={seasonStats} playerId={playerId} />
        )}
        
        {activeTab === 'games' && (
          <PlayerGamesTab recentGames={recentGames} />
        )}
      </div>
    </div>
  );
}
