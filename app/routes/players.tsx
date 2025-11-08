import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { useData } from '~/contexts/DataContext';
import type { Route } from '../+types/root';

interface TeamConfig {
  leadership: {
    captain: string;
    assistants: string[];
  };
}

interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
  stats: Array<{
    season: string;
    games: number;
    goals: number;
    assists: number;
    pims: number;
    points: number;
  }>;
}

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: 'All Players - Warriors' },
    { name: 'description', content: 'View all current Warriors players' },
  ];
}

export default function Players() {
  const { data } = useData();
  const [teamConfig, setTeamConfig] = useState<TeamConfig | null>(null);

  useEffect(() => {
    fetch('/data/team-config.json')
      .then(response => response.json())
      .then(config => setTeamConfig(config))
      .catch(error => console.error('Error loading team config:', error));
  }, []);

  const players = data.players.sort((a, b) => a.number - b.number);

  // Group players by position and leadership
  const getPlayerRole = (playerId: string) => {
    if (!teamConfig) return null;
    if (teamConfig.leadership.captain === playerId) return 'Captain';
    if (teamConfig.leadership.assistants.includes(playerId)) return 'Assistant Captain';
    return null;
  };

  const leadershipPlayers = players.filter(player => 
    teamConfig && (
      teamConfig.leadership.captain === player.id || 
      teamConfig.leadership.assistants.includes(player.id)
    )
  ).sort((a, b) => {
    if (!teamConfig) return 0;
    // Captain comes first
    if (teamConfig.leadership.captain === a.id) return -1;
    if (teamConfig.leadership.captain === b.id) return 1;
    // Then assistants (maintain their relative order)
    return 0;
  });

  const forwards = players.filter(player => 
    player.position.includes('Forward') && !leadershipPlayers.some(lp => lp.id === player.id) 
  );

  const defence = players.filter(player => 
    player.position.includes('Defence') && !leadershipPlayers.some(lp => lp.id === player.id)
  );

  const goalies = players.filter(player => 
    player.position.includes('Goaltender') && !leadershipPlayers.some(lp => lp.id === player.id)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Warriors Players
            </h1>
            <p className="text-xl md:text-2xl opacity-90">
              Meet our current roster
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Quick Navigation Links */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Quick Navigation</h3>
            <p className="text-sm text-gray-600">Jump to any section below</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <a 
              href="#leadership" 
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium border border-gray-200"
            >
              Leadership
            </a>
            <a 
              href="#forwards" 
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium border border-gray-200"
            >
              Forwards
            </a>
            <a 
              href="#defence" 
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium border border-gray-200"
            >
              Defence
            </a>
            <a 
              href="#goalies" 
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium border border-gray-200"
            >
              Goalies
            </a>
          </div>
        </div>

        {/* Leadership Section */}
        {leadershipPlayers.length > 0 && (
          <div id="leadership" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-yellow-500">👑</span>
              Leadership
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {leadershipPlayers.map((player) => (
                <PlayerCard key={player.id} player={player} role={getPlayerRole(player.id)} />
              ))}
            </div>
          </div>
        )}

        {/* Forwards Section */}
        {forwards.length > 0 && (
          <div id="forwards" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-red-500">⚡</span>
              Forwards
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {forwards.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          </div>
        )}

        {/* Defence Section */}
        {defence.length > 0 && (
          <div id="defence" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-blue-500">🛡️</span>
              Defence
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {defence.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          </div>
        )}

        {/* Goalies Section */}
        {goalies.length > 0 && (
          <div id="goalies" className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="text-green-500">🥅</span>
              Goalies
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {goalies.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          </div>
        )}
        
        {data.players.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No players found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PlayerCard({ player, role }: { player: Player; role?: string | null }) {
  const [imageError, setImageError] = useState(false);
  const imageSrc = `/images/players/${player.id}.jpg`;
  
  return (
    <Link
      to={`/player/${player.id}`}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group relative"
    >
      {/* Leadership Badge */}
      {role && (
        <div className="absolute top-2 left-2 z-10">
          <span className={`text-xs font-bold px-2 py-1 rounded-full bg-yellow-400 text-gray-800'
          }`}>
            {role === 'Captain' ? 'C' : 'A'}
          </span>
        </div>
      )}
      
      <div className="aspect-square bg-gray-100 overflow-hidden flex items-center justify-center">
        {!imageError ? (
          <img
            src={imageSrc}
            alt={`${player.name} profile`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <svg 
            className="w-16 h-16 text-gray-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold text-blue-600">#{player.number}</span>
          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {player.position !== 'MISSING' ? player.position : 'N/A'}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {player.name}
        </h3>
        
        {role && (
          <p className="text-sm font-medium text-yellow-600 mb-2">{role}</p>
        )}
        
        {/* Show career totals if available */}
        {player.stats.length > 0 && (() => {
          const careerTotals = player.stats.reduce(
            (totals, season) => ({
              games: totals.games + season.games,
              goals: totals.goals + season.goals,
              assists: totals.assists + season.assists,
              points: totals.points + season.points
            }),
            { games: 0, goals: 0, assists: 0, points: 0 }
          );
          
          return (
            <div className="text-sm text-gray-600 mb-3">
              <div className="flex justify-between">
                <span>Career Games:</span>
                <span className="font-medium">{careerTotals.games}</span>
              </div>
              <div className="flex justify-between">
                <span>Career Goals:</span>
                <span className="font-medium">{careerTotals.goals}</span>
              </div>
              <div className="flex justify-between">
                <span>Career Assists:</span>
                <span className="font-medium">{careerTotals.assists}</span>
              </div>
              <div className="flex justify-between">
                <span>Career Points:</span>
                <span className="font-medium text-blue-600">{careerTotals.points}</span>
              </div>
            </div>
          );
        })()}
        
        {/* More Details Button */}
        <div className="flex items-center justify-center mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-blue-600 group-hover:text-blue-700 transition-colors">
            <span className="text-sm font-medium">View Details</span>
            <svg 
              className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}