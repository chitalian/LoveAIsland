import { WebSocketServer, WebSocket } from "ws";
import { v4 as uuid } from "uuid";
import {
  AgentProfile,
  AgentState,
  PayloadToClient,
  Point,
} from "./backendTypes.ts";
import { Action } from "./openai/movementPrompts.ts";

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

function createNewAgent() {
  const agent: AgentState = {
    position: randomPosition(),
    // TODO - generate and/or source from somewhere
    profileData: {
      name: "Foo Jackson",
      pronouns: "he/him/his",
      orientation: "pansexual",
      photos: [
        "A photo of Foo on the beach. He is shirtless, wearing sunglasses, and holding two thumbs up, standing next to a surfboard.",
        "A photo of Foo, along with 6 friends, all wearing formal wear and holding beer cans.",
        "A photo of Foo standing with his arms crossed next to an expensive sports car.",
        "A photo of Foo relaxing in a red lawn chair holding a glass of beer.",
        "A photo of Foo holding a large fish on a dock.",
      ],
      prompts: [
        ["I'll fall for you if", "you trip me"],
        ["Do you agree or disagree that", "pineapple belongs on pizza?"],
        ["I'm known for", "my knowledge of obscure Michigan facts"],
      ],
      id: uuid(),
    },
  };

  agentStates[agent.profileData.id] = agent;
}

for (let i = 0; i < 20; i++) {
  createNewAgent();
}

function nearby(p1: Point, p2: Point, range: number) {
  return Math.abs(p2[0] - p1[0]) <= range && Math.abs(p2[1] - p1[1]) <= range;
}

function selectAction(
  myAgent: AgentState,
  nearbyAgents: AgentProfile[]
): Action | null {
  const min = -1;
  const max = 1;
  const randomDx = Math.floor(Math.random() * (max - min + 1)) + min;
  const randomDy = Math.floor(Math.random() * (max - min + 1)) + min;

  // TODO use LLM to decide
  // const prompt = getMoveDirectionPrompt(
  //   BOARD_DIMENSIONS,
  //   myAgent.position,
  //   nearbyAgents
  // );
  // console.log(prompt);
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
  const newPosition = selectAction(agentState, nearbyAgents);

  // identify nearby interactivity options
  center = agentState.position;
  const interactiveOptions = [];
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
    console.log("running loop");
    await simulateAgent(agentId);

    broadcast({
      //TODO
      interactionHistory: [],
      agentStates: agentStates,
    });

    //sleep for 1 second
    await new Promise((resolve) => setTimeout(resolve, 5_000));
  }
}
