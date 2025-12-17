export interface User {
  id: string;
  username: string;
  avatarUrl?: string;
}

export type GameDifficulty = "Beginner" | "Intermediate" | "Advanced";
export type GameComplexity = "Basic" | "Normal" | "Complex";
export type GameFormat = "Quiz" | "Flashcards" | "Memory" | "Puzzle" | "Racing" | "Simulation" | "Scenario" | "RPG" | "Strategy" | "Adventure" | "Other";

export interface Game {
  id: string;
  title: string;
  description: string;
  topic: string;
  tags: string[];
  difficulty: GameDifficulty;
  complexity: GameComplexity;
  durationMinutes: number;
  createdBy: User;
  createdAt: string;
  likesCount: number;
  playsCount: number;
  isBookmarked: boolean;
  thumbnailUrl?: string;
  format: GameFormat;
  language: string;
}

export interface FilterState {
  topic?: string;
  difficulty?: GameDifficulty;
  complexity?: GameComplexity;
  durationRange?: [number, number];
  format?: GameFormat;
  language?: string;
  searchQuery?: string;
  sortBy?: "trending" | "most_played" | "newest";
}

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: number;
  relatedGame?: Game; // If the message generated a game
}
