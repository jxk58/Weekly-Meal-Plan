import { defineConfig } from "drizzle-kit";

// drizzle-kit doesn't load Next's env files; read .env.local if it exists.
try {
  process.loadEnvFile(".env.local");
} catch {
  // No local env file (e.g. CI); rely on the real environment.
}

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  casing: "snake_case",
  strict: true,
  verbose: true,
  dbCredentials: {
    // Migrations use the direct (non-pooled) connection when provided.
    url: process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL || "",
  },
});
