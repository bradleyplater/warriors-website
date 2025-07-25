interface Player {
  id: number;
  name: string;
  number: string;
  position: string;
  games: number;
  goals: number;
  assists: number;
  points: number;
  pointsPerGame: number;
}

interface PlayerStatsRowProps {
  player: Player;
  rank: number;
  isEven: boolean;
}

export default function PlayerStatsRow({ player, rank, isEven }: PlayerStatsRowProps) {
  return (
    <div className={`
      flex min-w-[600px] md:min-w-0 md:grid md:grid-cols-8 gap-2 px-3 py-3 md:px-4 md:py-4
      transition-all duration-200 hover:bg-blue-50 hover:shadow-sm
      ${isEven ? 'bg-white' : 'bg-gray-50/50'}
    `}>
      {/* Player Info (Name & Number) - Always visible */}
      <div className="flex-shrink-0 w-32 md:col-span-2 md:w-auto flex items-center gap-1 min-w-0">
        <span className="text-xs font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full min-w-[20px] text-center flex-shrink-0">
          #{player.number}
        </span>
        <span className="text-xs md:text-sm font-semibold text-gray-900 truncate">
          {player.name}
        </span>
      </div>

      {/* Position - Hidden on mobile */}
      <div className="hidden md:flex items-center justify-center">
        <span className="text-xs md:text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full min-w-[24px] text-center">
          {player.position}
        </span>
      </div>

      {/* Games Played */}
      <div className="flex-shrink-0 w-12 md:w-auto flex items-center justify-center">
        <span className="text-xs md:text-sm font-medium text-gray-700">
          {player.games}
        </span>
      </div>

      {/* Goals */}
      <div className="flex-shrink-0 w-12 md:w-auto flex items-center justify-center">
        <span className="text-xs md:text-sm font-semibold text-green-600">
          {player.goals}
        </span>
      </div>

      {/* Assists */}
      <div className="flex-shrink-0 w-12 md:w-auto flex items-center justify-center">
        <span className="text-xs md:text-sm font-semibold text-blue-600">
          {player.assists}
        </span>
      </div>

      {/* Points */}
      <div className="flex-shrink-0 w-16 md:w-auto flex items-center justify-center">
        <span className="text-xs md:text-sm font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">
          {player.points}
        </span>
      </div>

      {/* Points Per Game */}
      <div className="flex-shrink-0 w-16 md:w-auto flex items-center justify-center">
        <span className="text-xs md:text-sm font-medium text-gray-700">
          {player.pointsPerGame.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
