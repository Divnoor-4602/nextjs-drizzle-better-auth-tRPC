// server/routers/auth.ts
import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const authRouter = router({
  status: publicProcedure.query(({ ctx }) => {
    const user = ctx.session?.user ?? null;
    return {
      authenticated: !!user,
      user, // whatever your custom session returns
    };
  }),
});
