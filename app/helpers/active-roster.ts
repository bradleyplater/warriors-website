/** A player as players.json describes them, enough to build a stats row. */
export type RosterPlayer = { id: string; name: string; number: number; position: string };

function positions(position: string): string[] {
  return position.split("/").map((part) => part.trim());
}

/** "Forward", "Defence / Goaltender" … — anything besides pure netminding. */
export function playsSkater(position: string): boolean {
  return positions(position).some((part) => part !== "Goaltender");
}

/** "Goaltender", "Goaltender / Defence" … */
export function playsGoal(position: string): boolean {
  return positions(position).includes("Goaltender");
}

/**
 * The rows, plus a zeroed row for every active player who has none yet — so
 * the current season's tables list the whole squad before anyone has played.
 */
export function withActivePlayers<T extends { playerId: string }>(
  rows: T[],
  activePlayers: RosterPlayer[],
  zeroRow: (player: RosterPlayer) => T
): T[] {
  const present = new Set(rows.map((row) => row.playerId));
  return [...rows, ...activePlayers.filter((player) => !present.has(player.id)).map(zeroRow)];
}
