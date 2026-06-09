export const NavDestinationIds = {
  NONE: 0,
  HUMMINGBIRD: 10,
  FINCH: 20,
  SPARROW: 30,
  RAVEN: 40,
  FALCON: 50,
  COMBAT_SIMULATOR: 60
} as const;

export type NavDestinationName = keyof typeof NavDestinationIds;
export type NavDestinationId = (typeof NavDestinationIds)[NavDestinationName];

const navDestinationNamesById = new Map<number, NavDestinationName>(
  Object.entries(NavDestinationIds).map(([name, id]) => [id, name as NavDestinationName])
);

/**
 * Maps known overworld destination ids to their current names.
 *
 * These ids come from the game and may break if the game changes overworld destination ids.
 */
export function navDestinationName(id: number): NavDestinationName | undefined {
  return navDestinationNamesById.get(id);
}

/**
 * Maps a known overworld destination name to its current id.
 *
 * These ids come from the game and may break if the game changes overworld destination ids.
 */
export function navDestinationId(name: NavDestinationName): NavDestinationId {
  return NavDestinationIds[name];
}
