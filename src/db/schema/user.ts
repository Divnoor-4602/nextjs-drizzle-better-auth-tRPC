import { InferSelectModel, relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { post } from "./post";
import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";

export const user = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$default(() => crypto.randomUUID()),
  fullName: text("full_name").notNull(),
  age: integer("age").notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(current_timestamp)`),
});

// user relations in db
export const userRelations = relations(user, ({ many }) => ({
  posts: many(post), // one user can have multiple posts
}));

// schema
const baseSchema = createInsertSchema(user, {
  fullName: (schema) => schema.min(1),
  password: (schema) => schema.min(1),
  age: (schema) => schema.min(18).max(99),
  email: (schema) => schema.email(),
}).pick({
  fullName: true,
  password: true,
  email: true,
  age: true,
});

// Create user schema
export const userSchema = z.union([
  z.object({
    mode: z.literal("signUp"),
    email: baseSchema.shape.email,
    fullName: baseSchema.shape.fullName,
    password: baseSchema.shape.password,
    age: baseSchema.shape.age,
  }),
  z.object({
    mode: z.literal("signIn"),
    email: baseSchema.shape.email,
  }),
  z.object({
    mode: z.literal("update"),
    fullName: baseSchema.shape.fullName,
    age: baseSchema.shape.age,
    id: z.string().min(1),
  }),
]);

export type UserSchema = z.infer<typeof userSchema>;
export type SelectUserModel = InferSelectModel<typeof user>;
