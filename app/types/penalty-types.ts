export type PenaltyType =
  | 'ABUSE' // Abuse of officials
  | 'AGGR' // Aggressor penalty
  | 'BDYCH' // Body checking
  | 'BOARD' // Boarding
  | 'CHARG' // Charging
  | 'CHECK' // Checking
  | 'CHEB' // Checking from behind
  | 'DELAY' // Delay of game
  | 'ELBOW' // Elbowing
  | 'EMBEL' // Embellishment
  | 'FIGHT' // Fighting
  | 'GOALINTRF' // Goaltender interference
  | 'HIST' // High sticking
  | 'HOLD' // Holding
  | 'HOST' // Holding the stick
  | 'HOOK' // Hooking
  | 'ILLEQUIP' // Illegal equipment
  | 'INTRF' // Interference
  | 'KICK' // Kicking
  | 'KNEE' // Kneeing
  | 'MATCH' // Match penalty (e.g. intent to injure)
  | 'MISC' // Misconduct
  | 'RETAL' // Retaliation
  | 'ROUGH' // Roughing
  | 'SLASH' // Slashing
  | 'SPEAR' // Spearing
  | 'THROWSTICK' // Throwing the stick
  | 'TOOM' // Too many men on the ice
  | 'TRIP' // Tripping
  | 'UNSP'; // Unsportsmanlike conduct

/**
 * Maps penalty type codes to their full descriptions
 */
export const penaltyTypeDescriptions: Record<PenaltyType, string> = {
  'ABUSE': 'Abuse of officials',
  'AGGR': 'Aggressor penalty',
  'BDYCH': 'Body checking',
  'BOARD': 'Boarding',
  'CHARG': 'Charging',
  'CHECK': 'Checking',
  'CHEB': 'Checking from behind',
  'DELAY': 'Delay of game',
  'ELBOW': 'Elbowing',
  'EMBEL': 'Embellishment',
  'FIGHT': 'Fighting',
  'GOALINTRF': 'Goaltender interference',
  'HIST': 'High sticking',
  'HOLD': 'Holding',
  'HOST': 'Holding the stick',
  'HOOK': 'Hooking',
  'ILLEQUIP': 'Illegal equipment',
  'INTRF': 'Interference',
  'KICK': 'Kicking',
  'KNEE': 'Kneeing',
  'MATCH': 'Match penalty (e.g. intent to injure)',
  'MISC': 'Misconduct',
  'RETAL': 'Retaliation',
  'ROUGH': 'Roughing',
  'SLASH': 'Slashing',
  'SPEAR': 'Spearing',
  'THROWSTICK': 'Throwing the stick',
  'TOOM': 'Too many men on the ice',
  'TRIP': 'Tripping',
  'UNSP': 'Unsportsmanlike conduct',
};

/**
 * Maps a penalty type code to its full description
 * @param penaltyType - The penalty type code
 * @returns The full description of the penalty
 */
export function getPenaltyDescription(penaltyType: PenaltyType): string {
  return penaltyTypeDescriptions[penaltyType];
}

/**
 * Checks if a string is a valid penalty type
 * @param value - The string to check
 * @returns True if the string is a valid penalty type
 */
export function isPenaltyType(value: string): value is PenaltyType {
  return value in penaltyTypeDescriptions;
}

/**
 * Gets all available penalty types
 * @returns Array of all penalty type codes
 */
export function getAllPenaltyTypes(): PenaltyType[] {
  return Object.keys(penaltyTypeDescriptions) as PenaltyType[];
}

/**
 * Gets all penalty descriptions
 * @returns Array of all penalty descriptions
 */
export function getAllPenaltyDescriptions(): string[] {
  return Object.values(penaltyTypeDescriptions);
}
