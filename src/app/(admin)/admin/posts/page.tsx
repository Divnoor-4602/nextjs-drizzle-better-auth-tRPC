import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PostsTable } from "./_components/post-table";

export default function AdminPostsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Posts</h2>
        <Button asChild>
          <Link href="/admin/posts/create">Create New Post</Link>
        </Button>
      </div>

      <PostsTable />
    </div>
  );
}
