/**
 * Game content schemas for different game formats
 * These define the structure of the actual playable content
 */

// Basic Formats

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option
  explanation?: string;
}

export interface QuizContent {
  questions: QuizQuestion[];
}

export interface FlashCard {
  front: string;
  back: string;
  hint?: string;
}

export interface FlashcardsContent {
  cards: FlashCard[];
}

export interface MemoryCard {
  id: string;
  content: string;
  matchId: string; // Cards with same matchId are pairs
  type: "text" | "image";
}

export interface MemoryContent {
  cards: MemoryCard[];
  gridSize: number; // e.g., 4 for 4x4 grid
}

export interface PuzzlePiece {
  id: string;
  content: string;
  correctPosition: number;
  hint?: string;
}

export interface PuzzleContent {
  pieces: PuzzlePiece[];
  description: string;
  completionMessage: string;
}

// Normal Complexity Formats

export interface RacingQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  speedBoost: number; // Speed increase for correct answer
}

export interface RacingContent {
  theme: string;
  questions: RacingQuestion[];
  trackLength: number; // Total distance
  timeLimit: number; // Seconds
}

export interface SimulationStep {
  id: string;
  description: string;
  action: string;
  feedback: string;
  isCorrect: boolean;
}

export interface SimulationContent {
  scenario: string;
  objective: string;
  steps: SimulationStep[];
  successMessage: string;
  failureMessage: string;
}

export interface ScenarioChoice {
  text: string;
  consequence: string;
  nextScenarioId?: string;
  points: number;
}

export interface ScenarioNode {
  id: string;
  description: string;
  imagePrompt?: string;
  choices: ScenarioChoice[];
  isEnding: boolean;
}

export interface ScenarioContent {
  title: string;
  startScenarioId: string;
  scenarios: ScenarioNode[];
}

// Complex Formats

export interface RPGMission {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  challenges: QuizQuestion[];
  reward: string;
  nextMissionId?: string;
}

export interface RPGCharacter {
  name: string;
  role: string;
  backstory: string;
}

export interface RPGContent {
  story: string;
  character: RPGCharacter;
  missions: RPGMission[];
  worldDescription: string;
}

export interface StrategyResource {
  name: string;
  amount: number;
  description: string;
}

export interface StrategyDecision {
  id: string;
  situation: string;
  options: {
    text: string;
    resourceCost: Record<string, number>;
    outcome: string;
    points: number;
  }[];
}

export interface StrategyContent {
  objective: string;
  startingResources: StrategyResource[];
  decisions: StrategyDecision[];
  winCondition: string;
}

export interface AdventureLocation {
  id: string;
  name: string;
  description: string;
  challenge?: QuizQuestion;
  connections: string[]; // IDs of connected locations
  items?: string[];
  isGoal: boolean;
}

export interface AdventureContent {
  story: string;
  startLocationId: string;
  locations: AdventureLocation[];
  objective: string;
}

// Union type for all game content
export type GameContent =
  | QuizContent
  | FlashcardsContent
  | MemoryContent
  | PuzzleContent
  | RacingContent
  | SimulationContent
  | ScenarioContent
  | RPGContent
  | StrategyContent
  | AdventureContent;

// Type guards
export function isQuizContent(content: GameContent): content is QuizContent {
  return 'questions' in content && Array.isArray(content.questions);
}

export function isFlashcardsContent(content: GameContent): content is FlashcardsContent {
  return 'cards' in content && Array.isArray(content.cards) && 'front' in content.cards[0];
}

export function isMemoryContent(content: GameContent): content is MemoryContent {
  return 'cards' in content && 'gridSize' in content;
}

export function isPuzzleContent(content: GameContent): content is PuzzleContent {
  return 'pieces' in content && Array.isArray(content.pieces);
}

export function isRacingContent(content: GameContent): content is RacingContent {
  return 'theme' in content && 'trackLength' in content;
}

export function isSimulationContent(content: GameContent): content is SimulationContent {
  return 'scenario' in content && 'steps' in content;
}

export function isScenarioContent(content: GameContent): content is ScenarioContent {
  return 'startScenarioId' in content && 'scenarios' in content;
}

export function isRPGContent(content: GameContent): content is RPGContent {
  return 'story' in content && 'missions' in content && 'character' in content;
}

export function isStrategyContent(content: GameContent): content is StrategyContent {
  return 'startingResources' in content && 'decisions' in content;
}

export function isAdventureContent(content: GameContent): content is AdventureContent {
  return 'locations' in content && 'startLocationId' in content;
}
