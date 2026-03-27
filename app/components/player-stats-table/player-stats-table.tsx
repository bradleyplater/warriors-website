import { useState } from 'react';
import type { Season } from '../season-filter/season-filter';
import type { Position, Competition, SortBy } from '../../routes/player-stats';
import PlayerStatsRow from '../player-stats-row/player-stats-row';
import { useData, type Player, type Result } from '../../contexts/DataContext';
import { getGoalsForOneGame, getAssistsForOneGame, getPimsForOneGame } from '~/helpers/game-helpers';

interface PlayerStatsTableProps {
  selectedSeason: Season;
  selectedPosition: Position;
  selectedCompetition: Competition;
  sortBy: SortBy;
}

function getPlayerStats(players: Player[], results: Result[], selectedSeason: Season, selectedPosition: Position, selectedCompetition: Competition, sortBy: SortBy) {
    const playerWithStats = players.filter(player => {
        if (selectedSeason === 'overall' && selectedCompetition === 'all') {
            return player.stats.length > 0;
        }
        
        // If filtering by competition, we must check the results
        if (selectedCompetition !== 'all') {
            return results.some(r => 
                (selectedSeason === 'overall' || r.seasonId === selectedSeason) &&
                r.competition === selectedCompetition &&
                r.roster.includes(player.id)
            );
        }

        return player.stats.find(stat => stat.season === selectedSeason);
    });

    return playerWithStats
        .map(player => {
            let games = 0;
            let goals = 0;
            let assists = 0;
            let points = 0;
            let pims = 0;
            let manOfTheMatch = 0;
            let warriorOfTheGame = 0;

            if (selectedCompetition !== 'all') {
                // Filter results by competition and season
                const filteredResults = results.filter(r => 
                    (selectedSeason === 'overall' || r.seasonId === selectedSeason) &&
                    r.competition === selectedCompetition &&
                    r.roster.includes(player.id)
                );

                if (filteredResults.length === 0) return null;

                games = filteredResults.length;
                filteredResults.forEach(r => {
                    goals += getGoalsForOneGame(r, player.id);
                    assists += getAssistsForOneGame(r, player.id);
                    pims += getPimsForOneGame(r, player.id);
                    if (r.manOfTheMatchPlayerId === player.id) manOfTheMatch++;
                    if (r.warriorOfTheGamePlayerId === player.id) warriorOfTheGame++;
                });
                points = goals + assists;
            } else {
                const statsToTrack = player.stats.filter(stat => 
                    stat.season === selectedSeason || selectedSeason === 'overall'
                );
        
                if (!statsToTrack.length) {
                    return null;
                }

                games = statsToTrack.reduce((total, stat) => total + stat.games, 0);
                goals = statsToTrack.reduce((total, stat) => total + stat.goals, 0);
                assists = statsToTrack.reduce((total, stat) => total + stat.assists, 0);
                points = statsToTrack.reduce((total, stat) => total + stat.points, 0);
                pims = statsToTrack.reduce((total, stat) => total + (stat.pims || 0), 0);
                manOfTheMatch = statsToTrack.reduce((total, stat) => total + (stat.manOfTheMatch || 0), 0);
                warriorOfTheGame = statsToTrack.reduce((total, stat) => total + (stat.warriorOfTheGame || 0), 0);
            }

            const pointsPerGame = games > 0 ? points / games : 0;
    
            return {
                number: player.number.toString(),
                name: player.name,
                position: player.position,
                games,
                goals,
                assists,
                points,
                pims,
                manOfTheMatch,
                warriorOfTheGame,
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
                case 'motm':
                    return (b.manOfTheMatch ?? 0) - (a.manOfTheMatch ?? 0);
                case 'wotg':
                    return (b.warriorOfTheGame ?? 0) - (a.warriorOfTheGame ?? 0);
                default:
                    return b.points - a.points;
            }
        });
}

function getGoalieStats(players: Player[], results: Result[], selectedSeason: Season, selectedCompetition: Competition) {
    const goalies = players.filter(player => {
        return results.some(r => 
            (selectedSeason === 'overall' || r.seasonId === selectedSeason) &&
            (selectedCompetition === 'all' || r.competition === selectedCompetition) &&
            r.netminderPlayerId === player.id
        );
    });

    return goalies.map(goalie => {
        const goalieResults = results.filter(r => 
            (selectedSeason === 'overall' || r.seasonId === selectedSeason) &&
            (selectedCompetition === 'all' || r.competition === selectedCompetition) &&
            r.netminderPlayerId === goalie.id
        );

        const games = goalieResults.length;
        const goalsAgainst = goalieResults.reduce((total, r) => total + r.score.opponentScore, 0);
        const gaa = games > 0 ? goalsAgainst / games : 0;

        return {
            number: goalie.number.toString(),
            name: goalie.name,
            games,
            gaa
        };
    }).sort((a, b) => a.gaa - b.gaa); // Sort by GAA (lower is better)
}


