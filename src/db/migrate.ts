import { createClient } from "@libsql/client";
import config from "../../drizzle.config";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

// Create libsql client
const client = createClient({
  url: "file:sqlite.db",
});

const db = drizzle(client);

async function main() {
  if (config.out) {
    await migrate(db, { migrationsFolder: config.out });
    console.log("Migration done!");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await client.close();
    console.log("Database connection closed.");
    process.exit(0);
  });
