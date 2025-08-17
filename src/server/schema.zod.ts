import z from "zod";

export const getRelatedPostsByCategoryIdSchema = z.object({
  categoryId: z.string().min(1),
});

export const getPostsCountSchema = z.object({
  searchTerm: z.string(),
});

export const getPostsSchema = z.object({
  page: z.number().min(1),
  limit: z.number().min(1),
  searchTerm: z.string(),
});

export const getUserPostsCountSchema = z.object({
  userId: z.string().min(1),
});

export const getUserPostsSchema = z.object({
  limit: z.number().min(1),
  page: z.number().min(1),
  userId: z.string().min(1),
});

export const getUserSchema = z.object({
  userId: z.string().min(1),
});

export const getPostByIdSchema = z.object({
  id: z.string().min(1),
});

export const getCategoryPostsCountSchema = z.object({
  categoryId: z.string().min(1),
});

export const getPostsbyCategoryIdSchema = z.object({
  limit: z.number().min(1),
  page: z.number().min(1),
  categoryId: z.string().min(1),
});

export const deletePostByIdSchema = z.object({
  id: z.string().min(1),
});

export type GetRelatedPostsByCategoryIdSchema = z.infer<
  typeof getRelatedPostsByCategoryIdSchema
>;

export type GetPostsCountSchema = z.infer<typeof getPostsCountSchema>;

export type GetPostsSchema = z.infer<typeof getPostsSchema>;

export type GetUserPostsSchema = z.infer<typeof getUserPostsSchema>;

export type GetPostByIdSchema = z.infer<typeof getPostByIdSchema>;
