import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";

import { PostCards } from "@/app/(public)/_components/post-cards";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <main>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold py-5">Latest Posts</h1>
        <Button variant="ghost" asChild>
          <Link href="/posts">
            View All
            <ChevronRightIcon />
          </Link>
        </Button>
      </div>
      <PostCards initialPage={0} pageSize={4} />
    </main>
  );
}
