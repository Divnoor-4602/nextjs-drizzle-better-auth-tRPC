import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { post } from "./post";
import { user } from "./user";
import { relations } from "drizzle-orm";

export const comment = sqliteTable("comment", {
  id: text("id").primaryKey(),
  parentId: text("parent_id"), // foreign key referencing the comment table
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  postId: text("post_id")
    .notNull()
    .references(() => post.id), // foreign key referencing the post table
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
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
