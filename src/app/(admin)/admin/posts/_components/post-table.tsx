"use client";

import { EllipsisVertical, Eye, Pencil } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { DeletePostButton } from "@/app/(admin)/admin/posts/_components/delete-post-button";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/pagination";
import { trpc } from "@/app/_trpc/client";

const columns = ["ID", "Title", "Description", "Category", "Actions"];

type Props = {
  searchTerm?: string;
  initialPage?: number;
  pageSize?: number;
};

export function PostsTable({ searchTerm = "", initialPage = 0, pageSize = 10 }: Props) {
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

  // Get categories for display
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = trpc.getCategories.useQuery();

  // Get total posts count for pagination
  const {
    data: totalCount,
    isLoading: countLoading,
    error: countError,
  } = trpc.getPostsCount.useQuery({ searchTerm });

  const isLoading = postsLoading || categoriesLoading || countLoading;
  const error = postsError || categoriesError || countError;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column}>{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: pageSize }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                </TableCell>
                <TableCell>
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-8"></div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column}>{column}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {postsData && postsData.length > 0 ? (
            postsData.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.id}</TableCell>
                <TableCell className="font-medium">{row.title}</TableCell>
                <TableCell className="font-medium">
                  {row.shortDescription}
                </TableCell>
                <TableCell className="font-medium">
                  {categoriesData?.find(
                    (category) => category.id === row.categoryId
                  )?.name || "Unknown"}
                </TableCell>
                <TableCell>
                  <Popover>
                    <PopoverTrigger>
                      <EllipsisVertical />
                    </PopoverTrigger>
                    <PopoverContent className="flex flex-col items-start w-fit">
                      <Button variant="ghost" asChild>
                        <Link href={`/admin/posts/${row.id}`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </Button>
                      <Button variant="ghost" asChild>
                        <Link href={`/posts/${row.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </Button>
                      <DeletePostButton id={row.id} />
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-8">
                <p className="text-gray-500">No posts found</p>
                {searchTerm && (
                  <p className="text-sm text-gray-400 mt-2">
                    Try searching with different keywords
                  </p>
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

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
