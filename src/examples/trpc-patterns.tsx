"use client";

import { useState } from "react";
import { trpc } from "@/app/_trpc/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/utils";

/**
 * COMPREHENSIVE tRPC PATTERNS EXAMPLES
 * 
 * This file demonstrates various tRPC usage patterns with React Query
 * Use these patterns as reference for implementing tRPC in your components
 */

// ================================
// 1. BASIC QUERY PATTERNS
// ================================

export function BasicQueryExample() {
  // Simple query with loading and error states
  const {
    data: categories,
    isLoading,
    error,
    refetch,
  } = trpc.getCategories.useQuery();

  if (isLoading) return <div>Loading categories...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h3>Categories:</h3>
      <ul>
        {categories?.map((category) => (
          <li key={category.id}>{category.name}</li>
        ))}
      </ul>
      <Button onClick={() => refetch()}>Refresh</Button>
    </div>
  );
}

// ================================
// 2. QUERY WITH PARAMETERS
// ================================

export function ParameterizedQueryExample() {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // Query with dynamic parameters
  const {
    data: posts,
    isLoading,
    error,
    isFetching, // Shows when refetching with new params
  } = trpc.getPosts.useQuery({
    page,
    limit: 10,
    searchTerm,
  });

  return (
    <div>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search posts..."
      />
      
      {isFetching && <div>Updating...</div>}
      {isLoading && <div>Loading posts...</div>}
      {error && <div>Error: {error.message}</div>}
      
      {posts && (
        <div>
          {posts.map((post) => (
            <div key={post.id}>{post.title}</div>
          ))}
        </div>
      )}
      
      <Button onClick={() => setPage(p => p - 1)} disabled={page === 0}>
        Previous
      </Button>
      <Button onClick={() => setPage(p => p + 1)}>
        Next
      </Button>
    </div>
  );
}

// ================================
// 3. CONDITIONAL QUERIES
// ================================

export function ConditionalQueryExample() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Query only runs when selectedUserId is not null
  const {
    data: user,
    isLoading,
    error,
  } = trpc.getUser.useQuery(
    { userId: selectedUserId! },
    {
      enabled: !!selectedUserId, // Only run query if userId exists
    }
  );

  return (
    <div>
      <select onChange={(e) => setSelectedUserId(e.target.value || null)}>
        <option value="">Select a user...</option>
        <option value="user1">User 1</option>
        <option value="user2">User 2</option>
      </select>

      {selectedUserId && (
        <>
          {isLoading && <div>Loading user...</div>}
          {error && <div>Error: {error.message}</div>}
          {user && <div>User: {user.name}</div>}
        </>
      )}
    </div>
  );
}

// ================================
// 4. BASIC MUTATION PATTERNS
// ================================

export function BasicMutationExample() {
  const utils = trpc.useUtils();

  const updateUserMutation = trpc.updateUser.useMutation({
    onSuccess: (data) => {
      toast({ success: true, message: "User updated successfully!" });
      // Invalidate related queries
      utils.getUser.invalidate();
    },
    onError: (error) => {
      toast({ error: error.message });
    },
  });

  const handleUpdate = () => {
    updateUserMutation.mutate({
      mode: "update" as const,
      id: "user123",
      name: "New Name",
      age: 25,
    });
  };

  return (
    <div>
      <Button 
        onClick={handleUpdate}
        disabled={updateUserMutation.isPending}
      >
        {updateUserMutation.isPending ? "Updating..." : "Update User"}
      </Button>
      
      {updateUserMutation.error && (
        <div className="text-red-500">
          Error: {updateUserMutation.error.message}
        </div>
      )}
    </div>
  );
}

// ================================
// 5. OPTIMISTIC UPDATES
// ================================

export function OptimisticUpdateExample() {
  const utils = trpc.useUtils();

  const updateUserMutation = trpc.updateUser.useMutation({
    onMutate: async (newUser) => {
      // Cancel outgoing refetches
      await utils.getUser.cancel({ userId: newUser.id });

      // Snapshot previous value
      const previousUser = utils.getUser.getData({ userId: newUser.id });

      // Optimistically update
      utils.getUser.setData({ userId: newUser.id }, (old) => 
        old ? { ...old, ...newUser } : undefined
      );

      // Return context with snapshotted value
      return { previousUser };
    },
    onError: (err, newUser, context) => {
      // Rollback on error
      if (context?.previousUser) {
        utils.getUser.setData({ userId: newUser.id }, context.previousUser);
      }
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      utils.getUser.invalidate({ userId: variables.id });
    },
  });

  return (
    <Button onClick={() => updateUserMutation.mutate({
      mode: "update" as const,
      id: "user123",
      name: "Optimistic Name",
      age: 30,
    })}>
      Update with Optimistic UI
    </Button>
  );
}

