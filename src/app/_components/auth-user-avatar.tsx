import Link from "next/link";

import { Button } from "@/components/ui/button";

export async function AuthUserAvatar() {
  // TODO: Replace with better-auth session check
  // const session = await auth();
  const session = null;

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
      <Button asChild variant="ghost">
        <Link href="/sign-out">Sign Out</Link>
      </Button>
    </div>
  );
}