export default function PlayerStatsTable({ selectedSeason, selectedPosition, selectedCompetition, sortBy }: PlayerStatsTableProps) {
    const { data } = useData();    

    const players = data.players;
    const results = data.results;

    const mappedPlayers = getPlayerStats(players, results, selectedSeason, selectedPosition, selectedCompetition, sortBy);
    const goalieStats = getGoalieStats(players, results, selectedSeason, selectedCompetition);


  return (
    <div className="space-y-6">
      {selectedPosition === 'goaltender' ? (
        /* Goalie Table */
        goalieStats.length > 0 ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Desktop Goalie Table */}
            <div className="hidden md:block">
              <div className="bg-gray-50 border-b-2 border-gray-200">
                <div className="grid grid-cols-4 gap-3 px-6 py-4">
                  <div className="flex items-center">
                    <span className="text-sm font-bold text-black uppercase tracking-wider">Goalie</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-sm font-bold text-black uppercase tracking-wider">GP</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-sm font-bold text-black uppercase tracking-wider">GAA</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-sm font-bold text-black uppercase tracking-wider">Goals Against</span>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {goalieStats.map((goalie, index) => (
                  <div
                    key={goalie.name}
                    className={`
                      grid grid-cols-4 gap-3 px-6 py-4 transition-all duration-300 hover:bg-gray-50
                      ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                    `}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-sm font-bold text-white bg-gradient-to-r from-gray-700 to-gray-800 px-3 py-1 rounded-lg min-w-[36px] text-center shadow-sm">
                        #{goalie.number}
                      </span>
                      <span className="text-sm font-semibold text-black truncate">
                        {goalie.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg shadow-sm">{goalie.games}</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-lg shadow-sm">{goalie.gaa.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="text-sm font-medium text-red-700 bg-red-50 px-3 py-1 rounded-lg shadow-sm">
                        {(goalie.gaa * goalie.games).toFixed(0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Goalie Table */}
            <div className="md:hidden">
              <div className="divide-y divide-gray-200">
                {goalieStats.map((goalie, index) => (
                  <div key={goalie.name} className={`px-4 py-4 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white bg-gray-800 px-2 py-0.5 rounded">#{goalie.number}</span>
                        <span className="text-sm font-bold text-black">{goalie.name}</span>
                      </div>
                      <div className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded">
                        GAA: {goalie.gaa.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-600">
                      <div>GP: <span className="font-bold">{goalie.games}</span></div>
                      <div>GA: <span className="font-bold">{(goalie.gaa * goalie.games).toFixed(0)}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center animate-in fade-in duration-500">
            <p className="text-gray-500 font-medium">No goalie statistics available for the selected filters.</p>
          </div>
        )
      ) : (
        /* Skater Table */
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Mobile: Horizontal scroll */}
          <div className="md:hidden overflow-x-auto">
            {/* Header */}
            <div className="flex gap-2 px-4 py-4 min-w-[650px] bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <div className="flex-shrink-0 w-32 flex items-center">
                <span className="text-xs font-bold text-black uppercase tracking-wider">Player</span>
              </div>
              <div className="flex-shrink-0 w-12 flex items-center justify-center">
                <span className="text-xs font-bold text-black uppercase tracking-wider">GP</span>
              </div>
              <div className="flex-shrink-0 w-12 flex items-center justify-center">
                <span className="text-xs font-bold text-black uppercase tracking-wider">G</span>
              </div>
              <div className="flex-shrink-0 w-12 flex items-center justify-center">
                <span className="text-xs font-bold text-black uppercase tracking-wider">A</span>
              </div>
              <div className="flex-shrink-0 w-16 flex items-center justify-center">
                <span className="text-xs font-bold text-black uppercase tracking-wider">PTS</span>
              </div>
              <div className="flex-shrink-0 w-16 flex items-center justify-center">
                <span className="text-xs font-bold text-black uppercase tracking-wider">PPG</span>
              </div>
              <div className="flex-shrink-0 w-16 flex items-center justify-center">
                <span className="text-xs font-bold text-black uppercase tracking-wider">PIM</span>
              </div>
              <div className="flex-shrink-0 w-16 flex items-center justify-center">
                <span className="text-xs font-bold text-black uppercase tracking-wider">MOTM</span>
              </div>
              <div className="flex-shrink-0 w-16 flex items-center justify-center">
                <span className="text-xs font-bold text-black uppercase tracking-wider">WOTG</span>
              </div>
            </div>
            {/* Player Rows */}
            <div className="divide-y divide-gray-200">
              {mappedPlayers.map((player, index) => (
                <div
                  key={player.name}
                  className={`
                    flex gap-2 px-4 py-4 min-w-[500px] transition-all duration-300 hover:bg-gray-50 hover:shadow-sm
                    ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                  `}
                >
                  <div className="flex-shrink-0 w-32 flex items-center gap-2 min-w-0">
                    <span className="text-xs font-bold text-white bg-gradient-to-r from-gray-700 to-gray-800 px-2 py-1 rounded-full min-w-[24px] text-center flex-shrink-0 shadow-sm">
                      #{player.number}
                    </span>
                    <span className="text-xs font-semibold text-black truncate">
                      {player.name}
                    </span>
                  </div>
                  <div className="flex-shrink-0 w-12 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-lg">{player.games}</span>
                  </div>
                  <div className="flex-shrink-0 w-12 flex items-center justify-center">
                    <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-lg">{player.goals}</span>
                  </div>
                  <div className="flex-shrink-0 w-12 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-lg">{player.assists}</span>
                  </div>
                  <div className="flex-shrink-0 w-16 flex items-center justify-center">
                    <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded-lg">{player.points}</span>
                  </div>
                  <div className="flex-shrink-0 w-16 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-700">{player.pointsPerGame.toFixed(2)}</span>
                  </div>
                  <div className="flex-shrink-0 w-16 flex items-center justify-center">
                    <span className="text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded-lg">{player.pims}</span>
                  </div>
                  <div className="flex-shrink-0 w-16 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-700 bg-yellow-50 px-2 py-1 rounded-lg">{player.manOfTheMatch}</span>
                  </div>
                  <div className="flex-shrink-0 w-16 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-700 bg-orange-50 px-2 py-1 rounded-lg">{player.warriorOfTheGame}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: Regular grid layout */}
          <div className="hidden md:block">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <div className="grid grid-cols-11 gap-3 px-6 py-5">
                <div className="col-span-2 flex items-center">
                  <span className="text-sm font-bold text-black uppercase tracking-wider">Player</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-sm font-bold text-black uppercase tracking-wider">POS</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-sm font-bold text-black uppercase tracking-wider">GP</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-sm font-bold text-black uppercase tracking-wider">G</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-sm font-bold text-black uppercase tracking-wider">A</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-sm font-bold text-black uppercase tracking-wider">PTS</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-sm font-bold text-black uppercase tracking-wider">PPG</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-sm font-bold text-black uppercase tracking-wider">PIM</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-sm font-bold text-black uppercase tracking-wider">MOTM</span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-sm font-bold text-black uppercase tracking-wider">WOTG</span>
                </div>
              </div>
            </div>
            {/* Player Rows */}
            <div className="divide-y divide-gray-200">
              {mappedPlayers.map((player, index) => (
                <div
                  key={player.name}
                  className={`
                    grid grid-cols-11 gap-3 px-6 py-5 transition-all duration-300 hover:bg-gray-50 hover:shadow-lg hover:scale-[1.01]
                    ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                  `}
                >
                  <div className="col-span-2 flex items-center gap-3 min-w-0">
                    <span className="text-sm font-bold text-white bg-gradient-to-r from-gray-700 to-gray-800 px-3 py-2 rounded-xl min-w-[40px] text-center shadow-md">
                      #{player.number}
                    </span>
                    <span className="text-sm font-semibold text-black truncate">
                      {player.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-2 rounded-xl min-w-[48px] text-center shadow-sm">
                      {player.position}
                    </span>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-2 rounded-xl shadow-sm">{player.games}</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-sm font-bold text-green-700 bg-green-100 px-3 py-2 rounded-xl shadow-sm">{player.goals}</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-700 bg-blue-100 px-3 py-2 rounded-xl shadow-sm">{player.assists}</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-sm font-bold text-purple-700 bg-purple-100 px-3 py-2 rounded-xl shadow-sm">{player.points}</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-2 rounded-xl shadow-sm">{player.pointsPerGame.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-sm font-semibold text-red-700 bg-red-50 px-3 py-2 rounded-xl shadow-sm">{player.pims}</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-700 bg-yellow-50 px-3 py-2 rounded-xl shadow-sm">{player.manOfTheMatch}</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-700 bg-orange-50 px-3 py-2 rounded-xl shadow-sm">{player.warriorOfTheGame}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