// ================================
// 6. PARALLEL QUERIES
// ================================

export function ParallelQueriesExample() {
  // Multiple queries running in parallel
  const categoriesQuery = trpc.getCategories.useQuery();
  const tagsQuery = trpc.getTags.useQuery();
  const postsQuery = trpc.getPosts.useQuery({ page: 0, limit: 5 });

  const isLoading = categoriesQuery.isLoading || tagsQuery.isLoading || postsQuery.isLoading;
  const hasError = categoriesQuery.error || tagsQuery.error || postsQuery.error;

  if (isLoading) return <div>Loading all data...</div>;
  if (hasError) return <div>Error loading data</div>;

  return (
    <div>
      <h3>Categories: {categoriesQuery.data?.length}</h3>
      <h3>Tags: {tagsQuery.data?.length}</h3>
      <h3>Recent Posts: {postsQuery.data?.length}</h3>
    </div>
  );
}

// ================================
// 7. DEPENDENT QUERIES
// ================================

export function DependentQueriesExample() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // First query - get categories
  const categoriesQuery = trpc.getCategories.useQuery();

  // Second query - depends on first query result
  const categoryPostsQuery = trpc.getPostsByCategoryId.useQuery(
    {
      categoryId: selectedCategoryId!,
      page: 0,
      limit: 10,
    },
    {
      enabled: !!selectedCategoryId, // Only run if category is selected
    }
  );

  return (
    <div>
      <select onChange={(e) => setSelectedCategoryId(e.target.value || null)}>
        <option value="">Select category...</option>
        {categoriesQuery.data?.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      {selectedCategoryId && (
        <div>
          {categoryPostsQuery.isLoading && <div>Loading posts...</div>}
          {categoryPostsQuery.data?.map((post) => (
            <div key={post.id}>{post.title}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ================================
// 8. INFINITE QUERIES (if supported)
// ================================

export function InfiniteQueryExample() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = trpc.getPosts.useInfiniteQuery(
    { limit: 10 },
    {
      getNextPageParam: (lastPage, pages) => {
        // Return next page number or undefined if no more pages
        return lastPage.length === 10 ? pages.length : undefined;
      },
    }
  );

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {data?.pages.map((page, i) => (
        <div key={i}>
          {page.map((post) => (
            <div key={post.id}>{post.title}</div>
          ))}
        </div>
      ))}
      
      <Button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
      >
        {isFetchingNextPage ? 'Loading more...' : 'Load More'}
      </Button>
    </div>
  );
}

// ================================
// 9. FORM WITH MUTATION
// ================================

export function MutationFormExample() {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    categoryId: "",
  });

  const utils = trpc.useUtils();

  const createPostMutation = trpc.createPost.useMutation({
    onSuccess: () => {
      toast({ success: true, message: "Post created!" });
      // Invalidate and refetch
      utils.getPosts.invalidate();
      utils.getPostsCount.invalidate();
      // Reset form
      setFormData({ title: "", content: "", categoryId: "" });
    },
    onError: (error) => {
      toast({ error: error.message });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPostMutation.mutate({
      mode: "create" as const,
      ...formData,
      userId: "current-user-id", // Get from auth
      shortDescription: formData.content.slice(0, 100),
      tagIds: [], // Empty for now
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.title}
        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
        placeholder="Post title"
        required
      />
      <textarea
        value={formData.content}
        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
        placeholder="Post content"
        required
      />
      <Button 
        type="submit" 
        disabled={createPostMutation.isPending}
      >
        {createPostMutation.isPending ? "Creating..." : "Create Post"}
      </Button>
    </form>
  );
}

// ================================
// 10. ERROR HANDLING PATTERNS
// ================================

export function ErrorHandlingExample() {
  const [retryCount, setRetryCount] = useState(0);

  const postsQuery = trpc.getPosts.useQuery(
    { page: 0, limit: 10 },
    {
      retry: (failureCount, error) => {
        // Custom retry logic
        if (error.data?.code === 'UNAUTHORIZED') {
          return false; // Don't retry auth errors
        }
        return failureCount < 3; // Retry up to 3 times
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      onError: (error) => {
        console.error('Query failed:', error);
        setRetryCount(prev => prev + 1);
      },
    }
  );

  if (postsQuery.isLoading) return <div>Loading...</div>;

  if (postsQuery.error) {
    return (
      <div className="text-red-500">
        <p>Error: {postsQuery.error.message}</p>
        <p>Retry attempts: {retryCount}</p>
        <Button onClick={() => postsQuery.refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  return <div>Posts loaded successfully!</div>;
}
