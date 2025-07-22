import LeaderboardCard from "../leaderboard-card/leaderboard-card";
import { useData, type Player } from "../../contexts/DataContext";

interface IStatSpotlightData {
    number: string;
    name: string;
    position: string;
    statToTrack: number;
}

//Map all players into this format and return the top 5
// TODO: Have functionality to handle multiple seasons for each player
function getTop5Scorers(players: Player[]): IStatSpotlightData[] {
    return players.map(player => ({
        number: player.number.toString(),
        name: player.name,
        position: player.position.slice(0,1),
        statToTrack: player.stats[0].goals
    })).sort((a,b) => b.statToTrack - a.statToTrack).slice(0,5)
}

export default function GoalSpotlight() {
    const { data } = useData();

    const topScorers = getTop5Scorers(data.players);

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
