import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

// Create libsql client
const client = createClient({
  url: "file:sqlite.db",
});

// Create Drizzle ORM instance
export const db = drizzle(client, { schema, logger: true });

// export the db type
export type DB = typeof db;

// Export all schemas
export * from "./schema";
