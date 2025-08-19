"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pagination } from "@/components/pagination";
import { trpc } from "@/app/_trpc/client";

type Props = {
  searchTerm?: string;
  initialPage?: number;
  pageSize?: number;
};

export function PostCards({
  searchTerm = "",
  initialPage = 0,
  pageSize = 6,
}: Props) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Get posts with pagination
  const {
    data: postsData,
    isLoading: postsLoading,
    error: postsError,
  } = trpc.getPosts.useQuery({
    page: currentPage,
    limit: pageSize,
    searchTerm,
  });

  // Get total posts count for pagination
  const {
    data: totalCount,
    isLoading: countLoading,
    error: countError,
  } = trpc.getPostsCount.useQuery({ searchTerm });

  const isLoading = postsLoading || countLoading;
  const error = postsError || countError;

  if (isLoading) {
    return (
      <div className="flex gap-3 flex-wrap">
        {Array.from({ length: pageSize }).map((_, i) => (
          <Card className="w-72 h-72" key={i}>
            <div className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
              <CardFooter>
                <div className="h-9 bg-gray-200 rounded w-20"></div>
              </CardFooter>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading posts: {error.message}</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    );
  }

  const totalPages = totalCount ? Math.ceil(totalCount / pageSize) : 0;

  return (
    <div className="space-y-6">
      <div className="flex gap-3 flex-wrap">
        {postsData && postsData.length > 0 ? (
          postsData.map((post) => (
            <Card className="w-72 h-72" key={post.id}>
              <div>
                <CardHeader>
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                  <CardDescription>
                    {new Date(post.updatedAt).toDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3">{post.shortDescription}</p>
                </CardContent>
              </div>
              <CardFooter>
                <Button variant="secondary" asChild>
                  <Link href={`/posts/${post.id}`}>Read more</Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 w-full">
            <p className="text-gray-500">No posts found</p>
            {searchTerm && (
              <p className="text-sm text-gray-400 mt-2">
                Try searching with different keywords
              </p>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}

// done project -> drizzle, better-auth, tRPC
