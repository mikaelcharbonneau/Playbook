/**
 * Universal Game Specification Schema
 * 
 * This schema defines a flexible structure that can represent any type of educational game,
 * from simple quizzes to complex narrative-driven simulations. The AI generates games
 * conforming to this schema, and the Universal Game Renderer interprets it to create
 * playable experiences.
 */

// ============================================================================
// CORE TYPES
// ============================================================================

export type GameType = 
  | "quiz"           // Question-answer format
  | "flashcard"      // Card-based memorization
  | "matching"       // Match pairs of items
  | "sorting"        // Categorize items
  | "sequence"       // Order items correctly
  | "simulation"     // Resource management / strategy
  | "narrative"      // Story-driven with choices
  | "exploration"    // Open-world discovery
  | "puzzle"         // Logic/spatial puzzles
  | "timed-challenge"; // Speed-based challenges

export type InteractionType =
  | "single-choice"  // Select one option
  | "multiple-choice" // Select multiple options
  | "text-input"     // Type an answer
  | "drag-drop"      // Drag items to targets
  | "tap"            // Tap/click on elements
  | "slider"         // Adjust a value
  | "toggle"         // On/off switches
  | "sequence"       // Arrange in order
  | "draw"           // Drawing/tracing
  | "voice";         // Voice input (future)

export type FeedbackType =
  | "immediate"      // Show right/wrong instantly
  | "delayed"        // Show after section/round
  | "progressive"    // Hints before revealing answer
  | "consequence"    // Actions affect game state
  | "none";          // No explicit feedback

export type ProgressionType =
  | "linear"         // Fixed sequence
  | "branching"      // Choices affect path
  | "adaptive"       // Difficulty adjusts
  | "open"           // Free exploration
  | "milestone";     // Unlock-based progression

// ============================================================================
// GAME SPECIFICATION
// ============================================================================

export interface GameSpec {
  /** Unique identifier for the game spec version */
  version: string;
  
  /** Metadata about the game */
  metadata: GameMetadata;
  
  /** Visual and audio theming */
  theme: GameTheme;
  
  /** Game configuration and rules */
  config: GameConfig;
  
  /** The actual game content - screens, questions, scenarios */
  content: GameContent;
  
  /** How the player progresses through the game */
  progression: ProgressionConfig;
  
  /** Scoring and achievement system */
  scoring: ScoringConfig;
}

// ============================================================================
// METADATA
// ============================================================================

export interface GameMetadata {
  title: string;
  description: string;
  subject: string;
  topic: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  complexity: "basic" | "standard" | "complex";
  estimatedMinutes: number;
  learningObjectives: string[];
  tags: string[];
  language: string;
}

// ============================================================================
// THEME
// ============================================================================

export interface GameTheme {
  /** Primary color for accents */
  primaryColor: string;
  /** Secondary color */
  secondaryColor: string;
  /** Background style */
  background: {
    type: "solid" | "gradient" | "pattern" | "image";
    value: string;
  };
  /** Icon or emoji representing the game */
  icon: string;
  /** Mood/atmosphere */
  mood: "playful" | "serious" | "mysterious" | "adventurous" | "calm" | "energetic";
}

// ============================================================================
// CONFIG
// ============================================================================

export interface GameConfig {
  /** Primary game type */
  gameType: GameType;
  /** Secondary mechanics (hybrid games) */
  secondaryTypes?: GameType[];
  /** Time limit in seconds (0 = no limit) */
  timeLimit: number;
  /** Per-question time limit (0 = no limit) */
  questionTimeLimit: number;
  /** Allow skipping questions/sections */
  allowSkip: boolean;
  /** Allow going back to previous items */
  allowBack: boolean;
  /** Show hints */
  hintsEnabled: boolean;
  /** Maximum hints per game */
  maxHints: number;
  /** Number of lives (0 = unlimited) */
  lives: number;
  /** Shuffle content order */
  shuffleContent: boolean;
  /** How feedback is delivered */
  feedbackType: FeedbackType;
  /** Show correct answer after wrong response */
  showCorrectAnswer: boolean;
}

