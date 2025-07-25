import type { Season } from '../season-filter/season-filter';
import PlayerStatsRow from '../player-stats-row/player-stats-row';

interface PlayerStatsTableProps {
  selectedSeason: Season;
}

// Mock data - replace with real data later
const mockPlayers = [
  {
    id: 1,
    name: 'Connor McDavid',
    number: '97',
    position: 'Forward',
    games: 82,
    goals: 64,
    assists: 89,
    points: 153,
    pointsPerGame: 1.87
  },
  {
    id: 2,
    name: 'Leon Draisaitl',
    number: '29',
    position: 'Defence',
    games: 80,
    goals: 52,
    assists: 76,
    points: 128,
    pointsPerGame: 1.60
  },
  {
    id: 3,
    name: 'David Pastrnak',
    number: '88',
    position: 'RW',
    games: 82,
    goals: 61,
    assists: 52,
    points: 113,
    pointsPerGame: 1.38
  },
  {
    id: 4,
    name: 'Erik Karlsson',
    number: '65',
    position: 'D',
    games: 82,
    goals: 25,
    assists: 76,
    points: 101,
    pointsPerGame: 1.23
  },
  {
    id: 5,
    name: 'Mikko Rantanen',
    number: '96',
    position: 'RW',
    games: 80,
    goals: 55,
    assists: 50,
    points: 105,
    pointsPerGame: 1.31
  },
  {
    id: 6,
    name: 'Nathan MacKinnon',
    number: '29',
    position: 'C',
    games: 71,
    goals: 42,
    assists: 69,
    points: 111,
    pointsPerGame: 1.56
  },
  {
    id: 7,
    name: 'Artemi Panarin',
    number: '10',
    position: 'LW',
    games: 79,
    goals: 49,
    assists: 71,
    points: 120,
    pointsPerGame: 1.52
  },
  {
    id: 8,
    name: 'Johnny Gaudreau',
    number: '13',
    position: 'LW',
    games: 81,
    goals: 40,
    assists: 75,
    points: 115,
    pointsPerGame: 1.42
  },
  {
    id: 1,
    name: 'Connor McDavid',
    number: '97',
    position: 'Forward',
    games: 82,
    goals: 64,
    assists: 89,
    points: 153,
    pointsPerGame: 1.87
  },
  {
    id: 2,
    name: 'Leon Draisaitl',
    number: '29',
    position: 'Defence',
    games: 80,
    goals: 52,
    assists: 76,
    points: 128,
    pointsPerGame: 1.60
  },
  {
    id: 3,
    name: 'David Pastrnak',
    number: '88',
    position: 'RW',
    games: 82,
    goals: 61,
    assists: 52,
    points: 113,
    pointsPerGame: 1.38
  },
  {
    id: 4,
    name: 'Erik Karlsson',
    number: '65',
    position: 'D',
    games: 82,
    goals: 25,
    assists: 76,
    points: 101,
    pointsPerGame: 1.23
  },
  {
    id: 5,
    name: 'Mikko Rantanen',
    number: '96',
    position: 'RW',
    games: 80,
    goals: 55,
    assists: 50,
    points: 105,
    pointsPerGame: 1.31
  },
  {
    id: 6,
    name: 'Nathan MacKinnon',
    number: '29',
    position: 'C',
    games: 71,
    goals: 42,
    assists: 69,
    points: 111,
    pointsPerGame: 1.56
  },
  {
    id: 7,
    name: 'Artemi Panarin',
    number: '10',
    position: 'LW',
    games: 79,
    goals: 49,
    assists: 71,
    points: 120,
    pointsPerGame: 1.52
  },
  {
    id: 8,
    name: 'Johnny Gaudreau',
    number: '13',
    position: 'LW',
    games: 81,
    goals: 40,
    assists: 75,
    points: 115,
    pointsPerGame: 1.42
  },
  {
    id: 1,
    name: 'Connor McDavid',
    number: '97',
    position: 'Forward',
    games: 82,
    goals: 64,
    assists: 89,
    points: 153,
    pointsPerGame: 1.87
  },
  {
    id: 2,
    name: 'Leon Draisaitl',
    number: '29',
    position: 'Defence',
    games: 80,
    goals: 52,
    assists: 76,
    points: 128,
    pointsPerGame: 1.60
  },
  {
    id: 3,
    name: 'David Pastrnak',
    number: '88',
    position: 'RW',
    games: 82,
    goals: 61,
    assists: 52,
    points: 113,
    pointsPerGame: 1.38
  },
  {
    id: 4,
    name: 'Erik Karlsson',
    number: '65',
    position: 'D',
    games: 82,
    goals: 25,
    assists: 76,
    points: 101,
    pointsPerGame: 1.23
  },
  {
    id: 5,
    name: 'Mikko Rantanen',
    number: '96',
    position: 'RW',
    games: 80,
    goals: 55,
    assists: 50,
    points: 105,
    pointsPerGame: 1.31
  },
  {
    id: 6,
    name: 'Nathan MacKinnon',
    number: '29',
    position: 'C',
    games: 71,
    goals: 42,
    assists: 69,
    points: 111,
    pointsPerGame: 1.56
  },
  {
    id: 7,
    name: 'Artemi Panarin',
    number: '10',
    position: 'LW',
    games: 79,
    goals: 49,
    assists: 71,
    points: 120,
    pointsPerGame: 1.52
  },
  {
    id: 8,
    name: 'Johnny Gaudreau',
    number: '13',
    position: 'LW',
    games: 81,
    goals: 40,
    assists: 75,
    points: 115,
    pointsPerGame: 1.42
  }
];

export default function PlayerStatsTable({ selectedSeason }: PlayerStatsTableProps) {
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
          {mockPlayers.map((player, index) => (
            <div
              key={player.id}
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
          {mockPlayers.map((player, index) => (
            <div
              key={player.id}
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
