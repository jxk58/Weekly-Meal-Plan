/**
 * Drizzle schema. drizzle-kit reads this file directly, so use relative imports (no "@/" alias)
 * and keep it free of server-only code.
 */
import { pgEnum } from "drizzle-orm/pg-core";

import { MEAL_TYPES, STORAGE_LOCATIONS } from "../../lib/domain";

export const mealType = pgEnum("meal_type", MEAL_TYPES);
export const storageLocation = pgEnum("storage_location", STORAGE_LOCATIONS);
