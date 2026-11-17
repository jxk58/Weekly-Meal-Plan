import "server-only";

import { z } from "zod";

/** The only place environment variables are read. Validated once, on first use. */
const envSchema = z.object({
  // Supabase pooled (transaction mode, port 6543) URL at runtime. Optional until models land.
  DATABASE_URL: z.url().optional(),
  // IANA zone used to decide what "today" is for the household.
  APP_TIME_ZONE: z
    .string()
    .default("UTC")
    .refine((zone) => {
      try {
        new Intl.DateTimeFormat("en-US", { timeZone: zone });
        return true;
      } catch {
        return false;
      }
    }, "APP_TIME_ZONE must be a valid IANA time zone"),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

export function getEnv(): Env {
  cached ??= envSchema.parse(process.env);
  return cached;
}
