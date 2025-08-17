import type { Metadata } from "next";
import "@/app/globals.css";

import { Inter } from "next/font/google";

import { Navbar } from "@/app/_components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { TRPCProvider } from "./_trpc/Provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My blog",
  description: "Modern web development",
};

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("container max-w-7xl pb-5", inter.className)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCProvider>
            <Navbar />
            {children}
          </TRPCProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
