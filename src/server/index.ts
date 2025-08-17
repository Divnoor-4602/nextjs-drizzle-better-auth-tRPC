import { eq } from "drizzle-orm";
import { authRouter } from "./routers/auth";
import { publicProcedure, protectedProcedure, router } from "./trpc";
import { post } from "@/db";
import { getRelatedPostsByCategoryIdSchema } from "./schema.zod";
import { getPostsCount } from "@/app/queries";

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
   * get the post cound
   */
  getPostsCount: publicProcedure.input().query(({}) => {}),
});

export type AppRouter = typeof appRouter;
