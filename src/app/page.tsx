"use client";

import { IslandBody } from "@/components/IslandBody";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function Home() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <main className="flex min-h-screen flex-col items-center content-center justify-between p-24 bg-primary">
        <h2 className="font-serif text-5xl text-betterBlack">💕🤖💕</h2>
        <h1 className="font-serif text-7xl text-betterBlack">Love AIsland</h1>
        <h2 className="font-serif italic text-3xl text-betterBlack">
          Would ChatGPT swipe right on <b className="text-rose-500">you</b>?
        </h2>
        <IslandBody />
      </main>
    </QueryClientProvider>
  );
}
