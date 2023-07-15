export type Point = [number, number];
export interface AgentState {
  position: Point;
  profileData: {
    name: string;
    pronouns: string;
    orientation: string;
    photos: string[];
    prompts: [string, string][];
  };
  interactionHistory: any[];
}
