import { InferSelectModel, relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { post } from "./post";
import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";

// Better Auth compatible user table with custom fields
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  // Custom fields for this application
  age: integer("age"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

// Better Auth required tables
export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

// user relations in db
export const userRelations = relations(user, ({ many }) => ({
  posts: many(post), // one user can have multiple posts
}));

// Schema for Better Auth compatibility
const baseSchema = createInsertSchema(user, {
  name: (schema) => schema.min(1),
  age: (schema) => schema.min(18).max(99).optional(),
  email: (schema) => schema.email(),
}).pick({
  name: true,
  email: true,
  age: true,
});

// Auth-specific schemas
export const userSchema = z.union([
  z.object({
    mode: z.literal("signUp"),
    email: baseSchema.shape.email,
    name: baseSchema.shape.name,
    password: z.string().min(8, "Password must be at least 8 characters"),
    age: baseSchema.shape.age,
  }),
  z.object({
    mode: z.literal("signIn"),
    email: baseSchema.shape.email,
    password: z.string().min(1, "Password is required"),
  }),
  z.object({
    mode: z.literal("update"),
    name: baseSchema.shape.name,
    age: baseSchema.shape.age,
    id: z.string().min(1),
  }),
]);

export type UserSchema = z.infer<typeof userSchema>;
export type SelectUserModel = InferSelectModel<typeof user>;
