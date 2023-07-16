import { readFileSync } from "node:fs";
import { WebSocketServer, WebSocket } from "ws";
import { v4 as uuid } from "uuid";
import JSON5 from "json5";
import {
  Action,
  AgentProfile,
  AgentState,
  Interaction,
  PayloadToClient,
  Point,
} from "./backendTypes.ts";
import { getAction, getMoveDirectionPrompt } from "./openai/movementPrompts.ts";
import { callOpenAI } from "./openai/index.ts";
const BOARD_DIMENSIONS: [number, number] = [11, 11];

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", function connection(ws) {
  const id = uuid();

  ws.on("error", console.error);

  ws.on("message", function message(data) {
    console.log("received: %s", data);
  });
});

function broadcast(data: PayloadToClient) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// UUID : AgentState
const agentStates: {
  [key: string]: AgentState;
} = {};

const MAX_COORDINATE = 11;

// TODO
function randomPosition(): Point {
  const min = 0;
  const max = MAX_COORDINATE - 1;
  const x = Math.floor(Math.random() * (max - min + 1)) + min;
  const y = Math.floor(Math.random() * (max - min + 1)) + min;
  return [x, y];
}

function loadDemoAgents() {
  const fileData = readFileSync("./testdata.json5", "utf8");
  const agents: AgentProfile[] = JSON5.parse(fileData);
  for (const agent of agents) {
    agent.id = uuid();
    const agentState: AgentState = {
      position: randomPosition(),
      profileData: agent,
    };
    agentStates[agent.id] = agentState;
  }
}

loadDemoAgents();

function nearby(p1: Point, p2: Point, range: number) {
  return Math.abs(p2[0] - p1[0]) <= range && Math.abs(p2[1] - p1[1]) <= range;
}

async function selectAction(
  myAgent: AgentState,
  nearbyAgents: AgentProfile[],
  history: Interaction[]
): Promise<Action | null> {
  const prompt = getMoveDirectionPrompt(
    BOARD_DIMENSIONS,
    myAgent,
    nearbyAgents,
    history.filter((i) => i.agentId === myAgent.profileData.id),
    history.filter(
      (i) =>
        i.action.action._typename === "Interact" &&
        i.action.action.destionationAgentId === myAgent.profileData.id
    )
  );
  const response = await callOpenAI(prompt);

  const action = getAction(response);
  if ("error" in action) {
    console.error(action.error);
    return null;
  }
  console.log("prompt", prompt.system, "\n", prompt.user);
  console.log(
    "response",
    response.choices[0].message.function_call.name,
    "\n",
    response.choices[0].message.function_call.arguments
  );

  return action;
}

function simulateInteraction(agentState: AgentState, action: Action) {
  if (action._typename === "Move") {
    if (
      action.direction === "up" &&
      agentState.position[1] + 1 < MAX_COORDINATE
    ) {
      agentState.position[1] += 1;
    } else if (action.direction === "down" && agentState.position[1] - 1 >= 0) {
      agentState.position[1] -= 1;
    } else if (action.direction === "left" && agentState.position[0] - 1 >= 0) {
      agentState.position[0] -= 1;
    } else if (
      action.direction === "right" &&
      agentState.position[0] + 1 < MAX_COORDINATE
    ) {
      agentState.position[0] += 1;
    }
  }
}

async function simulateAgent(
  selfId: string,
  history: Interaction[]
): Promise<Interaction | null> {
  const agentState = agentStates[selfId];
  // identify nearby points of interest
  let center = agentState.position;
  const nearbyAgents: AgentProfile[] = [];
  const MAX_INTERACT_DISTANCE = 1;
  for (const agentId in agentStates) {
    if (
      agentId !== selfId &&
      nearby(center, agentStates[agentId].position, MAX_INTERACT_DISTANCE)
    ) {
      nearbyAgents.push(agentStates[agentId].profileData);
    }
  }

  // select movement
  const action: Action | null = await selectAction(
    agentState,
    nearbyAgents,
    history
  );
  if (action === null) {
    return null;
  }

  simulateInteraction(agentState, action);

  return {
    action: {
      action: action,
      agentId: selfId,
    },
    agentId: selfId,
  };
}
console.log("Listening on ws://" + "localhost" + ":8080");
// Begin simulation
const interactionHistory: Interaction[] = [];
for (let turn = 0; turn < 100; turn++) {
  for (let agentId in agentStates) {
    await new Promise((resolve) => setTimeout(resolve, 1_000));
    console.log("running loop");

    const interaction = await simulateAgent(agentId, interactionHistory);
    if (interaction) {
      interactionHistory.push(interaction);
    } else {
      console.error("no interaction");
    }

    broadcast({
      //TODO
      interactionHistory: interactionHistory,
      agentStates: agentStates,
    });
    console.log(
      "MAP",
      (Object.values(agentStates) as AgentState[]).map(
        (a: AgentState) => a.position
      )
    );

    //sleep for 1 second
  }
}