// ============================================================================
// CONTENT
// ============================================================================

export interface GameContent {
  /** Introduction/tutorial screen */
  intro?: IntroScreen;
  /** Main game sections */
  sections: GameSection[];
  /** Conclusion/summary screen */
  outro?: OutroScreen;
}

export interface IntroScreen {
  title: string;
  description: string;
  instructions: string[];
  /** Optional narrative setup */
  narrative?: string;
  /** Character introduction for story games */
  character?: CharacterInfo;
}

export interface OutroScreen {
  /** Template for completion message - can include {score}, {total}, {percentage}, {time} */
  completionMessage: string;
  /** Summary of what was learned */
  learningSummary: string;
  /** Suggestions for next steps */
  nextSteps?: string[];
}

export interface CharacterInfo {
  name: string;
  role: string;
  description: string;
  avatar?: string;
}

// ============================================================================
// SECTIONS - The building blocks of games
// ============================================================================

export interface GameSection {
  id: string;
  title: string;
  description?: string;
  /** Type of section determines rendering */
  type: SectionType;
  /** Section-specific content */
  content: SectionContent;
  /** Conditions to unlock this section */
  unlockCondition?: UnlockCondition;
}

export type SectionType =
  | "quiz"
  | "flashcards"
  | "matching"
  | "sorting"
  | "narrative"
  | "simulation"
  | "exploration"
  | "challenge"
  | "info";

export type SectionContent =
  | QuizSectionContent
  | FlashcardSectionContent
  | MatchingSectionContent
  | SortingSectionContent
  | NarrativeSectionContent
  | SimulationSectionContent
  | ExplorationSectionContent
  | ChallengeSectionContent
  | InfoSectionContent;

// ============================================================================
// QUIZ SECTION
// ============================================================================

export interface QuizSectionContent {
  type: "quiz";
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  /** Optional image, diagram, or code snippet */
  media?: MediaContent;
  /** Question type determines interaction */
  questionType: "single-choice" | "multiple-choice" | "text-input" | "true-false";
  /** For choice questions */
  options?: QuizOption[];
  /** Correct answer(s) - index for choices, string for text input */
  correctAnswer: number | number[] | string;
  /** Explanation shown after answering */
  explanation?: string;
  /** Hint if enabled */
  hint?: string;
  /** Points for this question */
  points: number;
  /** Time limit override for this question */
  timeLimit?: number;
}

export interface QuizOption {
  id: string;
  text: string;
  /** Optional image for visual options */
  image?: string;
}

export interface MediaContent {
  type: "image" | "code" | "diagram" | "equation" | "audio";
  content: string;
  caption?: string;
}

// ============================================================================
// FLASHCARD SECTION
// ============================================================================

export interface FlashcardSectionContent {
  type: "flashcards";
  cards: Flashcard[];
  /** How to test knowledge */
  testMode: "flip-reveal" | "type-answer" | "speak-answer";
}

export interface Flashcard {
  id: string;
  front: {
    text: string;
    media?: MediaContent;
  };
  back: {
    text: string;
    media?: MediaContent;
  };
  /** Optional hint */
  hint?: string;
  /** Category for organization */
  category?: string;
}

// ============================================================================
// MATCHING SECTION
// ============================================================================

export interface MatchingSectionContent {
  type: "matching";
  pairs: MatchPair[];
  /** How matching works */
  matchStyle: "drag-drop" | "tap-tap" | "draw-lines";
  /** Time limit for matching */
  timeLimit?: number;
}

export interface MatchPair {
  id: string;
  left: {
    text: string;
    image?: string;
  };
  right: {
    text: string;
    image?: string;
  };
}

// ============================================================================
// SORTING SECTION
// ============================================================================

export interface SortingSectionContent {
  type: "sorting";
  items: SortItem[];
  categories: SortCategory[];
  /** Instructions for sorting */
  instructions: string;
}

