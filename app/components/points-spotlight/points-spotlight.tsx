import LeaderboardCard from "../leaderboard-card/leaderboard-card";

export default function PointsSpotlight() {
    // Sample data - replace with actual data from context
    const topScorers = [
        { number: "99", name: "John Doe", position: "F", statToTrack: 12 },
        { number: "10", name: "Jane Smith", position: "D", statToTrack: 8 },
        { number: "7", name: "Mike Johnson", position: "F", statToTrack: 7 },
        { number: "23", name: "Sarah Wilson", position: "D", statToTrack: 6 },
        { number: "15", name: "Tom Brown", position: "D", statToTrack: 4 }
    ];

    return (
        <div className="bg-gray-100 rounded-2xl h-full w-full shadow-inner py-2 sm:py-3 md:py-4 flex flex-col justify-center items-center overflow-hidden">
            <div className="w-full space-y-1 sm:space-y-1.5 md:space-y-2 px-2 sm:px-3 md:px-4">
                {topScorers.map((player, index) => {
                    const isTop = index === 0;
                    const cardColors = isTop 
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200' 
                        : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
                    const textColors = isTop 
                        ? { number: 'text-blue-800 bg-blue-200', name: 'text-gray-800', position: 'text-blue-600', statToTrack: 'text-blue-800' }
                        : { number: 'text-gray-700 bg-gray-200', name: 'text-gray-700', position: 'text-gray-500', statToTrack: 'text-gray-700' };
                    
                    return (
                        <LeaderboardCard 
                            className={cardColors}
                            textColors={textColors}
                            player={player}
                        />
                    );
                })}
            </div>
        </div>
    );
}
