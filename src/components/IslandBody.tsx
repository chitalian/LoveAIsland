"use client";

import { useWebsocket } from "@/hooks/useWebhooks";
import Image from "next/image";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AgentState, Interaction } from "../../backend/backendTypes";

const IslandMap: any = dynamic(() => import("../components/IslandMap"), {
  ssr: false,
});
function RenderInteractionCard({
  interaction,
  agentStates,
}: {
  interaction: Interaction;
  agentStates: {
    [key: string]: AgentState;
  };
}) {
  const agent = agentStates[interaction.agentId];
  if (interaction.action.action._typename === "Move") {
    return (
      <div className="flex flex-row">
        {agent.profileData.name} moved {interaction.action.action.direction}
      </div>
    );
  } else if (interaction.action.action._typename === "Interact") {
    const target = agentStates[interaction.action.action.destionationAgentId];
    if (!target) {
      return (
        <div className="flex flex-col">
          <div className="font-semibold border-b-2 mb-2">
            {agent.profileData.name} is talking to themselves...
          </div>
          <div>{interaction.action.action.message.text}</div>
        </div>
      );
    }
    return (
      <div className="flex flex-col">
        <div className="font-semibold border-b-2 mb-2">
          {agent.profileData.name} {"=>"}
          {target.profileData.name}
        </div>
        <div>{interaction.action.action.message.text}</div>
      </div>
    );
  } else {
    return (
      <div className="flex flex-row">
        {agent.profileData.name} did something?
      </div>
    );
  }
}

export function IslandBody() {
  const { sendMessage, message } = useWebsocket("ws://localhost:8080");
  return (
    <div className="flex flex-row my-3">
      <div className="min-h-[600px] bg-gray-100 flex justify-center">
        <div
          id="hexagon-board-parent"
          className="min-w-[800px] min-h-[400px] max-w-[90vw] bg-white border border-gray-300 rounded-lg  overflow-hidden relative aspect-square"
        >
          <IslandMap god={true} gameState={message} />
        </div>
      </div>
      <div className="text-black flex flex-col">
        <div className="flex flex-col overflow-auto max-h-[60vh]">
          {message &&
            message.interactionHistory.map((interaction, interactionNum) => {
              return (
                <div
                  className="flex flex-row p-5 border m-2"
                  key={interactionNum}
                >
                  <RenderInteractionCard
                    interaction={interaction}
                    agentStates={message.agentStates}
                  />
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
