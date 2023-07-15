// @ts-ignore
import { CallOpenAIProps, OpenAIResponse } from "./index.ts";
// @ts-ignore
import { Action, AgentProfile } from "../backendTypes.ts";

export function getMoveDirectionPrompt(
  boardDimensions: [number, number],
  agentPosition: [number, number],
  nearbyAgents: AgentProfile[]
): CallOpenAIProps {
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
`,
    // TODO add a list of their previous actions
    user: `
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
