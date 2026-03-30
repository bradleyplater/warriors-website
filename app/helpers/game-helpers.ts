import type { Result } from "~/contexts/DataContext";
import type { Player } from "~/contexts/DataContext";

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

export interface GameAwards {
  motmId: string | null;
  motmName: string | null;
  wotgId: string | null;
  wotgName: string | null;
}

export function getGameAwards(game: Result, players: Player[]): GameAwards {
  const motmId = game.manOfTheMatchPlayerId && game.manOfTheMatchPlayerId !== "MISSING"
    ? game.manOfTheMatchPlayerId
    : null;
  const wotgId = game.warriorOfTheGamePlayerId && game.warriorOfTheGamePlayerId !== "MISSING"
    ? game.warriorOfTheGamePlayerId
    : null;

  const motmPlayer = motmId ? players.find(pl => pl.id === motmId) : undefined;
  const wotgPlayer = wotgId ? players.find(pl => pl.id === wotgId) : undefined;

  return {
    motmId,
    motmName: motmPlayer ? motmPlayer.name : null,
    wotgId,
    wotgName: wotgPlayer ? wotgPlayer.name : null,
  };
}

export function getGameWinningGoalScorerId(game: Result): string | null {
  if (game.score.warriorsScore <= game.score.opponentScore) return null;

  const requiredGoalNumber = game.score.opponentScore + 1;
  if (requiredGoalNumber <= 0) return null;

  const goalsWithPeriod = [
    ...game.score.period.one.goals.map(goal => ({ ...goal, period: 1 })),
    ...game.score.period.two.goals.map(goal => ({ ...goal, period: 2 })),
    ...game.score.period.three.goals.map(goal => ({ ...goal, period: 3 })),
  ].sort((a, b) => {
    if (a.period !== b.period) return a.period - b.period;
    if (a.minute !== b.minute) return a.minute - b.minute;
    return a.second - b.second;
  });

  const gwgGoal = goalsWithPeriod[requiredGoalNumber - 1];
  return gwgGoal?.playerId ?? null;
}
