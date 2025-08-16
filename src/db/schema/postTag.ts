import { primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { post } from "./post";
import { tag } from "./tag";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import z from "zod";

export const postTag = sqliteTable(
  "post_tag",
  {
    postId: text("post_id").references(() => post.id),
    tagId: text("tag_id").references(() => tag.id),
  },
  (table) => [primaryKey({ columns: [table.postId, table.tagId] })]
);

export const postTagRelations = relations(postTag, ({ one }) => ({
  post: one(post, {
    fields: [postTag.postId],
    references: [post.id],
  }),
  tag: one(tag, {
    fields: [postTag.tagId],
    references: [tag.id],
  }),
}));
// one to one relation between tag and post

const postTagSchema = createInsertSchema(postTag);
export type PostTagSchema = z.infer<typeof postTagSchema>;
