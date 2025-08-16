import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { post } from "./post";
import { user } from "./user";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const comment = sqliteTable("comment", {
  id: text("id")
    .primaryKey()
    .$default(() => crypto.randomUUID()),
  parentId: text("parent_id"), // foreign key referencing the comment table
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  postId: text("post_id")
    .notNull()
    .references(() => post.id), // foreign key referencing the post table
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(current_timestamp)`),
});

// relations are to make queries easier
export const commentRelations = relations(comment, ({ one }) => ({
  user: one(user, {
    fields: [comment.userId],
    references: [user.id],
  }), // one comment belongs to one user
  post: one(post, {
    fields: [comment.postId],
    references: [post.id],
  }), // one comment belongs to one post
}));

// zod schema
export const commentSchema = createInsertSchema(comment, {
  postId: (schema) => schema.min(1),
  content: (schema) => schema.min(1),
  userId: (schema) => schema.min(1),
}).pick({
  postId: true,
  content: true,
  parentId: true,
  userId: true,
  id: true,
});
export type CommentSchema = z.infer<typeof commentSchema>;
