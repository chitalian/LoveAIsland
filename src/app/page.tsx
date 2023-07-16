"use client";

import { IslandBody } from "@/components/IslandBody";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";


export default function Home() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-primary">
        {/* <Counter /> */}
        <div className="z-10 w-full max-w-5xl items-center justify-center text-center text-xl lg:flex text-betterBlack mb-10">
          Love Island
        </div>

        <IslandBody />

        <div className="mb-32 mt-32 justify-center text-center lg:mb-0 lg:grid-cols-4 bg-primary text-betterBlack">
          AIs need love @2023
        </div>
      </main>
    </QueryClientProvider>
  );
}
