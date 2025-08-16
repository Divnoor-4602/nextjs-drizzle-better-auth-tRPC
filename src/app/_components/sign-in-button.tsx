"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function SignInButton() {
  const router = useRouter();

  function handleClick() {
    router.push("/sign-in");
  }

  return (
    <Button onClick={handleClick} variant="ghost">
      Sign In
    </Button>
  );
}
