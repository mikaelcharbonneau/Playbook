/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

export type GameDifficulty = "Beginner" | "Intermediate" | "Advanced";
export type GameComplexity = "Basic" | "Normal" | "Complex";
export type GameFormat = "Quiz" | "Flashcards" | "Memory" | "Puzzle" | "Racing" | "Simulation" | "Scenario" | "RPG" | "Strategy" | "Adventure" | "Other";

export interface GameWithBookmark {
  id: number;
  title: string;
  description: string;
  topic: string;
  tags: string;
  difficulty: GameDifficulty;
  complexity: GameComplexity;
  format: GameFormat;
  durationMinutes: number;
  language: string;
  thumbnailUrl: string | null;
  likesCount: number;
  playsCount: number;
  createdById: number;
  createdAt: Date;
  updatedAt: Date;
  isBookmarked: boolean;
}

export interface CreateGameInput {
  title: string;
  description: string;
  topic: string;
  tags: string[];
  difficulty: GameDifficulty;
  complexity: GameComplexity;
  format: GameFormat;
  durationMinutes: number;
  language: string;
  thumbnailUrl?: string;
}

export interface FilterState {
  topic?: string;
  difficulty?: GameDifficulty;
  complexity?: GameComplexity;
  durationRange?: [number, number];
  format?: GameFormat;
  language?: string;
  searchQuery?: string;
}
