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
