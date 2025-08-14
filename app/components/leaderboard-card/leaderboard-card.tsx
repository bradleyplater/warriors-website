interface ILeaderboardCardProps {
    className: string;
    textColors: {
        number: string;
        name: string;
        position: string;
        statToTrack: string;
    }
    player: {
        name: string;
        number: string;
        position: string;
        statToTrack: number;
    }
}

export default function LeaderboardCard({ className, textColors, player }: ILeaderboardCardProps) {
    return (
        <div className={`${className} border rounded-md sm:rounded-lg transition-all duration-200 hover:shadow-md hover:scale-[1.01]`}>
            <div className="flex flex-row items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2">
                {/* Player Info */}
                <div className="flex flex-row items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
                    <span className={`text-[10px] sm:text-xs font-bold ${textColors.number} px-1.5 py-0.5 rounded-full min-w-[20px] sm:min-w-[24px] flex items-center justify-center`}>
                        #{player.number}
                    </span>
                    <span className={`text-xs sm:text-sm font-semibold ${textColors.name} truncate flex-1`}>
                        {player.name}
                    </span>
                    <span className={`text-[10px] sm:text-xs font-medium ${textColors.position} w-4 text-center`}>
                        {player.position}
                    </span>
                </div>

                {/* Goals */}
                <div className="flex items-center justify-center min-w-[24px] sm:min-w-[28px]">
                    <span className={`text-sm sm:text-base font-bold ${textColors.statToTrack} leading-none`}>
                        {player.statToTrack}
                    </span>
                </div>
            </div>
        </div>
    );
}
