import { InferInsertModel, relations } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { postTag } from "./postTag";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tag = sqliteTable("tag", {
  id: text("id")
    .primaryKey()
    .$default(() => crypto.randomUUID()),
  name: text("name", { length: 255 }).notNull().unique(),
});

export const tagRelations = relations(tag, ({ many }) => ({
  posts: many(postTag), // one tag can have multiple posts
}));

// zod schema
export const tagSchema = createInsertSchema(tag);
export type TagSchema = z.infer<typeof tagSchema>;
