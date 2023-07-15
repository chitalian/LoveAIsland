"use client";

import { useWebsocket } from "@/hooks/useWebhooks";
import Image from "next/image";
import { useState } from "react";

export function IslandBody() {
  const { response, sendMessage, subscribe } = useWebsocket(
    "ws://localhost:8080"
  );
  const [message, setMessage] = useState("");
  return (
    <div className="">
      {JSON.stringify(response)}
      <textarea
        className="z-30 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex text-black"
        onChange={(e) => {
          sendMessage(e.target.value);
          setMessage(e.target.value);
        }}
        value={message}
      ></textarea>
    </div>
  );
}
