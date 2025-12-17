import type { GameWithBookmark, GameDifficulty, GameComplexity, GameFormat, FilterState as SharedFilterState } from "@shared/types";

export type { GameDifficulty, GameComplexity, GameFormat };

// Re-export the shared game type with adjusted structure for frontend
export type Game = Omit<GameWithBookmark, "tags" | "createdById"> & {
  tags: string[];
  createdBy: User;
};

export interface User {
  id: number;
  username: string;
  avatarUrl?: string;
}

export interface FilterState extends SharedFilterState {
  sortBy?: "trending" | "most_played" | "newest";
}

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: number;
  relatedGame?: Game;
}
