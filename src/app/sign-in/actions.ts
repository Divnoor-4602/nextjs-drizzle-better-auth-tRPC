"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { UserSchema } from "@/db/schema/user";

export function useSignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (data: Extract<UserSchema, { mode: "signIn" }>) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: responseData, error: responseError } =
        await authClient.signIn.email({
          email: data.email,
          password: data.password,
        });

      // Check if there's an error in the response
      if (responseError) {
        throw new Error(responseError.message);
      }

      // If successful, return the user data
      if (responseData) {
        return {
          success: true,
          message: "Sign in successful!",
          user: responseData.user,
          redirect: "/",
        };
      }

      throw new Error("Unexpected response format");
    } catch (error: any) {
      console.error("Sign in error:", error);

      // Better Auth throws errors with specific messages
      const errorMessage =
        error?.message || error?.body?.message || "Invalid email or password";

      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  return { signIn, isLoading, error };
}
