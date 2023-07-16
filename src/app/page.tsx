"use client";

import { IslandBody } from "@/components/IslandBody";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";


export default function Home() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <main className="flex min-h-screen flex-col items-center content-center justify-between p-24 bg-primary">
        <IslandBody />
        <div className="mb-32 mt-32 justify-center text-center lg:mb-0 lg:grid-cols-4 bg-primary text-betterBlack">
          AIs need love @2023
        </div>
      </main>
    </QueryClientProvider>
  );
}
