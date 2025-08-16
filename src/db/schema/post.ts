import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./user";
import { category } from "./category";

export const post = sqliteTable("post", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id), // foreign key referencing the user table
  title: text("title", { length: 255 }).notNull(),
  shortDescription: text("short_description").notNull(),
  content: text("content").notNull(),
  categoryId: text("category_id")
    .notNull()
    .references(() => category.id), // foreign key referencing the category table
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
