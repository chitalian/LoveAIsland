"use client";

import { useWebsocket } from "@/hooks/useWebhooks";
import Image from "next/image";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const IslandMap: any = dynamic(() => import("../components/IslandMap"), {
  ssr: false,
});

export function IslandBody() {
  const { sendMessage, message } = useWebsocket("ws://localhost:8080");
  return (
    <div className="">
      <div className="pt-10 min-h-[600px] bg-gray-100 flex justify-center">
        <div
          id="hexagon-board-parent"
          className="min-w-[800px] min-h-[400px] max-w-[90vw] bg-white border border-gray-300 rounded-lg  overflow-hidden relative"
        >
          <IslandMap god={true} gameState={message} />
        </div>
      </div>
    </div>
  );
}
