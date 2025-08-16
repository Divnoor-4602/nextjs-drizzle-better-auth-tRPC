"use server";

import { UserSchema } from "@/db/schema/user";

export async function signIn(data: Extract<UserSchema, { mode: "signIn" }>) {
  try {
    // TODO: Replace with better-auth sign in
    // await auth.signIn(data);
    console.log("Sign in data:", data);
    
    return {
      success: true,
      message: "Sign in successful",
    };
  } catch (error) {
    return {
      success: false,
      message: "Sign in failed",
    };
  }
}
