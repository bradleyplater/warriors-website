import { useParams, Link } from "react-router";
import { useData } from "~/contexts/DataContext";
import NotFound from "~/components/not-found/not-found";
import { getPlayer } from "~/helpers/data-helpers";
import type { Result } from "~/contexts/DataContext";

export function meta({ params }: { params: { gameId: string } }) {
  return [
    { title: `Game Result` },
  ];
}

export default function GameResult() {
  const { gameId } = useParams();
  const { data } = useData();
  
  // Find game by date
  // Assuming gameId is the ISO date string
  // We might need to handle encoding/decoding if the URL encodes the colon
  const decodedGameId = decodeURIComponent(gameId || "");
  
  const game = data.results.find((r) => r.date === decodedGameId);

  if (!game) {
    return <NotFound />;
  }

  const { score, opponentTeam, logoImage, date, roster } = game;
  const isWin = score.warriorsScore > score.opponentScore;
  const outcomeColor = isWin ? "text-green-600" : score.warriorsScore < score.opponentScore ? "text-red-600" : "text-gray-600";
  const outcomeText = isWin ? "WIN" : score.warriorsScore < score.opponentScore ? "LOSS" : "DRAW";

  // Helper to get player name
  const getPlayerName = (id: string) => {
    const p = getPlayer(data.players, id);
    return p ? p.name : id;
  };

  // Collect all goals for timeline
  const allGoalsRaw = [
    ...score.period.one.goals.map(g => ({ ...g, period: 1 })),
    ...score.period.two.goals.map(g => ({ ...g, period: 2 })),
    ...score.period.three.goals.map(g => ({ ...g, period: 3 })),
  ].sort((a, b) => {
    if (a.period !== b.period) return a.period - b.period;
    if (a.minute !== b.minute) return a.minute - b.minute;
    return a.second - b.second;
  });

  // Calculate hattricks
  const playerGoalCounts: Record<string, number> = {};
  const allGoals = allGoalsRaw.map(goal => {
    const currentCount = (playerGoalCounts[goal.playerId] || 0) + 1;
    playerGoalCounts[goal.playerId] = currentCount;
    return {
      ...goal,
      isHattrick: currentCount === 3
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header / Scoreboard */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Warriors */}
            <div className="flex flex-col items-center text-center w-1/3">
              <div className="w-24 h-24 mb-2 relative">
                  <img src="/images/warriors-logo-black.png" alt="Leeds Warriors" className="object-contain w-full h-full" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Leeds Warriors</h2>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center justify-center w-1/3">
              <div className="text-sm text-gray-500 font-medium mb-1">
                {new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div className="text-5xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                <span>{score.warriorsScore}</span>
                <span className="text-gray-300">-</span>
                <span>{score.opponentScore}</span>
              </div>
              <div className={`mt-2 font-bold text-lg ${outcomeColor}`}>
                {outcomeText}
              </div>
            </div>

            {/* Opponent */}
            <div className="flex flex-col items-center text-center w-1/3">
              <div className="w-24 h-24 mb-2 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                {logoImage ? (
                   <img src={`/images/team-logos/${logoImage}`} alt={opponentTeam} className="object-contain w-full h-full" />
                ) : (
                   <span className="text-2xl">VS</span>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{opponentTeam}</h2>
            </div>
          </div>

          {/* Period Scores */}
          <div className="mt-8 border-t pt-6">
             <div className="grid grid-cols-4 gap-4 text-center max-w-lg mx-auto text-sm">
                <div className="text-gray-500 font-medium text-left">Period</div>
                <div className="font-semibold">1</div>
                <div className="font-semibold">2</div>
                <div className="font-semibold">3</div>

                <div className="text-gray-900 font-bold text-left">Warriors</div>
                <div>{score.period.one.warriorsScore}</div>
                <div>{score.period.two.warriorsScore}</div>
                <div>{score.period.three.warriorsScore}</div>

                <div className="text-gray-900 font-bold text-left">{opponentTeam}</div>
                <div>{score.period.one.opponentScore}</div>
                <div>{score.period.two.opponentScore}</div>
                <div>{score.period.three.opponentScore}</div>
             </div>
          </div>
        </div>

        {/* Goals Timeline */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h3 className="text-lg font-bold text-gray-900">Goals Summary</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {allGoals.length > 0 ? (
              allGoals.map((goal, index) => (
                <div key={index} className="px-6 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0 w-16 text-center">
                    <span className="block text-sm font-bold text-gray-900">
                      P{goal.period}
                    </span>
                    <span className="block text-xs text-gray-500">
                      {String(goal.minute).padStart(2, '0')}:{String(goal.second).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="flex-grow">
                     <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">
                           <Link to={`/player/${goal.playerId}`} className="hover:underline hover:text-blue-600">
                              {getPlayerName(goal.playerId)}
                           </Link>
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                          {goal.type}
                        </span>
                        {goal.isHattrick && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 border border-yellow-200 flex items-center gap-1">
                            🎩 Hattrick
                          </span>
                        )}
                     </div>
                     <div className="text-sm text-gray-600 mt-1">
                        {goal.assists.length > 0 ? (
                          <>
                            Assists: {goal.assists.map((id, i) => (
                              <span key={id}>
                                <Link to={`/player/${id}`} className="hover:underline hover:text-blue-600">
                                   {getPlayerName(id)}
                                </Link>
                                {i < goal.assists.length - 1 ? ", " : ""}
                              </span>
                            ))}
                          </>
                        ) : (
                          <span className="italic text-gray-400">Unassisted</span>
                        )}
                     </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No goals scored by Warriors in this game.
              </div>
            )}
          </div>
        </div>

        {/* Roster */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
             <h3 className="text-lg font-bold text-gray-900">Roster</h3>
          </div>
          <div className="p-6">
             {roster && roster.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                   {roster.map(playerId => (
                      <Link key={playerId} to={`/player/${playerId}`} className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all">
                         <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                             {/* Placeholder or actual image if available */}
                             {(() => {
                               const p = getPlayer(data.players, playerId);
                               // Using similar logic to PlayerHeader for image URL
                               const imageUrl = `/images/players/${playerId}.jpg`;
                               // Simple fallback logic since we can't easily check if file exists without trying to load it
                               // For now, we render img, but could use onError to swap to initials if we had state here.
                               // Since this is inside a map, maintaining state for each might be verbose.
                               // We'll assume image exists or let browser show broken image icon, or just show initials if name available.
                               
                               // Actually, PlayerHeader uses onError.
                               // A better approach for list items might be just using initials if we don't want to handle onError complexity for every item.
                               // But let's try to match the style.
                               
                               return (
                                 <img 
                                    src={imageUrl} 
                                    alt={p ? p.name : playerId} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    }}
                                 />
                               );
                             })()}
                             <div className="hidden w-full h-full flex items-center justify-center text-xs font-bold text-gray-500 bg-gray-300">
                                {(() => {
                                   const p = getPlayer(data.players, playerId);
                                   if (!p) return '??';
                                   const parts = p.name.split(' ');
                                   return parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : p.name.substring(0, 2);
                                })()}
                             </div>
                         </div>
                         <span className="text-sm font-medium text-gray-900">
                            {getPlayerName(playerId)}
                         </span>
                      </Link>
                   ))}
                </div>
             ) : (
                <div className="text-gray-500 italic">Roster information not available.</div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
}
