import { count, desc, eq, ilike } from "drizzle-orm";
import { authRouter } from "./routers/auth";
import { publicProcedure, protectedProcedure, router } from "./trpc";
import { db, post, postTag, user } from "@/db";
import {
  deletePostByIdSchema,
  getCategoryPostsCountSchema,
  getPostByIdSchema,
  getPostsbyCategoryIdSchema,
  getPostsCountSchema,
  getPostsSchema,
  getRelatedPostsByCategoryIdSchema,
  getUserPostsCountSchema,
  getUserPostsSchema,
  getUserSchema,
} from "./schema.zod";
import { comment, commentSchema } from "@/db/schema/comment";
import { userSchema } from "@/db/schema/user";
import { TRPCError } from "@trpc/server";
import { email } from "zod";
import { postSchema } from "@/db/schema/post";

export const appRouter = router({
  auth: authRouter,
  // Public Procedures

  /***
   * Get all categories
   */
  getCategories: publicProcedure.query(async ({ ctx }) => {
    const categories = await ctx.db.query.category.findMany();
    return categories;
  }),
  /***
   * Get all tags
   */
  getTags: publicProcedure.query(async ({ ctx }) => {
    const tags = await ctx.db.query.tag.findMany();
    return tags;
  }),
  /***
   * Get posts related by their category id
   */
  getRelatedPostsByCategoryId: publicProcedure
    .input(getRelatedPostsByCategoryIdSchema)
    .query(async ({ ctx, input }) => {
      const { categoryId } = input;
      const posts = await ctx.db.query.post.findMany({
        limit: 4,
        where: eq(post.categoryId, categoryId),
        columns: {
          id: true,
          title: true,
          updatedAt: true,
          shortDescription: true,
        },
      });
      return posts;
    }),
  /***
   * get the post count
   */
  getPostsCount: publicProcedure
    .input(getPostsCountSchema)
    .query(async ({ ctx, input }) => {
      const posts = await ctx.db
        .select({ count: count() })
        .from(post)
        .where(ilike(post.title, `${input.searchTerm || ""}`))
        .then((res) => res[0].count);
      return posts;
    }),
  /***
   * get all the posts
   */
  getPosts: publicProcedure
    .input(getPostsSchema)
    .query(async ({ ctx, input }) => {
      const { page, limit, searchTerm } = input;
      const posts = await ctx.db.query.post.findMany({
        limit,
        offset: page * limit,
        where: ilike(post.title, `${searchTerm || ""}`),
        orderBy: desc(post.createdAt),
      });

      return posts;
    }),
  /***
   * Get user posts count
   */
  getUserPostsCount: publicProcedure
    .input(getUserPostsCountSchema)
    .query(async ({ ctx, input }) => {
      const { userId } = input;
      const userPostCount = await ctx.db
        .select({ count: count() })
        .from(post)
        .where(eq(post.userId, userId))
        .then((res) => res[0].count);

      return userPostCount;
    }),
  /***
   * get posts made by a user
   */
  getUserPosts: publicProcedure
    .input(getUserPostsSchema)
    .query(async ({ ctx, input }) => {
      const { limit, page, userId } = input;
      const userPosts = await ctx.db.query.post.findMany({
        limit,
        where: eq(post.userId, userId),
        offset: page * limit,
        orderBy: desc(post.createdAt),
      });
      return userPosts;
    }),
  /**
   * get a user
   */
  getUser: publicProcedure
    .input(getUserSchema)
    .query(async ({ ctx, input }) => {
      const { userId } = input;
      const getUser = await ctx.db.query.user.findFirst({
        columns: { id: true, name: true, email: true },
        where: eq(user.id, userId),
      });

      return getUser;
    }),
  /***
   * Get a post by id
   */
  getPostById: publicProcedure
    .input(getPostByIdSchema)
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const postById = await ctx.db.query.post.findFirst({
        where: eq(post.id, id),
        with: {
          category: true,
          user: {
            columns: { id: true, name: true },
          },
          comment: {
            with: {
              user: true,
            },
          },
        },
      });

      return postById;
    }),

  /***
   * get a post count for a particular category
   */
  getCategoryPostsCount: publicProcedure
    .input(getCategoryPostsCountSchema)
    .query(async ({ ctx, input }) => {
      const { categoryId } = input;
      const postCount = await ctx.db
        .select({ count: count() })
        .from(post)
        .where(eq(post.categoryId, categoryId))
        .then((res) => res[0].count);
      return postCount;
    }),

  /***
   * get posts by category id
   */
  getPostsByCategoryId: publicProcedure
    .input(getPostsbyCategoryIdSchema)
    .query(async ({ ctx, input }) => {
      const { limit, page, categoryId } = input;
      const posts = await ctx.db.query.post.findMany({
        columns: {
          id: true,
          title: true,
          shortDescription: true,
          updatedAt: true,
        },
        limit,
        offset: page * limit,
        orderBy: desc(post.createdAt),
        where: eq(post.categoryId, categoryId),
      });
      return posts;
    }),

  // Protected procedures
  /**
   * create a comment
   */
  createComment: protectedProcedure
    .input(commentSchema)
    .mutation(async ({ ctx, input }) => {
      // tRPC runs zod, so no need to zod.safeParse again
      await ctx.db.insert(comment).values(input);
      return { success: "comment created successfully!" };
    }),
  /***
   * update user
   */
  updateUser: protectedProcedure
    .input(userSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.mode !== "update") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Mode must be 'update' for user updates",
        });
      }

      const { name, age, id } = input;

      // Validate that the user is updating their own profile
      if (id !== ctx.session!.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only update your own profile",
        });
      }

      // Update profile fields with Drizzle (only name and age)
      const updateFields: { name?: string; age?: number | null } = {};
      if (name !== undefined) updateFields.name = name;
      if (age !== undefined) updateFields.age = age;

      if (Object.keys(updateFields).length > 0) {
        await ctx.db
          .update(user)
          .set(updateFields)
          .where(eq(user.id, ctx.session!.user.id));
      }

      // Return updated user
      const updatedUser = await ctx.db
        .select()
        .from(user)
        .where(eq(user.id, ctx.session!.user.id));

      return updatedUser[0];
    }),
  /***
   * delete post by id
   */
  deletePostById: protectedProcedure
    .input(deletePostByIdSchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      // remove the post related tags
      await ctx.db.delete(postTag).where(eq(postTag.postId, id));
      // remove the posts
      await ctx.db.delete(post).where(eq(post.id, id));
      return { success: "post was deleted!" };
    }),
  /**
   * create post
   */
  createPost: protectedProcedure
    .input(postSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.mode !== "create") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Mode must be 'update' for user updates",
        });
      }
      const newPost = await ctx.db
        .insert(post)
        .values(input)
        .returning({ postId: post.id });

      const { postId } = newPost[0];

      if (input.tagIds.length > 0) {
        await db.insert(postTag).values(
          input.tagIds.map((tagId) => ({
            postId,
            tagId,
          }))
        );
      }
    }),

  updatePost: protectedProcedure
    .input(postSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.mode !== "edit") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Mode must be 'edit' for post updates",
        });
      }

      const { id, tagIds, ...updateData } = input;

      // Verify user owns the post
      const existingPost = await ctx.db
        .select({ userId: post.userId })
        .from(post)
        .where(eq(post.id, id))
        .limit(1);

      if (!existingPost[0] || existingPost[0].userId !== ctx.session!.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only update your own posts",
        });
      }

      // Update post
      await ctx.db
        .update(post)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(post.id, id));

      // Only update tags if they differ
      const existingTags = await ctx.db
        .select({ tagId: postTag.tagId })
        .from(postTag)
        .where(eq(postTag.postId, id));

      const existingTagIds = existingTags
        .map((t) => t.tagId)
        .filter((id): id is string => id !== null);
      const newTagIds = tagIds;

      // Check if tags actually changed
      const tagsChanged =
        existingTagIds.length !== newTagIds.length ||
        existingTagIds.some((tagId) => !newTagIds.includes(tagId)) ||
        newTagIds.some((tagId) => !existingTagIds.includes(tagId));

      if (tagsChanged) {
        // Delete old tags and insert new ones
        await db.delete(postTag).where(eq(postTag.postId, id));

        if (newTagIds.length > 0) {
          await db.insert(postTag).values(
            newTagIds.map((tagId) => ({
              postId: id,
              tagId,
            }))
          );
        }
      }

      return { success: "Post updated successfully!" };
    }),
});

export type AppRouter = typeof appRouter;
