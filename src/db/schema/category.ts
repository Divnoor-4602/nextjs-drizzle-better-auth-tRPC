import { relations, InferInsertModel } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { post } from "./post";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const category = sqliteTable("category", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const categoryRelations = relations(category, ({ many }) => ({
  posts: many(post), // one category can have multiple posts
}));

// zod schema
export const categorySchema = createInsertSchema(category);
export type CategorySchema = z.infer<typeof category>;
