import { Table, sql } from "drizzle-orm";
import { db, DB } from ".";
import * as seeds from "../db/seeds";
import * as schema from "../db/schema";

async function resetTable(db: DB, table: Table) {
  await db.run(sql`DELETE FROM ${table}`);
}

async function main() {
  // Delete tables in reverse dependency order (child tables first, then parent tables)
  for (const table of [
    schema.comment, // Depends on post and user
    schema.postTag, // Depends on post and tag
    schema.post, // Depends on user and category
    schema.tag, // No dependencies
    schema.category, // No dependencies
    schema.user, // No dependencies
  ]) {
    await resetTable(db, table);
  }

  // Seed tables in dependency order (parent tables first, then child tables)
  await seeds.user(db);
  await seeds.category(db);
  await seeds.tag(db);
  await seeds.post(db);
  await seeds.postTag(db);
  await seeds.comment(db);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    console.log("Seeding done!");
    process.exit(1);
  });
