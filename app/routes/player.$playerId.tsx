import { useState } from 'react';
import { data, useParams } from 'react-router';
import type { Route } from '../+types/root';
import PlayerHeader from '../components/player-header/player-header';
import PlayerTabs from '../components/player-tabs/player-tabs';
import { getPlayer } from '~/helpers/data-helpers';
import { useData } from '~/contexts/DataContext';
import NotFound from '~/components/not-found/not-found';

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Player Profile` },
  ];
}

export default function PlayerDetail() {
  const { playerId } = useParams();
  const [activeTab, setActiveTab] = useState<'stats' | 'charts' | 'games' | 'allgames'>('stats');

  const data = useData();

  // In a real app, you'd fetch player data based on playerId
  const player = getPlayer(data.data.players, playerId!);

  if (!player) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Player Header */}
      <PlayerHeader playerId={playerId || '1'} />
      
      {/* Player Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <PlayerTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          playerId={playerId || '1'}
        />
      </div>
    </div>
  );
}