export interface SortItem {
  id: string;
  text: string;
  image?: string;
  /** Which category this belongs to */
  correctCategory: string;
}

export interface SortCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

// ============================================================================
// NARRATIVE SECTION (Story-driven games)
// ============================================================================

export interface NarrativeSectionContent {
  type: "narrative";
  scenes: NarrativeScene[];
  /** Starting scene ID */
  startScene: string;
}

export interface NarrativeScene {
  id: string;
  /** Narrative text */
  text: string;
  /** Speaker/character */
  speaker?: string;
  /** Background or scene image */
  background?: string;
  /** Choices that lead to other scenes or outcomes */
  choices?: NarrativeChoice[];
  /** If no choices, this is the next scene */
  nextScene?: string;
  /** Actions that happen in this scene */
  actions?: SceneAction[];
  /** Is this an ending scene? */
  isEnding?: boolean;
  /** Ending type if isEnding is true */
  endingType?: "success" | "failure" | "neutral";
}

export interface NarrativeChoice {
  id: string;
  text: string;
  /** Scene to go to */
  targetScene: string;
  /** Condition to show this choice */
  condition?: ChoiceCondition;
  /** Effects of choosing this */
  effects?: ChoiceEffect[];
}

export interface ChoiceCondition {
  type: "variable" | "score" | "item";
  variable: string;
  operator: "==" | "!=" | ">" | "<" | ">=" | "<=";
  value: number | string | boolean;
}

export interface ChoiceEffect {
  type: "set-variable" | "add-score" | "add-item" | "remove-item";
  target: string;
  value: number | string | boolean;
}

export interface SceneAction {
  type: "set-variable" | "add-score" | "show-info" | "play-sound" | "trigger-quiz";
  payload: Record<string, unknown>;
}

// ============================================================================
// SIMULATION SECTION (Resource management, strategy)
// ============================================================================

export interface SimulationSectionContent {
  type: "simulation";
  /** Initial state of the simulation */
  initialState: SimulationState;
  /** Resources the player manages */
  resources: SimResource[];
  /** Actions the player can take */
  actions: SimAction[];
  /** Events that can occur */
  events: SimEvent[];
  /** Win/lose conditions */
  objectives: SimObjective[];
  /** Number of turns/rounds */
  maxTurns: number;
}

export interface SimulationState {
  turn: number;
  resources: Record<string, number>;
  variables: Record<string, unknown>;
  unlockedActions: string[];
  completedObjectives: string[];
}

export interface SimResource {
  id: string;
  name: string;
  icon: string;
  initialValue: number;
  minValue: number;
  maxValue: number;
  /** Description of what this resource represents */
  description: string;
}

export interface SimAction {
  id: string;
  name: string;
  description: string;
  icon: string;
  /** Cost to perform this action */
  cost: Record<string, number>;
  /** Effects of this action */
  effects: Record<string, number>;
  /** Condition to unlock this action */
  unlockCondition?: string;
  /** Cooldown in turns */
  cooldown?: number;
}

export interface SimEvent {
  id: string;
  name: string;
  description: string;
  /** Probability of occurring (0-1) */
  probability: number;
  /** Conditions for this event to be possible */
  conditions?: string;
  /** Effects on resources */
  effects: Record<string, number>;
  /** Choices the player can make in response */
  choices?: SimEventChoice[];
}

export interface SimEventChoice {
  text: string;
  effects: Record<string, number>;
}

export interface SimObjective {
  id: string;
  description: string;
  type: "reach-value" | "maintain-value" | "complete-action" | "survive-turns";
  target: string;
  value: number;
  /** Is this required to win? */
  required: boolean;
  /** Points for completing */
  points: number;
}

// ============================================================================
// EXPLORATION SECTION (Open-world discovery)
// ============================================================================

export interface ExplorationSectionContent {
  type: "exploration";
  /** Map or world description */
  world: ExplorationWorld;
  /** Locations to discover */
  locations: ExplorationLocation[];
  /** Items to collect */
  collectibles: Collectible[];
  /** Starting location */
  startLocation: string;
}

