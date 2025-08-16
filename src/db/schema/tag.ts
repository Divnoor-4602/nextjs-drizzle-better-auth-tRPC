import { relations } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { postTag } from "./postTag";

export const tag = sqliteTable("tag", {
  id: text("id").primaryKey(),
  name: text("name", { length: 255 }).notNull().unique(),
});

export const tagRelations = relations(tag, ({ many }) => ({
  posts: many(postTag), // one tag can have multiple posts
}));
