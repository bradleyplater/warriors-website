import { useData, type Result } from "~/contexts/DataContext";
import { getGoalsForOneGame, getAssistsForOneGame, getPimsForOneGame } from "~/helpers/game-helpers";
import { Link } from "react-router";

interface PlayerRecordsTabProps {
  playerId: string;
}

interface GameStats {
  date: string;
  opponent: string;
  goals: number;
  assists: number;
  points: number;
  pims: number;
  isWin: boolean;
  isLoss: boolean;
}

function getPlayerGames(results: Result[], playerId: string): GameStats[] {
  return results
    .filter((game) => game.roster.includes(playerId))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Sort by date ascending for streaks
    .map((game) => {
      const goals = getGoalsForOneGame(game, playerId);
      const assists = getAssistsForOneGame(game, playerId);
      return {
        date: game.date,
        opponent: game.opponentTeam,
        goals,
        assists,
        points: goals + assists,
        pims: getPimsForOneGame(game, playerId),
        isWin: game.score.warriorsScore > game.score.opponentScore,
        isLoss: game.score.warriorsScore < game.score.opponentScore,
      };
    });
}

function calculateMax(games: GameStats[], key: keyof Pick<GameStats, 'goals' | 'assists' | 'points' | 'pims'>) {
  if (games.length === 0) return { value: 0, gameDate: null };
  
  // Find the game with the max value
  const maxGame = games.reduce((prev, current) => {
    return (prev[key] > current[key]) ? prev : current;
  });

  return { value: maxGame[key], gameDate: maxGame.date };
}

function calculateStreak(games: GameStats[], predicate: (game: GameStats) => boolean) {
  let maxStreak = 0;
  let currentStreak = 0;

  for (const game of games) {
    if (predicate(game)) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return maxStreak;
}

export default function PlayerRecordsTab({ playerId }: PlayerRecordsTabProps) {
  const { data } = useData();
  const playerGames = getPlayerGames(data.results, playerId);

  const records = {
    mostGoals: calculateMax(playerGames, 'goals'),
    mostAssists: calculateMax(playerGames, 'assists'),
    mostPoints: calculateMax(playerGames, 'points'),
    mostPims: calculateMax(playerGames, 'pims'),
    goalStreak: calculateStreak(playerGames, g => g.goals > 0),
    assistStreak: calculateStreak(playerGames, g => g.assists > 0),
    pointStreak: calculateStreak(playerGames, g => g.points > 0),
    pimStreak: calculateStreak(playerGames, g => g.pims > 0),
    winStreak: calculateStreak(playerGames, g => g.isWin),
    lossStreak: calculateStreak(playerGames, g => g.isLoss),
  };

  return (
    <div className="space-y-8">
      {/* Single Game Records */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Single Game Records</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <RecordCard 
            title="Most Goals" 
            value={records.mostGoals.value} 
            gameDate={records.mostGoals.gameDate}
            icon="🥅"
            colorClass="bg-green-50 text-green-700 border-green-200"
          />
          <RecordCard 
            title="Most Assists" 
            value={records.mostAssists.value} 
            gameDate={records.mostAssists.gameDate}
            icon="🏒"
            colorClass="bg-blue-50 text-blue-700 border-blue-200"
          />
          <RecordCard 
            title="Most Points" 
            value={records.mostPoints.value} 
            gameDate={records.mostPoints.gameDate}
            icon="📊"
            colorClass="bg-purple-50 text-purple-700 border-purple-200"
          />
          <RecordCard 
            title="Most PIMs" 
            value={records.mostPims.value} 
            gameDate={records.mostPims.gameDate}
            icon="⏱️"
            colorClass="bg-orange-50 text-orange-700 border-orange-200"
          />
        </div>
      </div>

      {/* Streaks */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Longest Streaks</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <RecordCard 
            title="Goal Streak" 
            value={records.goalStreak} 
            suffix="Games"
            colorClass="bg-green-50 text-green-700 border-green-200"
          />
          <RecordCard 
            title="Assist Streak" 
            value={records.assistStreak} 
            suffix="Games"
            colorClass="bg-blue-50 text-blue-700 border-blue-200"
          />
          <RecordCard 
            title="Point Streak" 
            value={records.pointStreak} 
            suffix="Games"
            colorClass="bg-purple-50 text-purple-700 border-purple-200"
          />
          <RecordCard 
            title="PIM Streak" 
            value={records.pimStreak} 
            suffix="Games"
            colorClass="bg-orange-50 text-orange-700 border-orange-200"
          />
          <RecordCard 
            title="Winning Streak" 
            value={records.winStreak} 
            suffix="Games"
            colorClass="bg-indigo-50 text-indigo-700 border-indigo-200"
          />
          <RecordCard 
            title="Losing Streak" 
            value={records.lossStreak} 
            suffix="Games"
            colorClass="bg-red-50 text-red-700 border-red-200"
          />
        </div>
      </div>
    </div>
  );
}

function RecordCard({ 
  title, 
  value, 
  icon, 
  suffix, 
  colorClass,
  gameDate
}: { 
  title: string; 
  value: number; 
  icon?: string; 
  suffix?: string;
  colorClass: string;
  gameDate?: string | null;
}) {
  const content = (
    <>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium opacity-80">{title}</span>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold">{value}</span>
        {suffix && <span className="text-sm opacity-80">{suffix}</span>}
      </div>
    </>
  );

  if (gameDate) {
    return (
      <Link 
        to={`/game/${encodeURIComponent(gameDate)}`}
        className={`block p-4 rounded-lg border ${colorClass} transition-all hover:shadow-md hover:scale-[1.02] cursor-pointer no-underline`}
      >
        {content}
        <div className="mt-2 text-xs opacity-70 border-t border-current pt-1 flex items-center gap-1">
          <span>View Game</span>
          <span>→</span>
        </div>
      </Link>
    );
  }

  return (
    <div className={`p-4 rounded-lg border ${colorClass} transition-all hover:shadow-md`}>
      {content}
    </div>
  );
}
