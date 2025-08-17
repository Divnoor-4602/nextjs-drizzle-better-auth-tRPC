import z from "zod";

export const getRelatedPostsByCategoryIdSchema = z.object({
  categoryId: z.string().min(1),
});

export type GetRelatedPostsByCategoryIdSchema = z.infer<
  typeof getRelatedPostsByCategoryIdSchema
>;
