"use server";

import { UserSchema } from "@/db/schema/user";

export async function signUp(data: Extract<UserSchema, { mode: "signUp" }>) {
  try {
    // TODO: Replace with better-auth sign up
    // await auth.signUp(data);
    console.log("Sign up data:", data);

    return {
      success: true,
      message: "Sign up successful",
    };
  } catch (error) {
    return {
      success: false,
      message: "Sign up failed",
    };
  }
}
