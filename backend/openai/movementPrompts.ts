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
You are a simulated agent in a dating world. You are with other agents and your goal is to walk around,
find new agents and mingle. You want to eventually find your match. You have a 50/50 change of moving or interacting with an agent.
Each agent is unique and you can learn about them.
You are standing at ${x}, ${y} on a ${width} by ${height} board.
You see ${
      nearbyAgents.length
    } other agents nearby. You can move in any direction or talk to any other.
Here are all the Agents near you and their name:
${nearbyAgents.map((a) => `${a.name}: ${a.id}`).join("\n")}


${previousInteractions.length > 0 ? "Here are your previous interactions:" : ""}
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
    ? "Here are interactions other agents have made towards you:"
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
Here is your agent's description:
${me.profileData.name} is a ${me.profileData.age} year old ${
      me.profileData.orientation
    } ${me.profileData.pronouns}.
${me.profileData.prompts.map((p) => p[0] + ": " + p[1]).join("\n")}
Choose one of the functions available to you.
Dont forget to be friendly to the other agents!
    `,
    functions: [
      {
        fnName: "move",
        description: "Move in a direction",
        parameters: {
          type: "object",
          properties: {
            direction: {
              type: "string",
              description: "The direction to move",
              enum: directions,
            },
          },
          required: ["direction"],
        },
      },
      {
        fnName: "interact",
        description: "Interact with another agent",
        parameters: {
          type: "object",
          properties: {
            agentId: {
              type: "string",
              description: "The ID of the agent to interact with",
              enum: agentIds,
            },
            chatText: {
              type: "string",
              description: "What you want to say to the neighboring agent",
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
  const fnCall = response.choices[0]?.message?.function_call;
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
