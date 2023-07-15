"use client";

import { IslandBody } from "@/components/IslandBody";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function Home() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        {/* <Counter /> */}
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
          Header
        </div>

        <IslandBody />

        <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-4 lg:text-left">
          Footer
        </div>
      </main>
    </QueryClientProvider>
  );
}
