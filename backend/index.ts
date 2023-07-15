import { readFileSync } from 'node:fs';
import { WebSocketServer, WebSocket } from "ws";
import { v4 as uuid } from "uuid";
import JSON5 from "json5";
import {
  AgentProfile,
  AgentState,
  PayloadToClient,
  Point,
} from "./backendTypes.ts";
import { Action, getMoveDirectionPrompt } from "./openai/movementPrompts.ts";
import { callOpenAI } from "./openai/index.ts";
const BOARD_DIMENSIONS: [number, number] = [11, 11];

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", function connection(ws) {
  const id = uuid();

  ws.on("error", console.error);

  ws.on("message", function message(data) {
    console.log("received: %s", data);
  });

  ws.send("something");
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

const MAX_COORDINATE = 16;

// TODO
function randomPosition(): Point {
  const min = 0;
  const max = 0;
  const x = Math.floor(Math.random() * (max - min + 1)) + min;
  const y = Math.floor(Math.random() * (max - min + 1)) + min;
  return [x, y];
}

function loadDemoAgents() {
  const fileData = readFileSync('./testdata.json5', "utf8");
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

loadDemoAgents()

function nearby(p1: Point, p2: Point, range: number) {
  return Math.abs(p2[0] - p1[0]) <= range && Math.abs(p2[1] - p1[1]) <= range;
}

async function selectAction(
  myAgent: AgentState,
  nearbyAgents: AgentProfile[]
): Promise<Action | null> {
  const min = -1;
  const max = 1;
  const randomDx = Math.floor(Math.random() * (max - min + 1)) + min;
  const randomDy = Math.floor(Math.random() * (max - min + 1)) + min;

  // TODO use LLM to decide
  const prompt = getMoveDirectionPrompt(
    BOARD_DIMENSIONS,
    myAgent.position,
    nearbyAgents
  );
  const ret = await callOpenAI(prompt);
  console.log(prompt, "ret:", await ret.text());
  return null;
}

// can return undefined for "no interaction"
function selectInteraction(agentState: AgentState, interactOptions: string[]) {
  return undefined;
}

function simulateInteraction(agentState: AgentState, interaction: string[]) {}

async function simulateAgent(selfId: string) {
  const agentState = agentStates[selfId];
  // identify nearby points of interest
  let center = agentState.position;
  const nearbyAgents: AgentProfile[] = [];
  const MAX_POI_DISTANCE = 2;
  for (const agentId in agentStates) {
    if (nearby(center, agentStates[agentId].position, MAX_POI_DISTANCE)) {
      nearbyAgents.push(agentStates[agentId].profileData);
    }
  }

  // select movement
  const newPosition = await selectAction(agentState, nearbyAgents);

  // identify nearby interactivity options
  center = agentState.position;
  const interactiveOptions: string[] = [];
  const MAX_INTERACT_DISTANCE = 1;
  for (const agentId in agentStates) {
    if (
      agentId !== selfId &&
      nearby(center, agentStates[agentId].position, MAX_INTERACT_DISTANCE)
    ) {
      interactiveOptions.push(agentId);
    }
  }

  // select interaction
  const interaction = selectInteraction(agentState, interactiveOptions);

  // simulate interaction
  if (interaction !== undefined) {
    simulateInteraction(agentState, interaction);
  }
}
console.log("Listening on ws://" + "localhost" + ":8080");
// Begin simulation
for (let turn = 0; turn < 100; turn++) {
  for (let agentId in agentStates) {
    await new Promise((resolve) => setTimeout(resolve, 1_000));
    console.log("running loop");

    await simulateAgent(agentId);

    broadcast({
      //TODO
      interactionHistory: [],
      agentStates: agentStates,
    });

    //sleep for 1 second
  }
}
