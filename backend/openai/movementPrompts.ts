import { CallOpenAIProps, OpenAIResponse } from ".";
import { AgentProfile } from "../backendTypes";

export interface Move {
  direction: "up" | "down" | "left" | "right";
}

export interface Interact {
  agentId: string;
}

export interface Action {
  type: "move" | "interact";
  payload: Move | Interact;
}

export function getMoveDirectionPrompt(
  boardDimensions: [number, number],
  agentPosition: [number, number],
  nearbyAgents: AgentProfile[]
): CallOpenAIProps {
  const [width, height] = boardDimensions;
  const [x, y] = agentPosition;
  const [minX, minY] = [0, 0];
  const [maxX, maxY] = [width - 1, height - 1];

  const directions = [];
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
You are standing at ${x}, ${y} on a ${width} by ${height} board.
You see ${
      nearbyAgents.length
    } other agents nearby. You can move in any direction or talk to any other . Where do you move?
Here are all the Agents near you and their name:
${nearbyAgents.map((a) => `${a.name}: ${a.id}`).join("\n")}
`,
    // TODO add a list of their previous actions
    user: `

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
          },
          required: ["agentId"],
        },
      },
    ],
  };
}

export function getAction(response: OpenAIResponse): Action {
  // TODO
  return {
    type: "move",
    payload: {
      direction: "up",
    },
  };
}
