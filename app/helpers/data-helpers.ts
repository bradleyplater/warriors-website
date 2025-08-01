import type { Player } from "~/contexts/DataContext";

export const getPlayer = (players: Player[], playerId: string) => {
  return players.find(player => player.id === playerId);
}