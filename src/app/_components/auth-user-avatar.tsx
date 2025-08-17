"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import { authClient } from "@/lib/auth-client";

export function AuthUserAvatar() {
  const router = useRouter();

  // TODO: Replace with better-auth session check
  const {
    data: session,
    isPending, //loading state
    error, //error object
    refetch, //refetch the session
  } = authClient.useSession();

  console.log("Session state:", { session, isPending, error });

  // Add error handling
  if (error) {
    console.error("Session error:", error);
  }

  if (isPending) {
    return <div>Loading...</div>;
  }

  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/");
          },
        },
      });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost">
          <Link href="/sign-in">Sign In</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/sign-up">Sign Up</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="ghost">
        <Link href="/profile">Profile</Link>
      </Button>
      <Button onClick={handleSignOut} variant="ghost">
        Sign Out
      </Button>
    </div>
  );
}
