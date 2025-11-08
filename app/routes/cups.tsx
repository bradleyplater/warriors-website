import { useState } from 'react';
import { useData } from '~/contexts/DataContext';

interface TournamentData {
  season: string;
  year?: string;
  winner?: string;
  runnerUp?: string;
  finalScore?: string;
  groupStage: Record<string, {
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    points: number;
  }> | Array<{
    name: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    points: number;
  }>;
  semiFinals?: Array<{
    team1: string;
    team2: string;
    score: string;
    date: string;
  }>;
  final?: {
    team1: string;
    team2: string;
    score: string;
    date: string;
  };
}

export default function CupsPage() {
  const { data, loading, error } = useData();
  const [activeTab, setActiveTab] = useState<'botb' | 'llihc'>('botb');

  const botbData = data.botbTournaments || [];
  const llihcData = data.llihcTournaments || [];
  const currentData = activeTab === 'botb' ? botbData : llihcData;
  const tournamentName = activeTab === 'botb' ? 'Battle of the Bridge' : 'Lions League Ice Hockey Cup';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Tournament History
            </h1>
            <p className="text-xl md:text-2xl opacity-90">
              Warriors' Cup Competitions
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-2 border border-gray-200">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('botb')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'botb'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                Battle of the Bridge
              </button>
              <button
                onClick={() => setActiveTab('llihc')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === 'llihc'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                LLIHC Cup
              </button>
            </div>
          </div>
        </div>

        {/* Tournament Content */}
        <div className="space-y-8">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Loading tournament data...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 text-lg">Error: {error}</p>
            </div>
          ) : currentData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No tournament data available</p>
            </div>
          ) : (
            currentData.map((tournament) => (
              <div key={tournament.season} className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                {/* Tournament Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{tournamentName}</h2>
                      <p className="text-gray-600">Season {tournament.season}</p>
                    </div>
                    {tournament.winner && (
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Champions</div>
                        <div className="text-xl font-bold text-green-700">{tournament.winner}</div>
                        {tournament.year && <div className="text-sm text-gray-600">{tournament.year}</div>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Final Result */}
                {tournament.winner && tournament.runnerUp && tournament.finalScore && (
                  <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Final</h3>
                      <div className="flex items-center justify-center space-x-4">
                        <div className="text-xl font-bold text-green-700">{tournament.winner}</div>
                        <div className="text-2xl font-bold text-gray-900">{tournament.finalScore}</div>
                        <div className="text-xl font-bold text-blue-700">{tournament.runnerUp}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Group Stage Table */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Group Stage</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">P</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">W</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">D</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">L</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">GF</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">GA</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">GD</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Pts</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {Array.isArray(tournament.groupStage) ? (
                          // Handle BOTB array format
                          tournament.groupStage
                            .sort((a, b) => b.points - a.points)
                            .map((team) => (
                              <tr key={team.name}>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{team.name}</td>
                                <td className="px-4 py-3 text-sm text-center text-gray-700">{team.played}</td>
                                <td className="px-4 py-3 text-sm text-center text-green-700 font-semibold">{team.won}</td>
                                <td className="px-4 py-3 text-sm text-center text-gray-700">{team.drawn}</td>
                                <td className="px-4 py-3 text-sm text-center text-red-700 font-semibold">{team.lost}</td>
                                <td className="px-4 py-3 text-sm text-center text-gray-700">{team.goalsFor}</td>
                                <td className="px-4 py-3 text-sm text-center text-gray-700">{team.goalsAgainst}</td>
                                <td className="px-4 py-3 text-sm text-center font-semibold text-gray-900">{team.goalsFor - team.goalsAgainst}</td>
                                <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">{team.points}</td>
                              </tr>
                            ))
                        ) : (
                          // Handle LLIHC object format
                          Object.entries(tournament.groupStage)
                            .sort(([,a], [,b]) => b.points - a.points)
                            .map(([team, stats]) => (
                              <tr key={team} className={tournament.winner && team.toLowerCase() === tournament.winner.toLowerCase() ? 'bg-green-50' : ''}>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 capitalize">{team}</td>
                                <td className="px-4 py-3 text-sm text-center text-gray-700">{stats.played}</td>
                                <td className="px-4 py-3 text-sm text-center text-green-700 font-semibold">{stats.won}</td>
                                <td className="px-4 py-3 text-sm text-center text-gray-700">{stats.drawn}</td>
                                <td className="px-4 py-3 text-sm text-center text-red-700 font-semibold">{stats.lost}</td>
                                <td className="px-4 py-3 text-sm text-center text-gray-700">{stats.goalsFor}</td>
                                <td className="px-4 py-3 text-sm text-center text-gray-700">{stats.goalsAgainst}</td>
                                <td className="px-4 py-3 text-sm text-center font-semibold text-gray-900">{stats.goalsFor - stats.goalsAgainst}</td>
                                <td className="px-4 py-3 text-sm text-center font-bold text-gray-900">{stats.points}</td>
                              </tr>
                            ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Knockout Results */}
                {(tournament.semiFinals && tournament.semiFinals.length > 0) || tournament.final ? (
                  <div className="px-6 py-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Knockout Stage</h3>
                    <div className="space-y-4">
                      {/* Semi Finals */}
                      {tournament.semiFinals && tournament.semiFinals.length > 0 && (
                        <div>
                          <h4 className="text-md font-medium text-gray-700 mb-2">Semi Finals</h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            {tournament.semiFinals.map((match, index) => (
                              <div key={index} className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-gray-900">{match.team1}</span>
                                  <span className="font-bold text-gray-900">{match.score}</span>
                                  <span className="font-medium text-gray-900">{match.team2}</span>
                                </div>
                                <div className="text-sm text-gray-500 mt-1">{match.date}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Final */}
                      {tournament.final && (
                        <div>
                          <h4 className="text-md font-medium text-gray-700 mb-2">Final</h4>
                          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border-2 border-green-200">
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-green-700">{tournament.final.team1}</span>
                              <span className="text-xl font-bold text-gray-900">{tournament.final.score}</span>
                              <span className="text-lg font-bold text-blue-700">{tournament.final.team2}</span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">{tournament.final.date}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}