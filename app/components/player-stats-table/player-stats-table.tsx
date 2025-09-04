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

            console.log("position: ", playerPosition);

            if (selectedPosition === 'forward') {
                return playerPosition.includes('forward')
            }
            if (selectedPosition === 'defence') {
                return playerPosition.includes('defence')
            }
            if (selectedPosition === 'goaltender') {
                return playerPosition.includes('goaltender')
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
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 overflow-hidden">
      {/* Mobile: Horizontal scroll */}
      <div className="md:hidden overflow-x-auto">
        {/* Header */}
        <div className="flex gap-2 px-4 py-4 min-w-[500px] bg-gradient-to-r from-slate-50 to-blue-50 border-b border-blue-100">
          <div className="flex-shrink-0 w-32 flex items-center">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Player</span>
          </div>
          <div className="flex-shrink-0 w-12 flex items-center justify-center">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">GP</span>
          </div>
          <div className="flex-shrink-0 w-12 flex items-center justify-center">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">G</span>
          </div>
          <div className="flex-shrink-0 w-12 flex items-center justify-center">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">A</span>
          </div>
          <div className="flex-shrink-0 w-16 flex items-center justify-center">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">PTS</span>
          </div>
          <div className="flex-shrink-0 w-16 flex items-center justify-center">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">PPG</span>
          </div>
        </div>
        {/* Player Rows */}
        <div className="divide-y divide-blue-100/50">
          {mappedPlayers.map((player, index) => (
            <div
              key={player.name}
              className={`
                flex gap-2 px-4 py-4 min-w-[500px] transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-sm
                ${index % 2 === 0 ? 'bg-white/80' : 'bg-slate-50/60'}
              `}
            >
              <div className="flex-shrink-0 w-32 flex items-center gap-2 min-w-0">
                <span className="text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 px-2 py-1 rounded-full min-w-[24px] text-center flex-shrink-0 shadow-sm">
                  #{player.number}
                </span>
                <span className="text-xs font-semibold text-slate-800 truncate">
                  {player.name}
                </span>
              </div>
              <div className="flex-shrink-0 w-12 flex items-center justify-center">
                <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">{player.games}</span>
              </div>
              <div className="flex-shrink-0 w-12 flex items-center justify-center">
                <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-lg">{player.goals}</span>
              </div>
              <div className="flex-shrink-0 w-12 flex items-center justify-center">
                <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-lg">{player.assists}</span>
              </div>
              <div className="flex-shrink-0 w-16 flex items-center justify-center">
                <span className="text-xs font-bold text-purple-700 bg-gradient-to-r from-purple-100 to-pink-100 px-2 py-1 rounded-lg shadow-sm">{player.points}</span>
              </div>
              <div className="flex-shrink-0 w-16 flex items-center justify-center">
                <span className="text-xs font-medium text-slate-700">{player.pointsPerGame.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: Regular grid layout */}
      <div className="hidden md:block">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-slate-50 border-b-2 border-blue-200">
          <div className="grid grid-cols-8 gap-3 px-6 py-5">
            <div className="col-span-2 flex items-center">
              <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">Player</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">POS</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">GP</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">G</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">A</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">PTS</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">PPG</span>
            </div>
          </div>
        </div>
        {/* Player Rows */}
        <div className="divide-y divide-blue-100/50">
          {mappedPlayers.map((player, index) => (
            <div
              key={player.name}
              className={`
                grid grid-cols-8 gap-3 px-6 py-5 transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:shadow-lg hover:scale-[1.01]
                ${index % 2 === 0 ? 'bg-white/80' : 'bg-slate-50/60'}
              `}
            >
              <div className="col-span-2 flex items-center gap-3 min-w-0">
                <span className="text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-2 rounded-xl min-w-[40px] text-center shadow-md">
                  #{player.number}
                </span>
                <span className="text-sm font-semibold text-slate-800 truncate">
                  {player.name}
                </span>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-sm font-medium text-slate-600 bg-gradient-to-r from-slate-100 to-gray-100 px-3 py-2 rounded-xl min-w-[48px] text-center shadow-sm">
                  {player.position}
                </span>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-sm font-semibold text-slate-700 bg-slate-100 px-3 py-2 rounded-xl shadow-sm">{player.games}</span>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-sm font-bold text-green-700 bg-gradient-to-r from-green-100 to-emerald-100 px-3 py-2 rounded-xl shadow-sm">{player.goals}</span>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-sm font-bold text-blue-700 bg-gradient-to-r from-blue-100 to-cyan-100 px-3 py-2 rounded-xl shadow-sm">{player.assists}</span>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-sm font-bold text-purple-700 bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-2 rounded-xl shadow-md">{player.points}</span>
              </div>
              <div className="flex items-center justify-center">
                <span className="text-sm font-semibold text-slate-700 bg-slate-100 px-3 py-2 rounded-xl shadow-sm">{player.pointsPerGame.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
