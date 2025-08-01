interface PlayerHeaderProps {
  player: {
    id: string;
    name: string;
    number: number;
    position: string;
    seasonsWithWarriors: number;
    age: number;
    height: string;
    weight: string;
    birthplace: string;
    imageUrl?: string | null;
  };
}

export default function PlayerHeader({ player }: PlayerHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
          {/* Player Image */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
              {player.imageUrl ? (
                <img 
                  src={player.imageUrl} 
                  alt={player.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg 
                  className="w-16 h-16 md:w-24 md:h-24 text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              )}
            </div>
          </div>

          {/* Player Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-4">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                {player.name}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-3">
                <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-lg md:text-xl font-bold">
                  #{player.number}
                </span>
                <span className="bg-indigo-600 px-3 py-1 rounded-full text-sm md:text-base font-medium">
                  {player.position}
                </span>
              </div>
            </div>

            {/* Player Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div className="text-center md:text-left">
                <div className="text-2xl md:text-3xl font-bold text-gray-200">
                  {player.seasonsWithWarriors}
                </div>
                <div className="text-sm md:text-base text-gray-300">
                  Seasons with Warriors
                </div>
              </div>
              
              <div className="text-center md:text-left">
                <div className="text-2xl md:text-3xl font-bold text-gray-200">
                  {player.age}
                </div>
                <div className="text-sm md:text-base text-gray-300">
                  Years Old
                </div>
              </div>
              
              <div className="text-center md:text-left">
                <div className="text-lg md:text-xl font-bold text-gray-200">
                  {player.height}
                </div>
                <div className="text-sm md:text-base text-gray-300">
                  Height
                </div>
              </div>
              
              <div className="text-center md:text-left">
                <div className="text-lg md:text-xl font-bold text-gray-200">
                  {player.weight}
                </div>
                <div className="text-sm md:text-base text-gray-300">
                  Weight
                </div>
              </div>
            </div>

            {/* Birthplace */}
            <div className="mt-4 text-center md:text-left">
              <span className="text-gray-300 text-sm md:text-base">
                Born in {player.birthplace}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
