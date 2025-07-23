import LeaderboardCard from "../leaderboard-card/leaderboard-card";
import { useData, type Player } from "../../contexts/DataContext";
import type { Season } from "../season-filter/season-filter";

export interface IStatSpotlightData {
    number: string;
    name: string;
    position: string;
    statToTrack: number;
}

export interface IStatSpotlightProps {
    selectedSeason: Season;
}

function getTop5Scorers(players: Player[], selectedSeason: Season): IStatSpotlightData[] {

    const playerWithStatsInSeason = players.filter(player => player.stats.find( (stat) => stat.season === selectedSeason || selectedSeason === 'overall' ));

    return playerWithStatsInSeason
        .map(player => {
            const statsToTrack = player.stats.filter(stat => 
                stat.season === selectedSeason || selectedSeason === 'overall'
            );
    
            if (!statsToTrack.length) {
                return null; // Return null instead of empty object
            }
    
            return {
                number: player.number.toString(),
                name: player.name,
                position: player.position.slice(0,1),
                statToTrack: selectedSeason === 'overall' ? statsToTrack.reduce((total, stat) => total + stat.goals, 0) : statsToTrack[0].goals
            };
        })
        .filter(player => player !== null) // Filter out null values before sorting
        .sort((a,b) => b.statToTrack - a.statToTrack)
        .slice(0,5);
}

export default function GoalSpotlight({selectedSeason}: IStatSpotlightProps) {
    const { data } = useData();

    const topScorers = getTop5Scorers(data.players, selectedSeason);

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
