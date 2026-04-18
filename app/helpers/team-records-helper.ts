import type { Player, Result } from "~/contexts/DataContext"
import { getNumberOfPPGoalsForPlayer, getNumberOfSHGoalsForPlayer, getNumberOfGWGoalsForPlayer } from "./data-helpers";

interface GameInfo {
    opponent: string;
    date: string;
    result: string;
}

interface RecordHolder {
    playerName: string;
    playerId: string;
    gameInfo: GameInfo;
}

interface SeasonRecordHolder {
    playerName: string;
    playerId: string;
    season: string;
}

interface TeamRecord {
    title: string;
    description: string;
    value: string;
    holders: RecordHolder[];
    category: "goals" | "assists" | "points" | "performance";
}

interface SeasonRecord {
    title: string;
    description: string;
    value: string;
    holders: SeasonRecordHolder[];
    category: "goals" | "assists" | "points" | "performance";
}

interface AllTimeRecordHolder {
    playerName: string;
    playerId: string;
}

interface AllTimeRecord {
    title: string;
    description: string;
    value: string;
    holders: AllTimeRecordHolder[];
    category: "goals" | "assists" | "points" | "performance";
}

function getPlayerName(playerId: string, players: Player[]): string {
    const player = players.find(p => p.id === playerId);
    return player ? player.name : `Player #${playerId}`;
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

function getGameResult(result: Result): string {
    const { warriorsScore, opponentScore } = result.score;
    if (warriorsScore > opponentScore) return `W ${warriorsScore}-${opponentScore}`;
    if (warriorsScore < opponentScore) return `L ${warriorsScore}-${opponentScore}`;
    return `D ${warriorsScore}-${opponentScore}`;
}

// Game Records
const getMostGoals = (results: Result[], players: Player[]): TeamRecord => {
    let maxGoals = 0;
    let recordHolders: Array<{ playerId: string; gameData: Result }> = [];

    // Analyze each game
    results.forEach(result => {
        const allPeriods = [
            result.score.period.one,
            result.score.period.two,
            result.score.period.three
        ];

        // Track goals per player for this game
        const gameGoalsByPlayer: Record<string, number> = {};

        // Count goals for each player across all periods
        allPeriods.forEach(periodData => {
            periodData.goals.forEach(goal => {
                const playerId = goal.playerId;
                gameGoalsByPlayer[playerId] = (gameGoalsByPlayer[playerId] || 0) + 1;
            });
        });

        // Check if any player in this game has a new record or ties existing record
        Object.entries(gameGoalsByPlayer).forEach(([playerId, goalCount]) => {
            if (goalCount > maxGoals) {
                // New record holder
                maxGoals = goalCount;
                recordHolders = [{ playerId, gameData: result }];
            } else if (goalCount === maxGoals && goalCount > 0) {
                // Tied record - add to holders if not already present
                const alreadyExists = recordHolders.some(
                    holder => holder.playerId === playerId && holder.gameData.date === result.date
                );
                if (!alreadyExists) {
                    recordHolders.push({ playerId, gameData: result });
                }
            }
        });
    });

    return {
        title: 'Most Goals in a Game',
        description: 'Single game goal scoring record',
        value: `${maxGoals} goal${maxGoals !== 1 ? 's' : ''}`,
        category: 'goals',
        holders: recordHolders.map(holder => ({
            playerName: getPlayerName(holder.playerId, players),
            playerId: holder.playerId,
            gameInfo: {
                opponent: holder.gameData.opponentTeam,
                date: formatDate(holder.gameData.date),
                result: getGameResult(holder.gameData)
            }
        }))
    };
};

const getMostAssists = (results: Result[], players: Player[]): TeamRecord => {
    let maxAssists = 0;
    let recordHolders: Array<{ playerId: string; gameData: Result }> = [];

    // Analyze each game
    results.forEach(result => {
        const allPeriods = [
            result.score.period.one,
            result.score.period.two,
            result.score.period.three
        ];

        // Track goals per player for this game
        const gameAssistsByPlayer: Record<string, number> = {};

        // Count goals for each player across all periods
        allPeriods.forEach(periodData => {
            periodData.goals.forEach(goal => {
                const assistPlayerId = goal.assists;
                assistPlayerId.forEach(playerId => {
                    gameAssistsByPlayer[playerId] = (gameAssistsByPlayer[playerId] || 0) + 1;
                });
            });
        });

        // Check if any player in this game has a new record or ties existing record
        Object.entries(gameAssistsByPlayer).forEach(([playerId, assistCount]) => {
            if (assistCount > maxAssists) {
                // New record holder
                maxAssists = assistCount;
                recordHolders = [{ playerId, gameData: result }];
            } else if (assistCount === maxAssists && assistCount > 0) {
                // Tied record - add to holders if not already present
                const alreadyExists = recordHolders.some(
                    holder => holder.playerId === playerId && holder.gameData.date === result.date
                );
                if (!alreadyExists) {
                    recordHolders.push({ playerId, gameData: result });
                }
            }
        });
    });

    return {
        title: 'Most Assists in a Game',
        description: 'Single game assist scoring record',
        value: `${maxAssists} assist${maxAssists !== 1 ? 's' : ''}`,
        category: 'assists',
        holders: recordHolders.map(holder => ({
            playerName: getPlayerName(holder.playerId, players),
            playerId: holder.playerId,
            gameInfo: {
                opponent: holder.gameData.opponentTeam,
                date: formatDate(holder.gameData.date),
                result: getGameResult(holder.gameData)
            }
        }))
    };
};

const getMostPoints = (results: Result[], players: Player[]): TeamRecord => {
    let maxPoints = 0;
    let recordHolders: Array<{ playerId: string; gameData: Result }> = [];

    // Analyze each game
    results.forEach(result => {
        const allPeriods = [
            result.score.period.one,
            result.score.period.two,
            result.score.period.three
        ];

        // Track goals per player for this game
        const gamePointsByPlayer: Record<string, number> = {};

        // Count goals for each player across all periods
        allPeriods.forEach(periodData => {
            periodData.goals.forEach(goal => {
                const goalPlayerId = goal.playerId
                gamePointsByPlayer[goalPlayerId] = (gamePointsByPlayer[goalPlayerId] || 0) + 1;

                const assistPlayerId = goal.assists;
                assistPlayerId.forEach(playerId => {
                    gamePointsByPlayer[playerId] = (gamePointsByPlayer[playerId] || 0) + 1;
                });
            });
        });

        // Check if any player in this game has a new record or ties existing record
        Object.entries(gamePointsByPlayer).forEach(([playerId, pointsCount]) => {
            if (pointsCount > maxPoints) {
                // New record holder
                maxPoints = pointsCount;
                recordHolders = [{ playerId, gameData: result }];
            } else if (pointsCount === maxPoints && pointsCount > 0) {
                // Tied record - add to holders if not already present
                const alreadyExists = recordHolders.some(
                    holder => holder.playerId === playerId && holder.gameData.date === result.date
                );
                if (!alreadyExists) {
                    recordHolders.push({ playerId, gameData: result });
                }
            }
        });
    });

    return {
        title: 'Most Points in a Game',
        description: 'Single game point scoring record',
        value: `${maxPoints} point${maxPoints !== 1 ? 's' : ''}`,
        category: 'points',
        holders: recordHolders.map(holder => ({
            playerName: getPlayerName(holder.playerId, players),
            playerId: holder.playerId,
            gameInfo: {
                opponent: holder.gameData.opponentTeam,
                date: formatDate(holder.gameData.date),
                result: getGameResult(holder.gameData)
            }
        }))
    };
};

const getQuickestGoal = (results: Result[], players: Player[]): TeamRecord => {
    let quickestTime = Infinity; // Start with infinity to find the minimum
    let recordHolders: Array<{ playerId: string; gameData: Result }> = [];

    // Analyze each game
    results.forEach(result => {
        const allPeriods = [
            result.score.period.one,
            result.score.period.two,
            result.score.period.three
        ];

        // Track quickest goal per player for this game
        const quickestGoalInSecondsByPlayer: Record<string, number> = {};

        // Find quickest goal for each player across all periods
        allPeriods.forEach(periodData => {
            periodData.goals.forEach(goal => {
                const totalSeconds = goal.minute * 60 + goal.second;
                const playerId = goal.playerId;
                
                // Keep only the quickest goal for each player in this game
                if (!quickestGoalInSecondsByPlayer[playerId] || totalSeconds < quickestGoalInSecondsByPlayer[playerId]) {
                    quickestGoalInSecondsByPlayer[playerId] = totalSeconds;
                }
            });
        });

        // Check if any player in this game has a new record or ties existing record
        Object.entries(quickestGoalInSecondsByPlayer).forEach(([playerId, time]) => {
            if (time < quickestTime) {
                // New record holder
                quickestTime = time;
                recordHolders = [{ playerId, gameData: result }];
            } else if (time === quickestTime && time > 0) {
                // Tied record - add to holders if not already present
                const alreadyExists = recordHolders.some(
                    holder => holder.playerId === playerId && holder.gameData.date === result.date
                );
                if (!alreadyExists) {
                    recordHolders.push({ playerId, gameData: result });
                }
            }
        });
    });

    // Convert quickest time back to minutes:seconds format
    const minutes = Math.floor(quickestTime / 60);
    const seconds = quickestTime % 60;
    const timeDisplay = quickestTime === Infinity ? "No goals" : `${minutes}:${seconds.toString().padStart(2, '0')}`;

    return {
        title: 'Quickest Goal',
        description: 'Fastest goal scored in a game',
        value: timeDisplay,
        category: 'performance',
        holders: recordHolders.map(holder => ({
            playerName: getPlayerName(holder.playerId, players),
            playerId: holder.playerId,
            gameInfo: {
                opponent: holder.gameData.opponentTeam,
                date: formatDate(holder.gameData.date),
                result: getGameResult(holder.gameData)
            }
        }))
    };
};

const getQuickestHattrick = (results: Result[], players: Player[]): TeamRecord => {
    let quickestHattrickTime = Infinity;
    let recordHolders: Array<{ playerId: string; gameData: Result }> = [];

    // Analyze each game
    results.forEach(result => {
        const allPeriods = [
            { name: 'First', data: result.score.period.one, periodNumber: 1 },
            { name: 'Second', data: result.score.period.two, periodNumber: 2 },
            { name: 'Third', data: result.score.period.three, periodNumber: 3 }
        ];

        // Collect all goals with their game time for each player
        const playerGoals: Record<string, Array<{ time: number; periodName: string; minute: number; second: number }>> = {};

        allPeriods.forEach(({ name: periodName, data: periodData, periodNumber }) => {
            periodData.goals.forEach(goal => {
                const playerId = goal.playerId;
                // Calculate absolute game time: (period - 1) * 20 minutes + goal time
                const periodOffset = (periodNumber - 1) * 20 * 60; // Previous periods in seconds
                const gameTimeInSeconds = periodOffset + (goal.minute * 60) + goal.second;
                
                if (!playerGoals[playerId]) {
                    playerGoals[playerId] = [];
                }
                
                playerGoals[playerId].push({
                    time: gameTimeInSeconds,
                    periodName,
                    minute: goal.minute,
                    second: goal.second
                });
            });
        });

        // Check for hat tricks (3+ goals) and find the time span from 1st to 3rd goal
        Object.entries(playerGoals).forEach(([playerId, goals]) => {
            if (goals.length >= 3) {
                // Sort goals by time to find the 1st and 3rd goals
                const sortedGoals = goals.sort((a, b) => a.time - b.time);
                const firstGoalTime = sortedGoals[0].time; // Index 0 is the 1st goal
                const thirdGoalTime = sortedGoals[2].time; // Index 2 is the 3rd goal
                
                // Calculate time span from 1st goal to 3rd goal
                const hattrickTimeSpan = thirdGoalTime - firstGoalTime;
                
                if (hattrickTimeSpan < quickestHattrickTime) {
                    // New record holder
                    quickestHattrickTime = hattrickTimeSpan;
                    recordHolders = [{ playerId, gameData: result }];
                } else if (hattrickTimeSpan === quickestHattrickTime) {
                    // Tied record - add to holders if not already present
                    const alreadyExists = recordHolders.some(
                        holder => holder.playerId === playerId && holder.gameData.date === result.date
                    );
                    if (!alreadyExists) {
                        recordHolders.push({ playerId, gameData: result });
                    }
                }
            }
        });
    });

    // Convert quickest time back to minutes:seconds format
    const minutes = Math.floor(quickestHattrickTime / 60);
    const seconds = quickestHattrickTime % 60;
    const timeDisplay = quickestHattrickTime === Infinity ? "No hat tricks" : `${minutes}:${seconds.toString().padStart(2, '0')}`;

    return {
        title: 'Quickest Hat Trick',
        description: 'Fastest time span from 1st goal to 3rd goal',
        value: timeDisplay,
        category: 'performance',
        holders: recordHolders.map(holder => ({
            playerName: getPlayerName(holder.playerId, players),
            playerId: holder.playerId,
            gameInfo: {
                opponent: holder.gameData.opponentTeam,
                date: formatDate(holder.gameData.date),
                result: getGameResult(holder.gameData)
            }
        }))
    };
};

// Season records
const getMostGoalsInASeason = (players: Player[]): SeasonRecord => {
    let mostGoals = 0;
    const playerSeasonGoals: Record<string, { playerId: string; season: string; goals: number }> = {};
    let recordHolders: SeasonRecordHolder[] = [];

    // Track goals for each player in each season
    players.forEach(player => {
        player.stats.forEach(stat => {
            const key = `${player.id}-${stat.season}`;
            if (!playerSeasonGoals[key]) {
                playerSeasonGoals[key] = {
                    playerId: player.id,
                    season: stat.season,
                    goals: 0
                };
            }
            playerSeasonGoals[key].goals += stat.goals;
        });
    });
    
    // Find the highest goal total across all player-season combinations
    Object.values(playerSeasonGoals).forEach(playerSeason => {
        if (playerSeason.goals > mostGoals) {
            mostGoals = playerSeason.goals;
            recordHolders = [{
                playerName: getPlayerName(playerSeason.playerId, players),
                playerId: playerSeason.playerId,
                season: playerSeason.season
            }];
        } else if (playerSeason.goals === mostGoals && playerSeason.goals > 0) {
            recordHolders.push({
                playerName: getPlayerName(playerSeason.playerId, players),
                playerId: playerSeason.playerId,
                season: playerSeason.season
            });
        }
    });

    return {
        title: 'Most Goals in a Season',
        description: 'Player with most goals in a single season',
        value: `${mostGoals} goal${mostGoals !== 1 ? 's' : ''}`,
        category: 'goals',
        holders: recordHolders
    };
}

const getMostAssistsInASeason = (players: Player[]): SeasonRecord => {
    let mostAssists = 0;
    const playerSeasonAssists: Record<string, { playerId: string; season: string; assists: number }> = {};
    let recordHolders: SeasonRecordHolder[] = [];

    // Track assists for each player in each season
    players.forEach(player => {
        player.stats.forEach(stat => {
            const key = `${player.id}-${stat.season}`;
            if (!playerSeasonAssists[key]) {
                playerSeasonAssists[key] = {
                    playerId: player.id,
                    season: stat.season,
                    assists: 0
                };
            }
            playerSeasonAssists[key].assists += stat.assists;
        });
    });
    
    // Find the highest assist total across all player-season combinations
    Object.values(playerSeasonAssists).forEach(playerSeason => {
        if (playerSeason.assists > mostAssists) {
            mostAssists = playerSeason.assists;
            recordHolders = [{
                playerName: getPlayerName(playerSeason.playerId, players),
                playerId: playerSeason.playerId,
                season: playerSeason.season
            }];
        } else if (playerSeason.assists === mostAssists && playerSeason.assists > 0) {
            recordHolders.push({
                playerName: getPlayerName(playerSeason.playerId, players),
                playerId: playerSeason.playerId,
                season: playerSeason.season
            });
        }
    });

    return {
        title: 'Most Assists in a Season',
        description: 'Player with most assists in a single season',
        value: `${mostAssists} assist${mostAssists !== 1 ? 's' : ''}`,
        category: 'assists',
        holders: recordHolders
    };
}

const getMostPointsInASeason = (players: Player[]): SeasonRecord => {
    let mostPoints = 0;
    const playerSeasonPoints: Record<string, { playerId: string; season: string; points: number }> = {};
    let recordHolders: SeasonRecordHolder[] = [];

    // Track points for each player in each season
    players.forEach(player => {
        player.stats.forEach(stat => {
            const key = `${player.id}-${stat.season}`;
            if (!playerSeasonPoints[key]) {
                playerSeasonPoints[key] = {
                    playerId: player.id,
                    season: stat.season,
                    points: 0
                };
            }
            playerSeasonPoints[key].points += stat.points;
        });
    });
    
    // Find the highest assist total across all player-season combinations
    Object.values(playerSeasonPoints).forEach(playerSeason => {
        if (playerSeason.points > mostPoints) {
            mostPoints = playerSeason.points;
            recordHolders = [{
                playerName: getPlayerName(playerSeason.playerId, players),
                playerId: playerSeason.playerId,
                season: playerSeason.season
            }];
        } else if (playerSeason.points === mostPoints && playerSeason.points > 0) {
            recordHolders.push({
                playerName: getPlayerName(playerSeason.playerId, players),
                playerId: playerSeason.playerId,
                season: playerSeason.season
            });
        }
    });

    return {
        title: 'Most Points in a Season',
        description: 'Player with most points in a single season',
        value: `${mostPoints} point${mostPoints !== 1 ? 's' : ''}`,
        category: 'points',
        holders: recordHolders
    };
}

const getMostHattricksInASeason = (results: Result[], players: Player[]): SeasonRecord => {
    let mostHattricks = 0;
    const playerSeasonHattricks: Record<string, { playerId: string; season: string; hattricks: number }> = {};
    let recordHolders: SeasonRecordHolder[] = [];

    // Group results by season
    const resultsBySeason: Record<string, Result[]> = {};
    results.forEach(result => {
        if (!resultsBySeason[result.seasonId]) {
            resultsBySeason[result.seasonId] = [];
        }
        resultsBySeason[result.seasonId].push(result);
    });

    // Analyze each season
    Object.entries(resultsBySeason).forEach(([season, seasonResults]) => {
        const playerHattricksThisSeason: Record<string, number> = {};

        // Check each game in the season for hat tricks
        seasonResults.forEach(result => {
            const allPeriods = [
                result.score.period.one,
                result.score.period.two,
                result.score.period.three
            ];

            // Count goals per player in this game
            const gameGoalsByPlayer: Record<string, number> = {};
            allPeriods.forEach(periodData => {
                periodData.goals.forEach(goal => {
                    const playerId = goal.playerId;
                    gameGoalsByPlayer[playerId] = (gameGoalsByPlayer[playerId] || 0) + 1;
                });
            });

            // Check for hat tricks (3+ goals) in this game
            Object.entries(gameGoalsByPlayer).forEach(([playerId, goalCount]) => {
                if (goalCount >= 3) {
                    playerHattricksThisSeason[playerId] = (playerHattricksThisSeason[playerId] || 0) + 1;
                }
            });
        });

        // Track season totals for each player
        Object.entries(playerHattricksThisSeason).forEach(([playerId, hattricks]) => {
            const key = `${playerId}-${season}`;
            playerSeasonHattricks[key] = {
                playerId,
                season,
                hattricks
            };
        });
    });

    // Find the highest hat trick total across all player-season combinations
    Object.values(playerSeasonHattricks).forEach(playerSeason => {
        if (playerSeason.hattricks > mostHattricks) {
            mostHattricks = playerSeason.hattricks;
            recordHolders = [{
                playerName: getPlayerName(playerSeason.playerId, players),
                playerId: playerSeason.playerId,
                season: playerSeason.season
            }];
        } else if (playerSeason.hattricks === mostHattricks && playerSeason.hattricks > 0) {
            recordHolders.push({
                playerName: getPlayerName(playerSeason.playerId, players),
                playerId: playerSeason.playerId,
                season: playerSeason.season
            });
        }
    });

    return {
        title: 'Most Hat Tricks in a Season',
        description: 'Player with most hat tricks in a single season',
        value: `${mostHattricks} hat trick${mostHattricks !== 1 ? 's' : ''}`,
        category: 'performance',
        holders: recordHolders
    };
};

const getMostPowerPlayGoalsInASeason = (results: Result[], players: Player[]): SeasonRecord => {
    let mostPPGoals = 0;
    const playerSeasonPPGoals: Record<string, { playerId: string; season: string; ppGoals: number }> = {};
    let recordHolders: SeasonRecordHolder[] = [];

    // Group results by season and calculate PP goals for each player
    const seasons = [...new Set(results.map(r => r.seasonId))];
    
    seasons.forEach(season => {
        players.forEach(player => {
            const ppGoals = getNumberOfPPGoalsForPlayer(player.id, results, season);
            if (ppGoals > 0) {
                const key = `${player.id}-${season}`;
                playerSeasonPPGoals[key] = {
                    playerId: player.id,
                    season,
                    ppGoals
                };
            }
        });
    });

    // Find the highest PP goal total across all player-season combinations
    Object.values(playerSeasonPPGoals).forEach(playerSeason => {
        if (playerSeason.ppGoals > mostPPGoals) {
            mostPPGoals = playerSeason.ppGoals;
            recordHolders = [{
                playerName: getPlayerName(playerSeason.playerId, players),
                playerId: playerSeason.playerId,
                season: playerSeason.season
            }];
        } else if (playerSeason.ppGoals === mostPPGoals && playerSeason.ppGoals > 0) {
            recordHolders.push({
                playerName: getPlayerName(playerSeason.playerId, players),
                playerId: playerSeason.playerId,
                season: playerSeason.season
            });
        }
    });

    return {
        title: 'Most Power Play Goals in a Season',
        description: 'Player with most PP goals in a single season',
        value: `${mostPPGoals} PP goal${mostPPGoals !== 1 ? 's' : ''}`,
        category: 'goals',
        holders: recordHolders
    };
};

const getMostShortHandedGoalsInASeason = (results: Result[], players: Player[]): SeasonRecord => {
    let mostSHGoals = 0;
    const playerSeasonSHGoals: Record<string, { playerId: string; season: string; shGoals: number }> = {};
    let recordHolders: SeasonRecordHolder[] = [];

    // Group results by season and calculate SH goals for each player
    const seasons = [...new Set(results.map(r => r.seasonId))];
    
    seasons.forEach(season => {
        players.forEach(player => {
            const shGoals = getNumberOfSHGoalsForPlayer(player.id, results, season);
            if (shGoals > 0) {
                const key = `${player.id}-${season}`;
                playerSeasonSHGoals[key] = {
                    playerId: player.id,
                    season,
                    shGoals
                };
            }
        });
    });

    // Find the highest SH goal total across all player-season combinations
    Object.values(playerSeasonSHGoals).forEach(playerSeason => {
        if (playerSeason.shGoals > mostSHGoals) {
            mostSHGoals = playerSeason.shGoals;
            recordHolders = [{
                playerName: getPlayerName(playerSeason.playerId, players),
                playerId: playerSeason.playerId,
                season: playerSeason.season
            }];
        } else if (playerSeason.shGoals === mostSHGoals && playerSeason.shGoals > 0) {
            recordHolders.push({
                playerName: getPlayerName(playerSeason.playerId, players),
                playerId: playerSeason.playerId,
                season: playerSeason.season
            });
        }
    });

    return {
        title: 'Most Short Handed Goals in a Season',
        description: 'Player with most SH goals in a single season',
        value: `${mostSHGoals} SH goal${mostSHGoals !== 1 ? 's' : ''}`,
        category: 'goals',
        holders: recordHolders
    };
};

const getMostGameWinningGoalsInASeason = (results: Result[], players: Player[]): SeasonRecord => {
    let mostGWGoals = 0;
    const playerSeasonGWGoals: Record<string, { playerId: string; season: string; gwGoals: number }> = {};
    let recordHolders: SeasonRecordHolder[] = [];

    // Group results by season and calculate GW goals for each player
    const seasons = [...new Set(results.map(r => r.seasonId))];
    
    seasons.forEach(season => {
        players.forEach(player => {
            const gwGoals = getNumberOfGWGoalsForPlayer(player.id, results, season);
            if (gwGoals > 0) {
                const key = `${player.id}-${season}`;
                playerSeasonGWGoals[key] = {
                    playerId: player.id,
                    season,
                    gwGoals
                };
            }
        });
    });

    // Find the highest GW goal total across all player-season combinations
    Object.values(playerSeasonGWGoals).forEach(playerSeason => {
        if (playerSeason.gwGoals > mostGWGoals) {
            mostGWGoals = playerSeason.gwGoals;
            recordHolders = [{
                playerName: getPlayerName(playerSeason.playerId, players),
                playerId: playerSeason.playerId,
                season: playerSeason.season
            }];
        } else if (playerSeason.gwGoals === mostGWGoals && playerSeason.gwGoals > 0) {
            recordHolders.push({
                playerName: getPlayerName(playerSeason.playerId, players),
                playerId: playerSeason.playerId,
                season: playerSeason.season
            });
        }
    });

    return {
        title: 'Most Game Winning Goals in a Season',
        description: 'Player with most GWG in a single season',
        value: `${mostGWGoals} GWG${mostGWGoals !== 1 ? 's' : ''}`,
        category: 'goals',
        holders: recordHolders
    };
};

// All-time records
const getMostPowerPlayGoalsAllTime = (results: Result[], players: Player[]): AllTimeRecord => {
    let mostPPGoals = 0;
    const playerTotalPPGoals: Record<string, number> = {};
    let recordHolders: AllTimeRecordHolder[] = [];

    // Calculate total PP goals for each player across all seasons
    players.forEach(player => {
        const totalPPGoals = getNumberOfPPGoalsForPlayer(player.id, results); // No season filter = all-time
        if (totalPPGoals > 0) {
            playerTotalPPGoals[player.id] = totalPPGoals;
        }
    });

    // Find the highest PP goal total
    Object.entries(playerTotalPPGoals).forEach(([playerId, ppGoals]) => {
        if (ppGoals > mostPPGoals) {
            mostPPGoals = ppGoals;
            recordHolders = [{
                playerName: getPlayerName(playerId, players),
                playerId
            }];
        } else if (ppGoals === mostPPGoals) {
            recordHolders.push({
                playerName: getPlayerName(playerId, players),
                playerId
            });
        }
    });

    return {
        title: 'Most Power Play Goals',
        description: 'Player with most PP goals all-time',
        value: `${mostPPGoals} PP goal${mostPPGoals !== 1 ? 's' : ''}`,
        category: 'goals',
        holders: recordHolders
    };
};

// All time
const getMostShortHandedGoalsAllTime = (results: Result[], players: Player[]): AllTimeRecord => {
    let mostSHGoals = 0;
    const playerTotalSHGoals: Record<string, number> = {};
    let recordHolders: AllTimeRecordHolder[] = [];

    // Calculate total SH goals for each player across all seasons
    players.forEach(player => {
        const totalSHGoals = getNumberOfSHGoalsForPlayer(player.id, results); // No season filter = all-time
        if (totalSHGoals > 0) {
            playerTotalSHGoals[player.id] = totalSHGoals;
        }
    });

    // Find the highest SH goal total
    Object.entries(playerTotalSHGoals).forEach(([playerId, shGoals]) => {
        if (shGoals > mostSHGoals) {
            mostSHGoals = shGoals;
            recordHolders = [{
                playerName: getPlayerName(playerId, players),
                playerId
            }];
        } else if (shGoals === mostSHGoals) {
            recordHolders.push({
                playerName: getPlayerName(playerId, players),
                playerId
            });
        }
    });

    return {
        title: 'Most Short Handed Goals',
        description: 'Player with most SH goals all-time',
        value: `${mostSHGoals} SH goal${mostSHGoals !== 1 ? 's' : ''}`,
        category: 'goals',
        holders: recordHolders
    };
};

const getMostGameWinningGoalsAllTime = (results: Result[], players: Player[]): AllTimeRecord => {
    let mostGWGoals = 0;
    const playerTotalGWGoals: Record<string, number> = {};
    let recordHolders: AllTimeRecordHolder[] = [];

    // Calculate total GW goals for each player across all seasons
    players.forEach(player => {
        const totalGWGoals = getNumberOfGWGoalsForPlayer(player.id, results); // No season filter = all-time
        if (totalGWGoals > 0) {
            playerTotalGWGoals[player.id] = totalGWGoals;
        }
    });

    // Find the highest GW goal total
    Object.entries(playerTotalGWGoals).forEach(([playerId, gwGoals]) => {
        if (gwGoals > mostGWGoals) {
            mostGWGoals = gwGoals;
            recordHolders = [{
                playerName: getPlayerName(playerId, players),
                playerId
            }];
        } else if (gwGoals === mostGWGoals) {
            recordHolders.push({
                playerName: getPlayerName(playerId, players),
                playerId
            });
        }
    });

    return {
        title: 'Most Game Winning Goals',
        description: 'Player with most GWG all-time',
        value: `${mostGWGoals} GWG${mostGWGoals !== 1 ? 's' : ''}`,
        category: 'goals',
        holders: recordHolders
    };
};

const getCareerGoalsLeader = (players: Player[]): AllTimeRecord => {
    let mostGoals = 0;
    const playerTotalGoals: Record<string, number> = {};
    let recordHolders: AllTimeRecordHolder[] = [];

    // Calculate total goals for each player across all seasons
    players.forEach(player => {
        const totalGoals = player.stats.reduce((sum, stat) => sum + stat.goals, 0);
        if (totalGoals > 0) {
            playerTotalGoals[player.id] = totalGoals;
        }
    });

    // Find the highest goal total
    Object.entries(playerTotalGoals).forEach(([playerId, goals]) => {
        if (goals > mostGoals) {
            mostGoals = goals;
            recordHolders = [{
                playerName: getPlayerName(playerId, players),
                playerId
            }];
        } else if (goals === mostGoals) {
            recordHolders.push({
                playerName: getPlayerName(playerId, players),
                playerId
            });
        }
    });

    return {
        title: 'Career Goals Leader',
        description: 'Player with most career goals',
        value: `${mostGoals} goal${mostGoals !== 1 ? 's' : ''}`,
        category: 'goals',
        holders: recordHolders
    };
};

const getCareerAssistsLeader = (players: Player[]): AllTimeRecord => {
    let mostAssists = 0;
    const playerTotalAssists: Record<string, number> = {};
    let recordHolders: AllTimeRecordHolder[] = [];

    // Calculate total assists for each player across all seasons
    players.forEach(player => {
        const totalAssists = player.stats.reduce((sum, stat) => sum + stat.assists, 0);
        if (totalAssists > 0) {
            playerTotalAssists[player.id] = totalAssists;
        }
    });

    // Find the highest assist total
    Object.entries(playerTotalAssists).forEach(([playerId, assists]) => {
        if (assists > mostAssists) {
            mostAssists = assists;
            recordHolders = [{
                playerName: getPlayerName(playerId, players),
                playerId
            }];
        } else if (assists === mostAssists) {
            recordHolders.push({
                playerName: getPlayerName(playerId, players),
                playerId
            });
        }
    });

    return {
        title: 'Career Assists Leader',
        description: 'Player with most career assists',
        value: `${mostAssists} assist${mostAssists !== 1 ? 's' : ''}`,
        category: 'assists',
        holders: recordHolders
    };
};

const getCareerPointsLeader = (players: Player[]): AllTimeRecord => {
    let mostPoints = 0;
    const playerTotalPoints: Record<string, number> = {};
    let recordHolders: AllTimeRecordHolder[] = [];

    // Calculate total points for each player across all seasons
    players.forEach(player => {
        const totalPoints = player.stats.reduce((sum, stat) => sum + stat.points, 0);
        if (totalPoints > 0) {
            playerTotalPoints[player.id] = totalPoints;
        }
    });

    // Find the highest point total
    Object.entries(playerTotalPoints).forEach(([playerId, points]) => {
        if (points > mostPoints) {
            mostPoints = points;
            recordHolders = [{
                playerName: getPlayerName(playerId, players),
                playerId
            }];
        } else if (points === mostPoints) {
            recordHolders.push({
                playerName: getPlayerName(playerId, players),
                playerId
            });
        }
    });

    return {
        title: 'Career Points Leader',
        description: 'Player with most career points',
        value: `${mostPoints} point${mostPoints !== 1 ? 's' : ''}`,
        category: 'points',
        holders: recordHolders
    };
};

const getCareerGamesPlayedLeader = (players: Player[]): AllTimeRecord => {
    let mostGames = 0;
    const playerTotalGames: Record<string, number> = {};
    let recordHolders: AllTimeRecordHolder[] = [];

    // Calculate total games for each player across all seasons
    players.forEach(player => {
        const totalGames = player.stats.reduce((sum, stat) => sum + stat.games, 0);
        if (totalGames > 0) {
            playerTotalGames[player.id] = totalGames;
        }
    });

    // Find the highest games played total
    Object.entries(playerTotalGames).forEach(([playerId, games]) => {
        if (games > mostGames) {
            mostGames = games;
            recordHolders = [{
                playerName: getPlayerName(playerId, players),
                playerId
            }];
        } else if (games === mostGames) {
            recordHolders.push({
                playerName: getPlayerName(playerId, players),
                playerId
            });
        }
    });

    return {
        title: 'Career Games Played Leader',
        description: 'Player with most career games played',
        value: `${mostGames} game${mostGames !== 1 ? 's' : ''}`,
        category: 'performance',
        holders: recordHolders
    };
};

// ── New: Game Records ─────────────────────────────────────────────────────────

const getMostPenaltyMinutesInAGame = (results: Result[], players: Player[]): TeamRecord => {
    let maxPIMs = 0;
    let recordHolders: Array<{ playerId: string; gameData: Result }> = [];

    results.forEach(result => {
        const allPeriods = [result.score.period.one, result.score.period.two, result.score.period.three];
        const gamePIMsByPlayer: Record<string, number> = {};

        allPeriods.forEach(periodData => {
            periodData.penalties.forEach(penalty => {
                const playerId = penalty.offender;
                gamePIMsByPlayer[playerId] = (gamePIMsByPlayer[playerId] || 0) + penalty.duration;
            });
        });

        Object.entries(gamePIMsByPlayer).forEach(([playerId, pims]) => {
            if (pims > maxPIMs) {
                maxPIMs = pims;
                recordHolders = [{ playerId, gameData: result }];
            } else if (pims === maxPIMs && pims > 0) {
                const alreadyExists = recordHolders.some(
                    h => h.playerId === playerId && h.gameData.date === result.date
                );
                if (!alreadyExists) recordHolders.push({ playerId, gameData: result });
            }
        });
    });

    return {
        title: 'Most Penalty Minutes in a Game',
        description: 'Most PIMs accumulated by one player in a single game',
        value: `${maxPIMs} min${maxPIMs !== 1 ? 's' : ''}`,
        category: 'performance',
        holders: recordHolders.map(h => ({
            playerName: getPlayerName(h.playerId, players),
            playerId: h.playerId,
            gameInfo: {
                opponent: h.gameData.opponentTeam,
                date: formatDate(h.gameData.date),
                result: getGameResult(h.gameData)
            }
        }))
    };
};

// ── New: Season Records ───────────────────────────────────────────────────────

const getMostShutoutsInASeason = (results: Result[], players: Player[]): SeasonRecord => {
    let mostShutouts = 0;
    const playerSeasonShutouts: Record<string, { playerId: string; season: string; shutouts: number }> = {};
    let recordHolders: SeasonRecordHolder[] = [];

    const resultsBySeason: Record<string, Result[]> = {};
    results.forEach(result => {
        if (!resultsBySeason[result.seasonId]) resultsBySeason[result.seasonId] = [];
        resultsBySeason[result.seasonId].push(result);
    });

    Object.entries(resultsBySeason).forEach(([season, seasonResults]) => {
        const shutoutsByGoalie: Record<string, number> = {};
        seasonResults.forEach(result => {
            const net = result.netminderPlayerId;
            if (net && net !== 'MISSING' && result.score.opponentScore === 0) {
                shutoutsByGoalie[net] = (shutoutsByGoalie[net] || 0) + 1;
            }
        });
        Object.entries(shutoutsByGoalie).forEach(([playerId, shutouts]) => {
            playerSeasonShutouts[`${playerId}-${season}`] = { playerId, season, shutouts };
        });
    });

    Object.values(playerSeasonShutouts).forEach(ps => {
        if (ps.shutouts > mostShutouts) {
            mostShutouts = ps.shutouts;
            recordHolders = [{ playerName: getPlayerName(ps.playerId, players), playerId: ps.playerId, season: ps.season }];
        } else if (ps.shutouts === mostShutouts && ps.shutouts > 0) {
            recordHolders.push({ playerName: getPlayerName(ps.playerId, players), playerId: ps.playerId, season: ps.season });
        }
    });

    return {
        title: 'Most Shutouts in a Season',
        description: 'Goalie with the most shutouts in a single season',
        value: `${mostShutouts} shutout${mostShutouts !== 1 ? 's' : ''}`,
        category: 'performance',
        holders: recordHolders
    };
};

const getMostPIMsInASeason = (players: Player[]): SeasonRecord => {
    let mostPIMs = 0;
    const playerSeasonPIMs: Record<string, { playerId: string; season: string; pims: number }> = {};
    let recordHolders: SeasonRecordHolder[] = [];

    players.forEach(player => {
        player.stats.forEach(stat => {
            const key = `${player.id}-${stat.season}`;
            if (!playerSeasonPIMs[key]) playerSeasonPIMs[key] = { playerId: player.id, season: stat.season, pims: 0 };
            playerSeasonPIMs[key].pims += stat.pims;
        });
    });

    Object.values(playerSeasonPIMs).forEach(ps => {
        if (ps.pims > mostPIMs) {
            mostPIMs = ps.pims;
            recordHolders = [{ playerName: getPlayerName(ps.playerId, players), playerId: ps.playerId, season: ps.season }];
        } else if (ps.pims === mostPIMs && ps.pims > 0) {
            recordHolders.push({ playerName: getPlayerName(ps.playerId, players), playerId: ps.playerId, season: ps.season });
        }
    });

    return {
        title: 'Most Penalty Minutes in a Season',
        description: 'Player with most PIMs in a single season',
        value: `${mostPIMs} min${mostPIMs !== 1 ? 's' : ''}`,
        category: 'performance',
        holders: recordHolders
    };
};

const getMostMOTMInASeason = (players: Player[]): SeasonRecord => {
    let mostMOTM = 0;
    const playerSeasonMOTM: Record<string, { playerId: string; season: string; motm: number }> = {};
    let recordHolders: SeasonRecordHolder[] = [];

    players.forEach(player => {
        player.stats.forEach(stat => {
            const val = stat.manOfTheMatch ?? 0;
            if (val === 0) return;
            const key = `${player.id}-${stat.season}`;
            if (!playerSeasonMOTM[key]) playerSeasonMOTM[key] = { playerId: player.id, season: stat.season, motm: 0 };
            playerSeasonMOTM[key].motm += val;
        });
    });

    Object.values(playerSeasonMOTM).forEach(ps => {
        if (ps.motm > mostMOTM) {
            mostMOTM = ps.motm;
            recordHolders = [{ playerName: getPlayerName(ps.playerId, players), playerId: ps.playerId, season: ps.season }];
        } else if (ps.motm === mostMOTM && ps.motm > 0) {
            recordHolders.push({ playerName: getPlayerName(ps.playerId, players), playerId: ps.playerId, season: ps.season });
        }
    });

    return {
        title: 'Most Man of the Match Awards in a Season',
        description: 'Player with most MOTM awards in a single season',
        value: `${mostMOTM} award${mostMOTM !== 1 ? 's' : ''}`,
        category: 'performance',
        holders: recordHolders
    };
};

const getMostWOTGInASeason = (players: Player[]): SeasonRecord => {
    let mostWOTG = 0;
    const playerSeasonWOTG: Record<string, { playerId: string; season: string; wotg: number }> = {};
    let recordHolders: SeasonRecordHolder[] = [];

    players.forEach(player => {
        player.stats.forEach(stat => {
            const val = stat.warriorOfTheGame ?? 0;
            if (val === 0) return;
            const key = `${player.id}-${stat.season}`;
            if (!playerSeasonWOTG[key]) playerSeasonWOTG[key] = { playerId: player.id, season: stat.season, wotg: 0 };
            playerSeasonWOTG[key].wotg += val;
        });
    });

    Object.values(playerSeasonWOTG).forEach(ps => {
        if (ps.wotg > mostWOTG) {
            mostWOTG = ps.wotg;
            recordHolders = [{ playerName: getPlayerName(ps.playerId, players), playerId: ps.playerId, season: ps.season }];
        } else if (ps.wotg === mostWOTG && ps.wotg > 0) {
            recordHolders.push({ playerName: getPlayerName(ps.playerId, players), playerId: ps.playerId, season: ps.season });
        }
    });

    return {
        title: 'Most Warrior of the Game Awards in a Season',
        description: 'Player with most WOTG awards in a single season',
        value: `${mostWOTG} award${mostWOTG !== 1 ? 's' : ''}`,
        category: 'performance',
        holders: recordHolders
    };
};

// ── New: All-Time Records ─────────────────────────────────────────────────────

const getMostShutoutsAllTime = (results: Result[], players: Player[]): AllTimeRecord => {
    let mostShutouts = 0;
    const goalieShutouts: Record<string, number> = {};
    let recordHolders: AllTimeRecordHolder[] = [];

    results.forEach(result => {
        const net = result.netminderPlayerId;
        if (net && net !== 'MISSING' && result.score.opponentScore === 0) {
            goalieShutouts[net] = (goalieShutouts[net] || 0) + 1;
        }
    });

    Object.entries(goalieShutouts).forEach(([playerId, shutouts]) => {
        if (shutouts > mostShutouts) {
            mostShutouts = shutouts;
            recordHolders = [{ playerName: getPlayerName(playerId, players), playerId }];
        } else if (shutouts === mostShutouts) {
            recordHolders.push({ playerName: getPlayerName(playerId, players), playerId });
        }
    });

    return {
        title: 'Most Career Shutouts',
        description: 'Goalie with the most shutouts all-time',
        value: `${mostShutouts} shutout${mostShutouts !== 1 ? 's' : ''}`,
        category: 'performance',
        holders: recordHolders
    };
};

const getMostCareerPenaltyMinutes = (players: Player[]): AllTimeRecord => {
    let mostPIMs = 0;
    const playerPIMs: Record<string, number> = {};
    let recordHolders: AllTimeRecordHolder[] = [];

    players.forEach(player => {
        const total = player.stats.reduce((s, stat) => s + (stat.pims || 0), 0);
        if (total > 0) playerPIMs[player.id] = total;
    });

    Object.entries(playerPIMs).forEach(([playerId, pims]) => {
        if (pims > mostPIMs) {
            mostPIMs = pims;
            recordHolders = [{ playerName: getPlayerName(playerId, players), playerId }];
        } else if (pims === mostPIMs) {
            recordHolders.push({ playerName: getPlayerName(playerId, players), playerId });
        }
    });

    return {
        title: 'Most Career Penalty Minutes',
        description: 'Player with most career PIMs all-time',
        value: `${mostPIMs} min${mostPIMs !== 1 ? 's' : ''}`,
        category: 'performance',
        holders: recordHolders
    };
};

const getMostCareerMOTM = (players: Player[]): AllTimeRecord => {
    let mostMOTM = 0;
    const playerMOTM: Record<string, number> = {};
    let recordHolders: AllTimeRecordHolder[] = [];

    players.forEach(player => {
        const total = player.stats.reduce((s, stat) => s + (stat.manOfTheMatch ?? 0), 0);
        if (total > 0) playerMOTM[player.id] = total;
    });

    Object.entries(playerMOTM).forEach(([playerId, count]) => {
        if (count > mostMOTM) {
            mostMOTM = count;
            recordHolders = [{ playerName: getPlayerName(playerId, players), playerId }];
        } else if (count === mostMOTM) {
            recordHolders.push({ playerName: getPlayerName(playerId, players), playerId });
        }
    });

    return {
        title: 'Most Career Man of the Match Awards',
        description: 'Player with most MOTM awards all-time',
        value: `${mostMOTM} award${mostMOTM !== 1 ? 's' : ''}`,
        category: 'performance',
        holders: recordHolders
    };
};

const getMostCareerWOTG = (players: Player[]): AllTimeRecord => {
    let mostWOTG = 0;
    const playerWOTG: Record<string, number> = {};
    let recordHolders: AllTimeRecordHolder[] = [];

    players.forEach(player => {
        const total = player.stats.reduce((s, stat) => s + (stat.warriorOfTheGame ?? 0), 0);
        if (total > 0) playerWOTG[player.id] = total;
    });

    Object.entries(playerWOTG).forEach(([playerId, count]) => {
        if (count > mostWOTG) {
            mostWOTG = count;
            recordHolders = [{ playerName: getPlayerName(playerId, players), playerId }];
        } else if (count === mostWOTG) {
            recordHolders.push({ playerName: getPlayerName(playerId, players), playerId });
        }
    });

    return {
        title: 'Most Career Warrior of the Game Awards',
        description: 'Player with most WOTG awards all-time',
        value: `${mostWOTG} award${mostWOTG !== 1 ? 's' : ''}`,
        category: 'performance',
        holders: recordHolders
    };
};

export {
    getMostGoals,
    getMostAssists,
    getMostPoints,
    getQuickestGoal,
    getQuickestHattrick,
    getMostPenaltyMinutesInAGame,
    getMostGoalsInASeason,
    getMostAssistsInASeason,
    getMostPointsInASeason,
    getMostHattricksInASeason,
    getMostPowerPlayGoalsInASeason,
    getMostShortHandedGoalsInASeason,
    getMostGameWinningGoalsInASeason,
    getMostShutoutsInASeason,
    getMostPIMsInASeason,
    getMostMOTMInASeason,
    getMostWOTGInASeason,
    getMostPowerPlayGoalsAllTime,
    getMostShortHandedGoalsAllTime,
    getMostGameWinningGoalsAllTime,
    getMostShutoutsAllTime,
    getCareerGoalsLeader,
    getCareerAssistsLeader,
    getCareerPointsLeader,
    getCareerGamesPlayedLeader,
    getMostCareerPenaltyMinutes,
    getMostCareerMOTM,
    getMostCareerWOTG
};
export type { TeamRecord, RecordHolder, GameInfo, SeasonRecord, SeasonRecordHolder, AllTimeRecord, AllTimeRecordHolder };