export interface ExplorationWorld {
  name: string;
  description: string;
  /** Grid size or map dimensions */
  size: { width: number; height: number };
  /** Background/theme */
  theme: string;
}

export interface ExplorationLocation {
  id: string;
  name: string;
  description: string;
  position: { x: number; y: number };
  /** What happens when visiting */
  onVisit?: LocationEvent;
  /** Is this location initially visible? */
  visible: boolean;
  /** Icon or image */
  icon: string;
}

export interface LocationEvent {
  type: "info" | "quiz" | "item" | "narrative";
  content: unknown;
}

export interface Collectible {
  id: string;
  name: string;
  description: string;
  icon: string;
  /** Location where this can be found */
  locationId: string;
  /** Points for collecting */
  points: number;
  /** Educational content revealed when collected */
  knowledge: string;
}

// ============================================================================
// CHALLENGE SECTION (Timed/competitive)
// ============================================================================

export interface ChallengeSectionContent {
  type: "challenge";
  challengeType: "speed-round" | "survival" | "high-score" | "accuracy";
  /** Items in the challenge */
  items: ChallengeItem[];
  /** Time limit in seconds */
  timeLimit: number;
  /** Target score to pass */
  targetScore: number;
  /** Lives/mistakes allowed */
  maxMistakes: number;
}

export interface ChallengeItem {
  id: string;
  prompt: string;
  correctAnswer: string | number;
  options?: string[];
  points: number;
  timeBonus?: number;
}

// ============================================================================
// INFO SECTION (Educational content without interaction)
// ============================================================================

export interface InfoSectionContent {
  type: "info";
  title: string;
  content: InfoBlock[];
}

export interface InfoBlock {
  type: "text" | "image" | "list" | "table" | "quote" | "code";
  content: unknown;
}

// ============================================================================
// PROGRESSION
// ============================================================================

export interface ProgressionConfig {
  type: ProgressionType;
  /** For linear: order of sections */
  sectionOrder?: string[];
  /** For branching: starting section */
  startSection?: string;
  /** Minimum score to progress */
  minimumScoreToProgress?: number;
  /** Show progress indicator */
  showProgress: boolean;
}

export interface UnlockCondition {
  type: "score" | "complete-section" | "variable";
  target: string;
  value: number | string | boolean;
}

// ============================================================================
// SCORING
// ============================================================================

export interface ScoringConfig {
  /** Maximum possible score */
  maxScore: number;
  /** Points per correct answer (default) */
  pointsPerCorrect: number;
  /** Penalty for wrong answers */
  penaltyPerWrong: number;
  /** Bonus for speed */
  timeBonus: boolean;
  /** Bonus multiplier for streaks */
  streakMultiplier: number;
  /** Score thresholds for ratings */
  ratings: ScoreRating[];
}

export interface ScoreRating {
  minPercentage: number;
  label: string;
  message: string;
  stars: number;
}

// ============================================================================
// GAME STATE (Runtime state during play)
// ============================================================================

export interface GameState {
  /** Current section being played */
  currentSectionId: string;
  /** Current item within section */
  currentItemIndex: number;
  /** Player's score */
  score: number;
  /** Remaining lives */
  lives: number;
  /** Remaining hints */
  hints: number;
  /** Time elapsed in seconds */
  timeElapsed: number;
  /** Answers given */
  answers: AnswerRecord[];
  /** Sections completed */
  completedSections: string[];
  /** Variables for narrative/simulation games */
  variables: Record<string, unknown>;
  /** Items collected */
  inventory: string[];
  /** Current streak */
  streak: number;
  /** Is game complete? */
  isComplete: boolean;
  /** Final rating if complete */
  finalRating?: ScoreRating;
}

export interface AnswerRecord {
  sectionId: string;
  itemId: string;
  answer: unknown;
  isCorrect: boolean;
  timeSpent: number;
  pointsEarned: number;
}
