import { GameComplexity, GameFormat } from "@/types";

export const TOPICS = [
  "Agriculture",
  "Anthropology",
  "Astronomy",
  "Biology",
  "Business Administration",
  "Chemistry",
  "Computer Science",
  "Economics",
  "Education",
  "Engineering",
  "Environmental Science",
  "Health Sciences",
  "History",
  "Information Technology",
  "Languages and Literature",
  "Law",
  "Mathematics",
  "Music Education",
  "Nursing",
  "Pharmacy",
  "Political Science",
  "Psychology",
  "Social Sciences",
  "Sociology",
  "Visual Arts"
];

export const FORMATS_BY_COMPLEXITY: Record<GameComplexity, GameFormat[]> = {
  "Basic": ["Quiz", "Flashcards", "Memory", "Puzzle"],
  "Normal": ["Racing", "Simulation", "Scenario"],
  "Complex": ["RPG", "Strategy", "Adventure"]
};
