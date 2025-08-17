"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { UserSchema } from "@/db/schema/user";

export function useSignUp() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signUp = async (data: Extract<UserSchema, { mode: "signUp" }>) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: responseData, error: responseError } =
        await authClient.signUp.email({
          name: data.name,
          email: data.email,
          password: data.password,
          ...(data.age && { age: data.age }), // Only include age if it exists
        });

      // Check if there's an error in the response
      if (responseError) {
        throw new Error(responseError.message);
      }

      // If successful, return the user data
      if (responseData) {
        return {
          success: true,
          message: "Sign up successful! You are now logged in.",
          user: responseData.user,
          redirect: "/",
        };
      }

      throw new Error("Unexpected response format");
    } catch (error: any) {
      console.error("Sign up error:", error);

      // Better Auth throws errors with specific messages
      const errorMessage =
        error?.message || error?.body?.message || "Sign up failed";

      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  return { signUp, isLoading, error };
}
