import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { post } from "./post";
import { user } from "./user";

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
