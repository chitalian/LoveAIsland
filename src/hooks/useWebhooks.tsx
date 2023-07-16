"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AgentState, PayloadToClient } from "../../backend/backendTypes";

export const useWebsocket = (url: string | null) => {
  const callBacks: ((message: PayloadToClient) => void)[] = [];

  const webhook = useQuery({
    queryKey: ["webhook", url],
    queryFn: async () => {
      console.log("Creating new websocket");
      if (!url) {
        return Promise.resolve(null);
      }

      const socket = new WebSocket(url);

      socket.onopen = () => {
        console.log("WebSocket connection established");
      };

      socket.onmessage = (event) => {
        console.log(`Received message: ${event.data}`);
        callBacks.forEach((callBack) => {
          callBack(event.data);
        });
      };

      socket.onclose = () => {
        console.log("WebSocket connection closed");
      };
      console.log("Setting socket", socket);

      return {
        socket,
      };
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
  });

  const subscribe = (callBack: (message: PayloadToClient) => void) => {
    callBacks.push(callBack);
  };

  const sendMessage = (message: string) => {
    if (webhook.data?.socket) {
      webhook.data.socket.send(message);
    }
  };

  return { sendMessage, subscribe };
};
