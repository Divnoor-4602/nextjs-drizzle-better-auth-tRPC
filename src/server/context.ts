import { auth } from "@/lib/auth";
import { db } from "@/db";

// Create context type
export type TContext = {
  session: Awaited<ReturnType<typeof auth.api.getSession>> | null;
  db: typeof db;
  auth: typeof auth;
};

// Create context function
export const createContext = async (req: Request): Promise<TContext> => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });
    return {
      session,
      db,
      auth,
    };
  } catch (error) {
    return {
      session: null,
      db,
      auth,
    };
  }
};

export type Context = Awaited<ReturnType<typeof createContext>>;
