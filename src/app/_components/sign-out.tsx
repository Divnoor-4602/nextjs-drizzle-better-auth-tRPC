"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function SignOut() {
  const router = useRouter();

  async function handleSignOut() {
    // TODO: Replace with better-auth sign out
    // await auth.signOut();
    router.push("/");
  }

  return (
    <Button onClick={handleSignOut} variant="ghost">
      Sign Out
    </Button>
  );
}
