import { Link } from 'react-router';
import { useState } from 'react';
import { useData } from '~/contexts/DataContext';
import type { Route } from '../+types/root';

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: 'All Players - Warriors' },
    { name: 'description', content: 'View all current Warriors players' },
  ];
}

export default function Players() {
  const { data } = useData();

  const players = data.players.sort((a, b) => a.number - b.number);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Warriors Players</h1>
          <p className="text-lg text-gray-600">Meet our current roster</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {players.map((player) => {
            const [imageError, setImageError] = useState(false);
            const imageSrc = `/images/players/${player.id}.jpg`;
            
            return (
              <Link
                key={player.id}
                to={`/player/${player.id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group"
              >
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
                  
                  {/* Show current season stats if available */}
                  {player.stats.length > 0 && (
                    <div className="text-sm text-gray-600 mb-3">
                      <div className="flex justify-between">
                        <span>Games:</span>
                        <span className="font-medium">{player.stats[0].games}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Goals:</span>
                        <span className="font-medium">{player.stats[0].goals}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Assists:</span>
                        <span className="font-medium">{player.stats[0].assists}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Points:</span>
                        <span className="font-medium text-blue-600">{player.stats[0].points}</span>
                      </div>
                    </div>
                  )}
                  
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
          })}
        </div>
        
        {data.players.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No players found.</p>
          </div>
        )}
      </div>
    </div>
  );
}