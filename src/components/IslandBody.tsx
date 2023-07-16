"use client";

import { useWebsocket } from "@/hooks/useWebhooks";
import Image from "next/image";
import { useState } from "react";
import dynamic from 'next/dynamic';

const IslandMap:any = dynamic(() => import('../components/IslandMap'), {
  ssr: false,
});

export function IslandBody() {
  const { sendMessage, subscribe } = useWebsocket(
    "ws://localhost:8080"
  );
  const [message, setMessage] = useState("");
  return (
    <div className="">
      {/* response */}
      <textarea
        className="z-30 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex text-black bg-white"
        onChange={(e) => {
          sendMessage(e.target.value);
          setMessage(e.target.value);
        }}
        value={message}
      ></textarea>

      <div className="pt-10 min-h-[600px] bg-primary flex justify-center">
        <div id="hexagon-board-parent" className="min-w-[800px] min-h-[400px] max-w-[90vw] bg-primary  rounded-lg  overflow-hidden relative">
          <IslandMap god={true} subscribe={subscribe}/>
        </div>
      </div>
    </div>
  );
}
