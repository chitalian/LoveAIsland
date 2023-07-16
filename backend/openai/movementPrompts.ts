// @ts-ignore
import { CallOpenAIProps, OpenAIResponse } from "./index.ts";
// @ts-ignore
import {
  Action,
  AgentProfile,
  AgentState,
  Interaction,
} from "../backendTypes.ts";

export function getMoveDirectionPrompt(
  boardDimensions: [number, number],
  me: AgentState,
  nearbyAgents: AgentProfile[],
  previousInteractions: Interaction[],
  interactionsTowardsMe: Interaction[]
): CallOpenAIProps {
  const agentPosition = me.position;
  const [width, height] = boardDimensions;
  const [x, y] = agentPosition;
  const [minX, minY] = [0, 0];
  const [maxX, maxY] = [width - 1, height - 1];

  const directions: string[] = [];
  if (x > minX) {
    directions.push("left");
  }
  if (x < maxX) {
    directions.push("right");
  }
  if (y > minY) {
    directions.push("up");
  }
  if (y < maxY) {
    directions.push("down");
  }

  const agentIds = nearbyAgents.map((a) => a.id);

  return {
    system: `
You are now living for a few days on an island full of singles looking to meet a partner. Your goal is to walk around,
meet the other island residents, and mingle. You want to eventually find your match. Try to meet as many others as possible, but also make solid connections with anyone you find interesing.
Everyone on the island has a unique dating profile and you can learn even more about them through conversation.
You are standing at coordinates (${x}, ${y}) on a ${width} by ${height} island.
You see ${
      nearbyAgents.length
    } other people nearby. You can move in any direction or talk with any of the nearby people.
Here are the ids and names of all the people near you:
${nearbyAgents.map((a) => `${a.name}: ${a.id}`).join("\n")}


${
  previousInteractions.length > 0
    ? "Here are your previous interactions with others on the island:"
    : ""
}
${previousInteractions
  .map((i) => {
    if (i.action.action._typename === "Interact") {
      return `You interacted with ${i.action.agentId} and said ${i.action.action.message.text}`;
    } else {
      return `You moved ${i.action.action.direction}`;
    }
  })
  .join("\n")}

${
  interactionsTowardsMe.length > 0
    ? "Here are interactions others on the island have made towards you:"
    : ""
}
${interactionsTowardsMe
  .map((i) => {
    if (i.action.action._typename === "Interact") {
      return `${i.action.agentId} interacted with you and said ${i.action.action.message.text}`;
    }
  })
  .join("\n")}

`,
    // TODO add a list of their previous actions
    user: `
As a reminder, here is your dating profile:
${me.profileData.name} is a ${me.profileData.age} year old ${
      me.profileData.orientation
    } ${me.profileData.pronouns}.
${me.profileData.prompts.map((p) => p[0] + ": " + p[1]).join("\n")}
Choose one of the functions available to you.
    `,
    functions: [
      {
        fnName: "move",
        description:
          "Keep exploring the island to find more interesting people to talk to.",
        parameters: {
          type: "object",
          properties: {
            direction: {
              type: "string",
              description: "The direction to travel",
              enum: directions,
            },
          },
          required: ["direction"],
        },
      },
      {
        fnName: "interact",
        description:
          "Strike up a conversation with a nearby person you'd like to learn more about.",
        parameters: {
          type: "object",
          properties: {
            agentId: {
              type: "string",
              description: "The ID of the person to chat with",
              enum: agentIds,
            },
            chatText: {
              type: "string",
              description:
                "What you'd like to say to the other person. For best results, draw from your previous interactions and try to discuss common interests according to your respective dating profiles.",
              enum: agentIds,
            },
          },
          required: ["agentId", "chatText"],
        },
      },
    ],
  };
}

export function getAction(response: OpenAIResponse):
  | Action
  | {
      error: string;
    } {
  const fnCall = response?.choices?.[0]?.message?.function_call;
  if (fnCall?.name === "move") {
    return {
      _typename: "Move",
      direction: fnCall.arguments.direction,
    };
  } else if (fnCall?.name === "interact") {
    return {
      _typename: "Interact",
      destionationAgentId: fnCall.arguments.agentId,
      message: {
        text: fnCall.arguments.chatText,
      },
    };
  } else {
    return {
      error: "Unknown function call" + JSON.stringify(fnCall),
    };
  }
}
