import { Action } from "./openai/movementPrompts";

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
