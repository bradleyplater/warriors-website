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
        // Get all Warriors goals in chronological order
        const allWarriorsGoals: Array<{
            playerId: string;
            minute: number;
            second: number;
            type: string;
            period: number;
        }> = [];

        // Add period 1 goals
        game.score.period.one.goals.forEach(goal => {
            allWarriorsGoals.push({ ...goal, period: 1 });
        });

        // Add period 2 goals
        game.score.period.two.goals.forEach(goal => {
            allWarriorsGoals.push({ ...goal, period: 2 });
        });

        // Add period 3 goals
        game.score.period.three.goals.forEach(goal => {
            allWarriorsGoals.push({ ...goal, period: 3 });
        });

        // Sort goals chronologically
        allWarriorsGoals.sort((a, b) => {
            if (a.period !== b.period) return a.period - b.period;
            if (a.minute !== b.minute) return a.minute - b.minute;
            return a.second - b.second;
        });

        // The GWG is the first goal that puts Warriors above opponent's final score
        const opponentFinalScore = game.score.opponentScore;
        const gwgIndex = opponentFinalScore; // If opponent scored 3, the 4th Warriors goal (index 3) is the GWG
        
        // Check if the GWG exists and was scored by our player
        if (allWarriorsGoals[gwgIndex] && allWarriorsGoals[gwgIndex].playerId === playerId) {
            gameWinningGoals++;
        }
    }

    return gameWinningGoals;
}