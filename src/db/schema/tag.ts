import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const tag = sqliteTable("tag", {
  id: text("id").primaryKey(),
  name: text("name", { length: 255 }).notNull().unique(),
});
