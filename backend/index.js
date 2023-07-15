"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ws_1 = require("ws");
var uuid_1 = require("uuid");
var wss = new ws_1.WebSocketServer({ port: 8080 });
wss.on("connection", function connection(ws) {
    var id = (0, uuid_1.v4)();
    ws.on("error", console.error);
    ws.on("message", function message(data) {
        console.log("received: %s", data);
    });
    ws.send("something");
});
function broadcast(data) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}
// UUID : AgentState
var agentStates = {};
var MAX_COORDINATE = 16;
// TODO
function randomPosition() {
    var min = 0;
    var max = 0;
    var x = Math.floor(Math.random() * (max - min + 1)) + min;
    var y = Math.floor(Math.random() * (max - min + 1)) + min;
    return [x, y];
}
function createNewAgent() {
    var agent = {
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
        },
        interactionHistory: [],
    };
    var id = (0, uuid_1.v4)();
    agentStates[id] = agent;
}
for (var i = 0; i < 20; i++) {
    createNewAgent();
}
function nearby(p1, p2, range) {
    return Math.abs(p2[0] - p1[0]) <= range && Math.abs(p2[1] - p1[1]) <= range;
}
function selectMovement(agentState, pointsOfInterest) {
    var min = -1;
    var max = 1;
    var randomDx = Math.floor(Math.random() * (max - min + 1)) + min;
    var randomDy = Math.floor(Math.random() * (max - min + 1)) + min;
    // TODO use LLM to decide
    return [agentState.position[0] + randomDx, agentState.position[1] + randomDy];
}
// can return undefined for "no interaction"
function selectInteraction(agentState, interactOptions) {
    return undefined;
}
function simulateInteraction(agentState, interaction) { }
function simulateAgent(selfId) {
    var agentState = agentStates[selfId];
    // identify nearby points of interest
    var center = agentState.position;
    var pointsOfInterest = [];
    var MAX_POI_DISTANCE = 2;
    for (var agentId in agentStates) {
        if (agentId !== selfId &&
            nearby(center, agentStates[agentId].position, MAX_POI_DISTANCE)) {
            pointsOfInterest.push(agentId);
        }
    }
    // select movement
    var newPosition = selectMovement(agentState, pointsOfInterest);
    agentState.position = newPosition;
    // identify nearby interactivity options
    center = agentState.position;
    var interactiveOptions = [];
    var MAX_INTERACT_DISTANCE = 1;
    for (var agentId in agentStates) {
        if (agentId !== selfId &&
            nearby(center, agentStates[agentId].position, MAX_INTERACT_DISTANCE)) {
            interactiveOptions.push(agentId);
        }
    }
    // select interaction
    var interaction = selectInteraction(agentState, interactiveOptions);
    // simulate interaction
    if (interaction !== undefined) {
        simulateInteraction(agentState, interaction);
    }
}
// Begin simulation
for (var turn = 0; turn < 100; turn++) {
    for (var agentId in agentStates) {
        simulateAgent(agentId);
        // send update to all clients
        broadcast(JSON.stringify(agentStates));
    }
}
