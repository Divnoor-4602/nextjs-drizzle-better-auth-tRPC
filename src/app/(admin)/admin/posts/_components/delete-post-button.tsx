"use client";
import { Trash } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { toast } from "@/lib/utils";
import { trpc } from "@/app/_trpc/client";

type Props = { id: string };
export function DeletePostButton({ id }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const utils = trpc.useUtils();

  const deletePostMutation = trpc.deletePostById.useMutation({
    onSuccess: () => {
      toast({ success: true, message: "Post deleted successfully!" });
      // Invalidate posts queries to refetch updated data
      utils.getPosts.invalidate();
      utils.getPostsCount.invalidate();
      setShowConfirm(false);
    },
    onError: (error) => {
      toast({ error: error.message || "Failed to delete post" });
    },
  });

  const handleDelete = () => {
    deletePostMutation.mutate({ id });
  };

  if (showConfirm) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-red-600">Are you sure?</p>
        <div className="flex gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deletePostMutation.isPending}
          >
            {deletePostMutation.isPending ? "Deleting..." : "Yes, Delete"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfirm(false)}
            disabled={deletePostMutation.isPending}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button 
      variant="destructive" 
      onClick={() => setShowConfirm(true)}
      className="w-full justify-start"
    >
      <Trash className="mr-2 h-4 w-4" />
      Delete
    </Button>
  );
}
