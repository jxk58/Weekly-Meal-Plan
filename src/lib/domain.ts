/** Restricted value sets from the PRD (§4.1, §4.2). Shared by the DB schema, validation and UI. */

export const MEAL_TYPES = ["breakfast", "lunch", "dinner"] as const;
export type MealType = (typeof MEAL_TYPES)[number];

export const STORAGE_LOCATIONS = ["fridge", "freezer", "pantry", "counter"] as const;
export type StorageLocation = (typeof STORAGE_LOCATIONS)[number];

export function labelFor(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
