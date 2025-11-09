import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import type { Result } from '../contexts/DataContext';
import type { Route } from '../+types/root';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Results - Warriors" },
    { name: 'description', content: 'View all game results for the Warriors hockey team' },
  ];
}

interface GameCardProps {
  game: Result;
}

function GameCard({ game }: GameCardProps) {
  const gameDate = new Date(game.date);
  const isWin = game.score.warriorsScore > game.score.opponentScore;
  const isDraw = game.score.warriorsScore === game.score.opponentScore;
  const isLoss = game.score.warriorsScore < game.score.opponentScore;
  
  // For now, assume all games are away games since we don't have home/away data
  // This can be enhanced later when home/away data is available

  console.log("location: ", game.location)
  const isHomeGame = game.location === "HOME";
  
  const resultColor = isWin ? 'text-green-600' : isDraw ? 'text-yellow-600' : 'text-red-600';
  const resultBg = isWin ? 'bg-green-50' : isDraw ? 'bg-yellow-50' : 'bg-red-50';
  const resultBorder = isWin ? 'border-green-200' : isDraw ? 'border-yellow-200' : 'border-red-200';

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${resultBorder} hover:shadow-md transition-shadow duration-200`}>
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Game Info */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <img 
                src={`/images/team-logos/${game.logoImage}`}
                alt={`${game.opponentTeam} logo`}
                className="w-12 h-12 md:w-16 md:h-16 object-contain rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                  Warriors vs {game.opponentTeam}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isHomeGame ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {isHomeGame ? 'HOME' : 'AWAY'}
                </span>
              </div>
              <p className="text-sm md:text-base text-gray-600">
                {gameDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Score */}
          <div className={`flex items-center justify-center md:justify-end gap-2 md:gap-4 p-4 rounded-lg ${resultBg}`}>
            <div className="text-center w-20 md:w-24">
              <div className="text-xs md:text-sm text-gray-600 mb-1 truncate" title="Warriors">Warriors</div>
              <div className={`text-2xl md:text-3xl font-bold ${resultColor}`}>
                {game.score.warriorsScore}
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-gray-400 flex-shrink-0">-</div>
            <div className="text-center w-20 md:w-24">
              <div className="text-xs md:text-sm text-gray-600 mb-1 truncate" title={game.opponentTeam}>{game.opponentTeam}</div>
              <div className={`text-2xl md:text-3xl font-bold ${resultColor}`}>
                {game.score.opponentScore}
              </div>
            </div>
          </div>
        </div>

        {/* Result Badge */}
        <div className="mt-4 flex justify-center md:justify-start">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isWin ? 'bg-green-100 text-green-800' : 
            isDraw ? 'bg-yellow-100 text-yellow-800' : 
            'bg-red-100 text-red-800'
          }`}>
            {isWin ? 'WIN' : isDraw ? 'DRAW' : 'LOSS'}
          </span>
        </div>
      </div>
    </div>
  );
}

function SeasonDivider({ season }: { season: string }) {
  return (
    <div className="relative my-8">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t-2 border-gray-300"></div>
      </div>
      <div className="relative flex justify-center">
        <span className="bg-gray-50 px-6 py-2 text-lg md:text-xl font-bold text-gray-700 rounded-full border-2 border-gray-300">
          Season {season}
        </span>
      </div>
    </div>
  );
}

export default function Results() {
  const { data, loading, error } = useData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading games: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Sort games by date (most recent first) and group by season
  const sortedResults = [...data.results].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Group games by season
  const gamesBySeason = sortedResults.reduce((acc, game) => {
    const season = game.seasonId;
    if (!acc[season]) {
      acc[season] = [];
    }
    acc[season].push(game);
    return acc;
  }, {} as Record<string, Result[]>);

  // Sort seasons by first number in descending order (e.g., 24/25 > 23/24 > 22/23)
  const seasons = Object.keys(gamesBySeason).sort((a, b) => {
    // Extract first number from each season (e.g., '24' from '24/25')
    const firstNumberA = parseInt(a.split('/')[0], 10);
    const firstNumberB = parseInt(b.split('/')[0], 10);
    
    // Sort in descending order (highest first)
    return firstNumberB - firstNumberA;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Results
            </h1>
            <p className="text-sm md:text-base opacity-90">
              Complete history of Warriors games and results
            </p>
          </div>
        </div>
      </div>

      {/* Games Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {seasons.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No results found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {seasons.map((season, seasonIndex) => (
              <div key={season}>
                <SeasonDivider season={season} />
                <div className="space-y-4">
                  {gamesBySeason[season].map((game, gameIndex) => (
                    <GameCard key={`${season}-${gameIndex}`} game={game} />
                  ))}
                </div>
                {/* Add divider after last season */}
                {seasonIndex === seasons.length - 1 && (
                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-gray-50 px-6 py-2 text-sm font-medium text-gray-500 rounded-full border border-gray-300">
                        End of Records
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}