import { initTRPC, TRPCError } from "@trpc/server";
import { Context } from "./context";
/**
 * Initialization of tRPC backend

 */
const t = initTRPC.context<Context>().create();
/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected middleware: throws UNAUTHORIZED if no user,
 * and injects a narrowed ctx.user for downstream procedures.
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  const user = ctx.session?.user;
  if (!user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      ...ctx,
      // Narrow the type so downstream resolvers get a guaranteed user
      user: user as NonNullable<Context["session"]>["user"],
    },
  });
});
