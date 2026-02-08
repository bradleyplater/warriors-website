import type { Result } from "~/contexts/DataContext";

export function getGoalsForOneGame(game: Result, playerId: string) {
  const periodOneGoals = game.score.period.one.goals.filter(goal => goal.playerId === playerId).length;
  const periodTwoGoals = game.score.period.two.goals.filter(goal => goal.playerId === playerId).length;
  const periodThreeGoals = game.score.period.three.goals.filter(goal => goal.playerId === playerId).length;
  
  return periodOneGoals + periodTwoGoals + periodThreeGoals;
}

export function getAssistsForOneGame(game: Result, playerId: string) {
  const periodOneAssists = game.score.period.one.goals.filter(goal => goal.assists.includes(playerId)).length;
  const periodTwoAssists = game.score.period.two.goals.filter(goal => goal.assists.includes(playerId)).length;
  const periodThreeAssists = game.score.period.three.goals.filter(goal => goal.assists.includes(playerId)).length;

  return periodOneAssists + periodTwoAssists + periodThreeAssists;
}

export function getPimsForOneGame(game: Result, playerId: string) {
  const allPenalties = [
    ...game.score.period.one.penalties,
    ...game.score.period.two.penalties,
    ...game.score.period.three.penalties
  ];
  
  const playerPenalties = allPenalties.filter(penalty => penalty.offender === playerId);

  return playerPenalties.reduce((total, penalty) => total + penalty.duration, 0);
}

export interface PlayerMilestones {
  firstGoalGameDate: string | null;
  firstAssistGameDate: string | null;
  firstHattrickGameDate: string | null;
}

export function getPlayerMilestones(allGames: Result[], playerId: string): PlayerMilestones {
  // Sort games chronologically (ascending)
  const sortedGames = [...allGames].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const milestones: PlayerMilestones = {
    firstGoalGameDate: null,
    firstAssistGameDate: null,
    firstHattrickGameDate: null,
  };

  let foundFirstGoal = false;
  let foundFirstAssist = false;
  let foundFirstHattrick = false;

  for (const game of sortedGames) {
    if (foundFirstGoal && foundFirstAssist && foundFirstHattrick) break;

    const goals = getGoalsForOneGame(game, playerId);
    const assists = getAssistsForOneGame(game, playerId);

    if (goals > 0 && !foundFirstGoal) {
      milestones.firstGoalGameDate = game.date;
      foundFirstGoal = true;
    }

    if (assists > 0 && !foundFirstAssist) {
      milestones.firstAssistGameDate = game.date;
      foundFirstAssist = true;
    }

    if (goals >= 3 && !foundFirstHattrick) {
      milestones.firstHattrickGameDate = game.date;
      foundFirstHattrick = true;
    }
  }

  return milestones;
}
