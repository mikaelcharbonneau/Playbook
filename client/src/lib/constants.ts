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

// Format options by complexity level - AI will generate appropriate game types
export const FORMATS_BY_COMPLEXITY: Record<GameComplexity, GameFormat[]> = {
  "Basic": ["Quiz", "Flashcards", "Memory", "Puzzle"],
  "Normal": ["Simulation", "Scenario", "Racing"],
  "Complex": ["RPG", "Strategy", "Adventure"]
};

// Descriptions for each format to help users understand what they'll get
export const FORMAT_DESCRIPTIONS: Record<GameFormat, string> = {
  "Quiz": "Multiple choice questions with immediate feedback",
  "Flashcards": "Study cards to memorize terms and concepts",
  "Memory": "Match pairs of related concepts",
  "Puzzle": "Sort and categorize items into correct groups",
  "Racing": "Answer questions to speed through challenges",
  "Simulation": "Manage resources and make strategic decisions",
  "Scenario": "Navigate branching storylines with choices",
  "RPG": "Embark on missions with a character",
  "Strategy": "Plan and execute decisions to achieve goals",
  "Adventure": "Explore worlds and discover knowledge",
  "Other": "Custom game format"
};
