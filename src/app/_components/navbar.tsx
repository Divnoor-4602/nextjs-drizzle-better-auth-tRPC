"use client";

import Link from "next/link";

import { Search } from "@/app/(public)/search/_components/search";
import { AuthUserAvatar } from "@/app/_components/auth-user-avatar";
import { Button } from "@/components/ui/button";
import { trpc } from "../_trpc/client";

export function Navbar() {
  const {
    data: categoriesData,
    isLoading,
    error,
  } = trpc.getCategories.useQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading categories</div>;

  return (
    <nav className="flex gap-5 py-5 justify-between items-center">
      <div>
        <Button variant="ghost" asChild>
          <Link href="/">Home</Link>
        </Button>
        {categoriesData?.map((category) => (
          <Button variant="ghost" asChild key={category.id}>
            <Link href={`/categories/${category.id}`}>{category.name}</Link>
          </Button>
        ))}
      </div>

      <Search />
      <AuthUserAvatar />
    </nav>
  );
}
