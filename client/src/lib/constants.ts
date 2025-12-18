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

// Only include formats with working game players
export const FORMATS_BY_COMPLEXITY: Record<GameComplexity, GameFormat[]> = {
  "Basic": ["Quiz", "Flashcards", "Memory"],
  "Normal": ["Quiz", "Flashcards", "Memory"], // TODO: Add Racing, Simulation, Scenario when players are built
  "Complex": ["Quiz", "Flashcards", "Memory"] // TODO: Add RPG, Strategy, Adventure when players are built
};
