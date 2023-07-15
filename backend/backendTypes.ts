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

export type Point = [number, number];

export interface AgentProfile {
  name: string;
  age: Number;
  pronouns: string;
  orientation: string;
  photos: string[];
  prompts: [string, string][];
  id: string;
}

export interface AgentAction {
  agentId: string;
  action: Action;
}
export interface Interaction {
  actions: AgentAction[];
}

export interface AgentState {
  position: Point;
  profileData: AgentProfile;
}

export interface PayloadToClient {
  agentStates: {
    [key: string]: AgentState;
  };
  interactionHistory: Interaction[];
}
