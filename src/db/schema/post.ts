import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./user";
import { category } from "./category";
import { InferSelectModel, relations, sql } from "drizzle-orm";
import { postTag } from "./postTag";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const post = sqliteTable("post", {
  id: text("id")
    .primaryKey()
    .$default(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id), // foreign key referencing the user table
  title: text("title", { length: 255 }).notNull(),
  shortDescription: text("short_description").notNull(),
  content: text("content").notNull(),
  categoryId: text("category_id")
    .notNull()
    .references(() => category.id), // foreign key referencing the category table
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(current_timestamp)`),
});

export const postRelations = relations(post, ({ one, many }) => ({
  user: one(user, {
    fields: [post.userId],
    references: [user.id],
  }),
  tags: many(postTag),
  category: one(category, {
    fields: [post.categoryId],
    references: [category.id],
  }),
}));

// zod schema
// the base schema using pick excludes any other post such as createdAt and updatedAt
const baseSchema = createInsertSchema(post, {
  title: (schema) => schema.min(1),
  shortDescription: (schema) => schema.min(1).max(255),
  userId: (schema) => schema.min(1),
  categoryId: (schema) => schema.min(1),
}).pick({
  title: true,
  shortDescription: true,
  userId: true,
  categoryId: true,
  content: true,
});

export const postSchema = z.union([
  z.object({
    mode: z.literal("create"),
    title: baseSchema.shape.title,
    shortDescription: baseSchema.shape.shortDescription,
    userId: baseSchema.shape.userId,
    categoryId: baseSchema.shape.categoryId,
    content: baseSchema.shape.content,
    tagIds: z.array(z.number()),
  }),
  z.object({
    mode: z.literal("edit"),
    id: z.string().min(1),
    title: baseSchema.shape.title,
    shortDescription: baseSchema.shape.shortDescription,
    userId: baseSchema.shape.userId,
    categoryId: baseSchema.shape.categoryId,
    content: baseSchema.shape.content,
    tagIds: z.array(z.number()),
  }),
]);

export type PostSchema = z.infer<typeof postSchema>;
export type SelectPostModel = InferSelectModel<typeof post>;
