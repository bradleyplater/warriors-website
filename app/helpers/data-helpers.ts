import type { Season } from "~/components/season-filter/season-filter";
import type { Player, Result } from "~/contexts/DataContext";

export const getPlayer = (players: Player[], playerId: string) => {
  return players.find(player => player.id === playerId);
}

export const getNumberOfPPGoalsForPlayer = (playerId: string, results: Result[], seasonId?: Season) => {

    if (seasonId) {
        results = results.filter(result => result.seasonId === seasonId);
    }

    const playerPPGoals = results.reduce((total, result) => {
        const periodOneGoals = result.score.period.one.goals.filter(goal => goal.playerId === playerId && goal.type === 'PP');
        const periodTwoGoals = result.score.period.two.goals.filter(goal => goal.playerId === playerId && goal.type === 'PP');
        const periodThreeGoals = result.score.period.three.goals.filter(goal => goal.playerId === playerId && goal.type === 'PP');
        return total + periodOneGoals.length + periodTwoGoals.length + periodThreeGoals.length;
    }, 0);
    return playerPPGoals;
}

export const getNumberOfSHGoalsForPlayer = (playerId: string, results: Result[], seasonId?: Season) => {

    if (seasonId) {
        results = results.filter(result => result.seasonId === seasonId);
    }

    const playerSHGoals = results.reduce((total, result) => {
        const periodOneGoals = result.score.period.one.goals.filter(goal => goal.playerId === playerId && goal.type === 'SH');
        const periodTwoGoals = result.score.period.two.goals.filter(goal => goal.playerId === playerId && goal.type === 'SH');
        const periodThreeGoals = result.score.period.three.goals.filter(goal => goal.playerId === playerId && goal.type === 'SH');
        return total + periodOneGoals.length + periodTwoGoals.length + periodThreeGoals.length;
    }, 0);
    return playerSHGoals;
}

export const getNumberOfGWGoalsForPlayer = (playerId: string, results: Result[], seasonId?: Season) => {

    if (seasonId) {
        results = results.filter(result => result.seasonId === seasonId);
    }

    let gameWinningGoals = 0;

    // Only consider games that Warriors won
    const wonGames = results.filter(result => result.score.warriorsScore > result.score.opponentScore);

    for (const game of wonGames) {
        // Build chronological list of all goals in the game
        const allGoals: Array<{
            playerId: string;
            minute: number;
            second: number;
            type: string;
            period: number;
            isWarriors: boolean;
        }> = [];

        // Add period 1 goals
        game.score.period.one.goals.forEach(goal => {
            allGoals.push({ ...goal, period: 1, isWarriors: true });
        });
        game.score.period.one.opponentGoals?.forEach(goal => {
            allGoals.push({ ...goal, period: 1, isWarriors: false });
        });

        // Add period 2 goals
        game.score.period.two.goals.forEach(goal => {
            allGoals.push({ ...goal, period: 2, isWarriors: true });
        });
        game.score.period.two.opponentGoals?.forEach(goal => {
            allGoals.push({ ...goal, period: 2, isWarriors: false });
        });

        // Add period 3 goals
        game.score.period.three.goals.forEach(goal => {
            allGoals.push({ ...goal, period: 3, isWarriors: true });
        });
        game.score.period.three.opponentGoals?.forEach(goal => {
            allGoals.push({ ...goal, period: 3, isWarriors: false });
        });

        // Sort goals chronologically
        allGoals.sort((a, b) => {
            if (a.period !== b.period) return a.period - b.period;
            if (a.minute !== b.minute) return a.minute - b.minute;
            return a.second - b.second;
        });

        // Track score throughout the game
        let warriorsScore = 0;
        let opponentScore = 0;
        let gameWinningGoal: typeof allGoals[0] | null = null;

        for (const goal of allGoals) {
            if (goal.isWarriors) {
                warriorsScore++;
            } else {
                opponentScore++;
            }

            // Check if this Warriors goal puts them ahead for what becomes the final time
            if (goal.isWarriors && warriorsScore > opponentScore) {
                // This goal puts Warriors in the lead
                // Check if they maintain this lead for the rest of the game
                const remainingGoals = allGoals.slice(allGoals.indexOf(goal) + 1);
                let futureWarriorsScore = warriorsScore;
                let futureOpponentScore = opponentScore;
                let maintainsLead = true;

                for (const futureGoal of remainingGoals) {
                    if (futureGoal.isWarriors) {
                        futureWarriorsScore++;
                    } else {
                        futureOpponentScore++;
                    }

                    // If opponent ever ties or takes the lead, this wasn't the game winner
                    if (futureOpponentScore >= futureWarriorsScore) {
                        maintainsLead = false;
                        break;
                    }
                }

                // If Warriors maintain the lead from this goal onwards, it's the game winner
                if (maintainsLead) {
                    gameWinningGoal = goal;
                    break; // Found the game-winning goal, no need to continue
                }
            }
        }

        // Check if the game-winning goal was scored by our player
        if (gameWinningGoal && gameWinningGoal.playerId === playerId && gameWinningGoal.isWarriors) {
            gameWinningGoals++;
        }
    }

    return gameWinningGoals;
}