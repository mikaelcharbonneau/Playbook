export interface User {
  id: string;
  username: string;
  avatarUrl?: string;
}

export type GameDifficulty = "Beginner" | "Intermediate" | "Advanced";
export type GameFormat = "Quiz" | "Flashcards" | "Scenario" | "Puzzle" | "Other";

export interface Game {
  id: string;
  title: string;
  description: string;
  topic: string;
  tags: string[];
  difficulty: GameDifficulty;
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
