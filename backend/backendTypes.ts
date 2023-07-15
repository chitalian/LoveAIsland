export interface Move {
  _typename: "Move";
  direction: "up" | "down" | "left" | "right";
}

export interface Message {
  text: string;
}
export interface Interact {
  _typename: "Interact";
  destionationAgentId: string;
  message: Message;
}

export type Action = Move | Interact;

export type Point = [number, number];

export interface AgentProfile {
  name: string;
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
  agentId: string;
  action: AgentAction;
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
