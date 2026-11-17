import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getEnv } from "@/server/env";

import * as schema from "./schema";

function createDb() {
  const url = getEnv().DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  // Serverless: one connection per function instance; Supabase's pooler does the pooling.
  // postgres.js doesn't use prepared statements by default, which the transaction pooler requires.
  const client = postgres(url, { max: 1 });
  return drizzle(client, { schema, casing: "snake_case" });
}

let db: ReturnType<typeof createDb> | undefined;

/** Lazily create the client so builds and pages that don't touch the DB never need DATABASE_URL. */
export function getDb() {
  db ??= createDb();
  return db;
}
