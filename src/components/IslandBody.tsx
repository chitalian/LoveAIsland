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
      <div className="">
        <div className="z-30 w-full max-w-5xl items-center justify-center text-center text-xl lg:flex text-betterBlack mb-10">
          Love Island
        </div>
        <textarea
          className="z-30 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex text-black bg-white"
          onChange={(e) => {
            sendMessage(e.target.value);
            setMessage(e.target.value);
          }}
          value={message}
        ></textarea>
      </div>
      <div className="">
        <div className="pt-5 min-h-[600px] bg-primary flex justify-center">
          <div id="hexagon-board-parent" className="min-w-[800px] min-h-[400px]  bg-primary  rounded-lg  overflow-hidden relative">
            <IslandMap god={true} subscribe={subscribe}/>
          </div>
        </div>
      </div>
    </div>
  );
}
