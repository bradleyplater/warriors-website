import type { Season } from '../season-filter/season-filter';
import type { Position, SortBy } from '../../routes/player-stats';
import PlayerStatsRow from '../player-stats-row/player-stats-row';
import { useData, type Player } from '../../contexts/DataContext';

interface PlayerStatsTableProps {
  selectedSeason: Season;
  selectedPosition: Position;
  sortBy: SortBy;
}

function getPlayerStats(players: Player[], selectedSeason: Season, selectedPosition: Position, sortBy: SortBy) {
    const playerWithStatsInSeason = players.filter(player => 
        player.stats.find(stat => stat.season === selectedSeason || selectedSeason === 'overall')
    );

    return playerWithStatsInSeason
        .map(player => {
            const statsToTrack = player.stats.filter(stat => 
                stat.season === selectedSeason || selectedSeason === 'overall'
            );
    
            if (!statsToTrack.length) {
                return null;
            }

            const games = statsToTrack.reduce((total, stat) => total + stat.games, 0);
            const goals = statsToTrack.reduce((total, stat) => total + stat.goals, 0);
            const assists = statsToTrack.reduce((total, stat) => total + stat.assists, 0);
            const points = statsToTrack.reduce((total, stat) => total + stat.points, 0);
            const pointsPerGame = games > 0 ? points / games : 0;
    
            return {
                number: player.number.toString(),
                name: player.name,
                position: player.position,
                games,
                goals,
                assists,
                points,
                pointsPerGame
            };
        })
        .filter(player => player !== null)
        // Filter by position
        .filter(player => {
            if (selectedPosition === 'all') return true;
            
            const playerPosition = player.position.toLowerCase();
            if (selectedPosition === 'forward') {
                return playerPosition.includes('forward')
            }
            if (selectedPosition === 'defense') {
                return playerPosition.includes('defense')
            }
            if (selectedPosition === 'goalie') {
                return playerPosition.includes('goalie')
            }
            return false;
        })
        // Sort by selected criteria
        .sort((a, b) => {
            switch (sortBy) {
                case 'points':
                    return b.points - a.points;
                case 'goals':
                    return b.goals - a.goals;
                case 'assists':
                    return b.assists - a.assists;
                case 'games':
                    return b.games - a.games;
                case 'pointsPerGame':
                    return b.pointsPerGame - a.pointsPerGame;
                default:
                    return b.points - a.points;
            }
        });
}


export default function PlayerStatsTable({ selectedSeason, selectedPosition, sortBy }: PlayerStatsTableProps) {
    const { data } = useData();    

    const players = data.players;

    const mappedPlayers = getPlayerStats(players, selectedSeason, selectedPosition, sortBy);


  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Mobile: Horizontal scroll */}
      <div className="md:hidden overflow-x-auto">
        {/* Header */}
        <div className="flex gap-2 px-3 py-3 min-w-[500px] bg-gray-50 border-b-2 border-gray-200">
          <div className="flex-shrink-0 w-32 flex items-center">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Player</span>
          </div>
          <div className="flex-shrink-0 w-12 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">GP</span>
          </div>
          <div className="flex-shrink-0 w-12 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">G</span>
          </div>
          <div className="flex-shrink-0 w-12 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">A</span>
          </div>
          <div className="flex-shrink-0 w-16 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">PTS</span>
          </div>
          <div className="flex-shrink-0 w-16 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">PPG</span>
          </div>
        </div>
        {/* Player Rows */}
        <div className="divide-y divide-gray-100">
          {mappedPlayers.map((player, index) => (
            <div
              key={player.name}
              className={`
                flex gap-2 px-3 py-3 min-w-[500px] transition-all duration-200 hover:bg-blue-50
                ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
              `}
            >
              <div className="flex-shrink-0 w-32 flex items-center gap-1 min-w-0">
                <span className="text-xs font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full min-w-[20px] text-center flex-shrink-0">
                  #{player.number}
                </span>
                <span className="text-xs font-semibold text-gray-900 truncate">
                  {player.name}
                </span>
              </div>
              <div className="flex-shrink-0 w-12 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-700">{player.games}</span>
              </div>
              <div className="flex-shrink-0 w-12 flex items-center justify-center">
                <span className="text-xs font-semibold text-green-600">{player.goals}</span>
              </div>
              <div className="flex-shrink-0 w-12 flex items-center justify-center">
                <span className="text-xs font-semibold text-blue-600">{player.assists}</span>
              </div>
              <div className="flex-shrink-0 w-16 flex items-center justify-center">
                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">{player.points}</span>
              </div>
              <div className="flex-shrink-0 w-16 flex items-center justify-center">
                <span className="text-xs font-medium text-gray-700">{player.pointsPerGame.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: Regular grid layout */}
      <div className="hidden md:block">
        {/* Header */}
        <div className="bg-gray-50 border-b-2 border-gray-200">
          <div className="grid grid-cols-8 gap-2 px-4 py-4">
            <div className="col-span-2 flex items-center">
              <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Player</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">POS</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">GP</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">G</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">A</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">PTS</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">PPG</span>
            </div>
          </div>
        </div>
        {/* Player Rows */}
        <div className="divide-y divide-gray-100">
          {mappedPlayers.map((player, index) => (
            <div
              key={player.name}
              className={`
                grid grid-cols-8 gap-2 px-4 py-4 transition-all duration-200 hover:bg-blue-50 hover:shadow-sm
                ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
              `}
            >
              <div className="col-span-2 flex items-center gap-2 min-w-0">
                <span className="text-sm font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full min-w-[32px] text-center">
                  #{player.number}
                </span>
                <span className="text-sm font-semibold text-gray-900 truncate">
                  {player.name}
                </span>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full min-w-[24px] text-center">
                  {player.position}
                </span>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">{player.games}</span>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-sm font-semibold text-green-600">{player.goals}</span>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-sm font-semibold text-blue-600">{player.assists}</span>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-sm font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">{player.points}</span>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">{player.pointsPerGame.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
