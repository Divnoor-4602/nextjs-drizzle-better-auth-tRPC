"use client";

import { useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/utils";

/**
 * OPTIMISTIC UPDATES & ADVANCED ERROR HANDLING
 * 
 * Examples of advanced tRPC patterns for better UX
 */

// ================================
// 1. OPTIMISTIC POST CREATION
// ================================

export function OptimisticPostCreation() {
  const [title, setTitle] = useState("");
  const utils = trpc.useUtils();

  const createPostMutation = trpc.createPost.useMutation({
    onMutate: async (newPost) => {
      // Cancel any outgoing refetches
      await utils.getPosts.cancel();

      // Snapshot the previous value
      const previousPosts = utils.getPosts.getData({ page: 0, limit: 10 });

      // Optimistically update to the new value
      const optimisticPost = {
        id: `temp-${Date.now()}`, // Temporary ID
        title: newPost.title,
        content: newPost.content,
        shortDescription: newPost.shortDescription,
        userId: newPost.userId,
        categoryId: newPost.categoryId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      utils.getPosts.setData(
        { page: 0, limit: 10 },
        (old) => old ? [optimisticPost, ...old] : [optimisticPost]
      );

      // Return a context object with the snapshotted value
      return { previousPosts };
    },
    onError: (err, newPost, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      utils.getPosts.setData(
        { page: 0, limit: 10 },
        context?.previousPosts
      );
      toast({ error: "Failed to create post. Please try again." });
    },
    onSuccess: (data) => {
      toast({ success: true, message: "Post created successfully!" });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      utils.getPosts.invalidate();
      utils.getPostsCount.invalidate();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createPostMutation.mutate({
      mode: "create" as const,
      title,
      content: `Content for ${title}`,
      shortDescription: `Description for ${title}`,
      userId: "current-user-id",
      categoryId: "default-category",
      tagIds: [],
    });

    setTitle(""); // Clear form immediately for better UX
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title"
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <Button 
        type="submit" 
        disabled={createPostMutation.isPending || !title.trim()}
      >
        {createPostMutation.isPending ? "Creating..." : "Create Post"}
      </Button>
    </form>
  );
}

// ================================
// 2. OPTIMISTIC LIKE/UNLIKE SYSTEM
// ================================

interface PostWithLikes {
  id: string;
  title: string;
  likes: number;
  isLiked: boolean;
}

export function OptimisticLikeSystem({ post }: { post: PostWithLikes }) {
  const utils = trpc.useUtils();

  // Hypothetical like mutation
  const likeMutation = trpc.likePost?.useMutation({
    onMutate: async ({ postId, isLiking }) => {
      // Cancel queries
      await utils.getPostById.cancel({ id: postId });

      // Get current data
      const previousPost = utils.getPostById.getData({ id: postId });

      // Optimistically update
      utils.getPostById.setData(
        { id: postId },
        (old) => old ? {
          ...old,
          likes: isLiking ? old.likes + 1 : Math.max(0, old.likes - 1),
          isLiked: isLiking,
        } : undefined
      );

      // Also update posts list if it contains this post
      utils.getPosts.setQueriesData(
        {},
        (oldData) => oldData?.map(p => 
          p.id === postId 
            ? {
                ...p,
                likes: isLiking ? p.likes + 1 : Math.max(0, p.likes - 1),
                isLiked: isLiking,
              }
            : p
        )
      );

      return { previousPost };
    },
    onError: (err, { postId }, context) => {
      // Rollback on error
      if (context?.previousPost) {
        utils.getPostById.setData({ id: postId }, context.previousPost);
      }
      toast({ error: "Failed to update like. Please try again." });
    },
    onSettled: (data, error, { postId }) => {
      // Refetch to ensure consistency
      utils.getPostById.invalidate({ id: postId });
    },
  });

  const handleLike = () => {
    likeMutation.mutate({
      postId: post.id,
      isLiking: !post.isLiked,
    });
  };

  return (
    <Button
      onClick={handleLike}
      disabled={likeMutation.isPending}
      variant={post.isLiked ? "default" : "outline"}
    >
      {post.isLiked ? "♥" : "♡"} {post.likes}
    </Button>
  );
}

// ================================
// 3. OPTIMISTIC DELETE WITH UNDO
// ================================

export function OptimisticDeleteWithUndo({ postId }: { postId: string }) {
  const [isDeleted, setIsDeleted] = useState(false);
  const [undoTimer, setUndoTimer] = useState<NodeJS.Timeout | null>(null);
  const utils = trpc.useUtils();

  const deletePostMutation = trpc.deletePostById.useMutation({
    onMutate: async ({ id }) => {
      // Cancel queries
      await utils.getPosts.cancel();
      await utils.getPostById.cancel({ id });

      // Get snapshots
      const previousPosts = utils.getPosts.getData({ page: 0, limit: 10 });
      const previousPost = utils.getPostById.getData({ id });

      // Optimistically remove from lists
      utils.getPosts.setQueriesData(
        {},
        (oldData) => oldData?.filter(p => p.id !== id)
      );

      return { previousPosts, previousPost };
    },
    onError: (err, { id }, context) => {
      // Rollback
      if (context?.previousPosts) {
        utils.getPosts.setData({ page: 0, limit: 10 }, context.previousPosts);
      }
      setIsDeleted(false);
      toast({ error: "Failed to delete post" });
    },
    onSuccess: () => {
      toast({ success: true, message: "Post deleted successfully" });
    },
    onSettled: () => {
      utils.getPosts.invalidate();
      utils.getPostsCount.invalidate();
    },
  });

  const handleDelete = () => {
    setIsDeleted(true);
    
    // Set a timer for actual deletion
    const timer = setTimeout(() => {
      deletePostMutation.mutate({ id: postId });
    }, 5000); // 5 second delay

    setUndoTimer(timer);

    toast({
      success: true,
      message: "Post will be deleted in 5 seconds",
      action: (
        <Button size="sm" onClick={handleUndo}>
          Undo
        </Button>
      ),
    });
  };

  const handleUndo = () => {
    if (undoTimer) {
      clearTimeout(undoTimer);
      setUndoTimer(null);
    }
    setIsDeleted(false);
    toast({ success: true, message: "Delete cancelled" });
  };

  if (isDeleted) {
    return (
      <div className="opacity-50 bg-red-50 p-4 rounded">
        <p>This post will be deleted...</p>
        <Button onClick={handleUndo} size="sm">
          Undo Delete
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={handleDelete}
      variant="destructive"
      disabled={deletePostMutation.isPending}
    >
      Delete Post
    </Button>
  );
}

// ================================
// 4. ADVANCED ERROR RECOVERY
// ================================

export function AdvancedErrorRecovery() {
  const [errorCount, setErrorCount] = useState(0);
  
  const postsQuery = trpc.getPosts.useQuery(
    { page: 0, limit: 10 },
    {
      retry: (failureCount, error) => {
        // Different retry strategies based on error type
        if (error.data?.code === 'UNAUTHORIZED') {
          // Redirect to login for auth errors
          window.location.href = '/sign-in';
          return false;
        }
        
        if (error.data?.code === 'FORBIDDEN') {
          // Don't retry permission errors
          return false;
        }
        
        if (error.data?.code === 'TOO_MANY_REQUESTS') {
          // Longer delay for rate limiting
          return failureCount < 2;
        }
        
        // Regular retry for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex, error) => {
        if (error.data?.code === 'TOO_MANY_REQUESTS') {
          // Exponential backoff for rate limiting
          return Math.min(1000 * 2 ** attemptIndex, 30000);
        }
        // Regular retry delay
        return Math.min(1000 * attemptIndex, 5000);
      },
      onError: (error) => {
        setErrorCount(prev => prev + 1);
        
        // Log different types of errors differently
        if (error.data?.code === 'INTERNAL_SERVER_ERROR') {
          console.error('Server error:', error);
          // Could send to error reporting service
        } else if (error.data?.code === 'BAD_REQUEST') {
          console.warn('Client error:', error);
        }
      },
      // Stale time - how long data stays fresh
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // Cache time - how long data stays in cache
      gcTime: 10 * 60 * 1000, // 10 minutes
      
      // Refetch on window focus
      refetchOnWindowFocus: true,
      
      // Refetch on reconnect
      refetchOnReconnect: true,
    }
  );

  if (postsQuery.isLoading) {
    return <div>Loading posts...</div>;
  }

  if (postsQuery.error) {
    const error = postsQuery.error;
    
    return (
      <div className="bg-red-50 border border-red-200 rounded p-4">
        <h3 className="text-red-800 font-semibold">Something went wrong</h3>
        
        {error.data?.code === 'UNAUTHORIZED' && (
          <p>Please sign in to view posts.</p>
        )}
        
        {error.data?.code === 'FORBIDDEN' && (
          <p>You don't have permission to view these posts.</p>
        )}
        
        {error.data?.code === 'TOO_MANY_REQUESTS' && (
          <p>Too many requests. Please wait a moment before trying again.</p>
        )}
        
        {!['UNAUTHORIZED', 'FORBIDDEN', 'TOO_MANY_REQUESTS'].includes(error.data?.code) && (
          <>
            <p>Failed to load posts. Error count: {errorCount}</p>
            <Button 
              onClick={() => postsQuery.refetch()}
              className="mt-2"
              size="sm"
            >
              Try Again
            </Button>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      <h3>Posts loaded successfully!</h3>
      <p>Count: {postsQuery.data?.length}</p>
    </div>
  );
}

// ================================
// 5. BACKGROUND UPDATES
// ================================

export function BackgroundUpdatesExample() {
  const utils = trpc.useUtils();

  const postsQuery = trpc.getPosts.useQuery(
    { page: 0, limit: 10 },
    {
      // Refetch in background when data becomes stale
      refetchInterval: 30000, // 30 seconds
      refetchIntervalInBackground: true,
      
      // Only refetch if page is visible
      refetchOnWindowFocus: true,
      
      // Refetch when coming back online
      refetchOnReconnect: true,
    }
  );

  // Manual background refresh
  const handleRefresh = () => {
    // This won't show loading state but will update data in background
    utils.getPosts.refetch({ page: 0, limit: 10 });
    toast({ success: true, message: "Refreshing posts..." });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3>Posts (Auto-refreshing)</h3>
        <Button onClick={handleRefresh} size="sm" variant="outline">
          Refresh Now
        </Button>
      </div>
      
      {postsQuery.isFetching && !postsQuery.isLoading && (
        <div className="text-sm text-blue-600 mb-2">
          Updating posts in background...
        </div>
      )}
      
      {postsQuery.data?.map(post => (
        <div key={post.id} className="border p-2 mb-2 rounded">
          {post.title}
        </div>
      ))}
    </div>
  );
}
