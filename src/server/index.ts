import { count, desc, eq, ilike } from "drizzle-orm";
import { authRouter } from "./routers/auth";
import { publicProcedure, protectedProcedure, router } from "./trpc";
import { post, user } from "@/db";
import {
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
});

export type AppRouter = typeof appRouter;
