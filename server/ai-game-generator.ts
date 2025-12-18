import axios from "axios";
import { ENV } from "./_core/env";
import type { 
  GameSpec, 
  GameType,
  QuizSectionContent,
  FlashcardSectionContent,
  MatchingSectionContent,
  SortingSectionContent,
  NarrativeSectionContent,
  SimulationSectionContent,
  ChallengeSectionContent,
  InfoSectionContent,
  GameSection
} from "@shared/game-schema";

const FORGE_API_URL = ENV.forgeApiUrl;
const FORGE_API_KEY = ENV.forgeApiKey;

export interface GameGenerationRequest {
  topic: string;
  subject: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  complexity: "basic" | "standard" | "complex";
  durationMinutes: number;
  language?: string;
  customPrompt?: string;
}

// Map complexity to appropriate game types
const GAME_TYPES_BY_COMPLEXITY: Record<string, GameType[]> = {
  basic: ["quiz", "flashcard", "matching", "sorting", "timed-challenge"],
  standard: ["simulation", "puzzle", "sequence"],
  complex: ["narrative", "exploration"]
};

// Build the system prompt for GameSpec generation
function buildGameSpecSystemPrompt(complexity: string): string {
  const basePrompt = `You are an expert educational game designer. Your task is to create complete, playable educational games.

CRITICAL RULES:
1. Respond with ONLY valid JSON - no markdown, no code blocks, no explanations
2. The JSON must conform exactly to the GameSpec schema provided
3. Create engaging, educational content appropriate for the specified level
4. All IDs must be unique strings (use format like "q1", "s1", "scene-1", etc.)
5. Ensure all references (nextScene, targetScene, etc.) point to valid IDs

`;

  const complexityInstructions: Record<string, string> = {
    basic: `For BASIC complexity games, create:
- Quiz: 8-12 multiple choice questions with explanations
- Flashcard: 10-15 cards with terms and definitions
- Matching: 6-8 pairs to match
- Sorting: 8-12 items to categorize into 3-4 categories
- Timed-challenge: 10-15 quick questions with time pressure

Focus on clear, direct learning with immediate feedback.`,

    standard: `For STANDARD complexity games, create:
- Simulation: Resource management with 3-4 resources, 5-8 actions, 2-3 random events, and clear objectives
- Puzzle: Logic-based challenges that require understanding the topic
- Sequence: Order-based learning with educational context

Include strategic decision-making and cause-effect relationships.`,

    complex: `For COMPLEX complexity games, create:
- Narrative: Story-driven experience with 8-15 scenes, branching paths, multiple endings
- Exploration: World with 5-8 locations to discover, collectibles, and embedded learning challenges

Create immersive experiences with character development, meaningful choices, and deep learning integration.`
  };

  return basePrompt + complexityInstructions[complexity];
}

// Build the GameSpec schema reference for the AI
function buildSchemaReference(gameType: GameType): string {
  const schemas: Record<GameType, string> = {
    quiz: `{
  "version": "1.0",
  "metadata": {
    "title": "string",
    "description": "string",
    "subject": "string",
    "topic": "string",
    "difficulty": "beginner|intermediate|advanced",
    "complexity": "basic|standard|complex",
    "estimatedMinutes": number,
    "learningObjectives": ["string"],
    "tags": ["string"],
    "language": "string"
  },
  "theme": {
    "primaryColor": "#hex",
    "secondaryColor": "#hex",
    "backgroundStyle": "solid|gradient|pattern",
    "fontStyle": "modern|classic|playful",
    "iconSet": "default|emoji|custom"
  },
  "config": {
    "allowSkip": boolean,
    "showHints": boolean,
    "shuffleQuestions": boolean,
    "showExplanations": boolean,
    "livesEnabled": boolean,
    "initialLives": number,
    "timerEnabled": boolean,
    "globalTimeLimit": number (optional)
  },
  "content": {
    "sections": [{
      "id": "string",
      "title": "string",
      "description": "string (optional)",
      "type": "quiz",
      "content": {
        "type": "quiz",
        "questions": [{
          "id": "string",
          "question": "string",
          "questionType": "single-choice|multiple-choice|text-input|true-false",
          "options": [{"id": "string", "text": "string"}],
          "correctAnswer": number|number[]|string,
          "explanation": "string (optional)",
          "hint": "string (optional)",
          "points": number
        }]
      }
    }]
  },
  "progression": {
    "type": "linear",
    "sectionOrder": ["section-id"],
    "showProgress": true
  },
  "scoring": {
    "maxScore": number,
    "pointsPerCorrect": number,
    "penaltyPerWrong": number,
    "timeBonus": boolean,
    "streakMultiplier": number,
    "ratings": [
      {"minPercentage": 90, "label": "Excellent", "message": "Outstanding!", "stars": 3},
      {"minPercentage": 70, "label": "Good", "message": "Well done!", "stars": 2},
      {"minPercentage": 0, "label": "Keep Learning", "message": "Practice more!", "stars": 1}
    ]
  }
}`,

    flashcard: `{
  "version": "1.0",
  "metadata": { /* same as quiz */ },
  "theme": { /* same as quiz */ },
  "config": {
    "allowSkip": true,
    "showHints": true,
    "shuffleQuestions": true,
    "showExplanations": true,
    "livesEnabled": false,
    "initialLives": 3,
    "timerEnabled": false
  },
  "content": {
    "sections": [{
      "id": "string",
      "title": "string",
      "type": "flashcards",
      "content": {
        "type": "flashcards",
        "cards": [{
          "id": "string",
          "front": {"text": "string"},
          "back": {"text": "string"},
          "hint": "string (optional)",
          "category": "string (optional)"
        }],
        "testMode": "flip-reveal"
      }
    }]
  },
  "progression": { "type": "linear", "sectionOrder": ["section-id"], "showProgress": true },
  "scoring": { /* same structure */ }
}`,

    matching: `{
  "version": "1.0",
  "metadata": { /* same structure */ },
  "theme": { /* same structure */ },
  "config": { /* same structure */ },
  "content": {
    "sections": [{
      "id": "string",
      "title": "string",
      "type": "matching",
      "content": {
        "type": "matching",
        "pairs": [{
          "id": "string",
          "left": {"text": "string"},
          "right": {"text": "string"}
        }],
        "matchStyle": "tap-tap",
        "timeLimit": number (optional)
      }
    }]
  },
  "progression": { /* same structure */ },
  "scoring": { /* same structure */ }
}`,

    sorting: `{
  "version": "1.0",
  "metadata": { /* same structure */ },
  "theme": { /* same structure */ },
  "config": { /* same structure */ },
  "content": {
    "sections": [{
      "id": "string",
      "title": "string",
      "type": "sorting",
      "content": {
        "type": "sorting",
        "items": [{
          "id": "string",
          "text": "string",
          "correctCategory": "category-id"
        }],
        "categories": [{
          "id": "string",
          "name": "string",
          "description": "string (optional)",
          "color": "#hex (optional)"
        }],
        "instructions": "string"
      }
    }]
  },
  "progression": { /* same structure */ },
  "scoring": { /* same structure */ }
}`,

    "timed-challenge": `{
  "version": "1.0",
  "metadata": { /* same structure */ },
  "theme": { /* same structure */ },
  "config": {
    "allowSkip": false,
    "showHints": false,
    "shuffleQuestions": true,
    "showExplanations": false,
    "livesEnabled": true,
    "initialLives": 3,
    "timerEnabled": true,
    "globalTimeLimit": 60
  },
  "content": {
    "sections": [{
      "id": "string",
      "title": "string",
      "type": "challenge",
      "content": {
        "type": "challenge",
        "challengeType": "speed-round|survival|high-score|accuracy",
        "items": [{
          "id": "string",
          "prompt": "string",
          "correctAnswer": "string|number",
          "options": ["string"] (optional, for multiple choice),
          "points": number,
          "timeBonus": number (optional)
        }],
        "timeLimit": number,
        "targetScore": number,
        "maxMistakes": number
      }
    }]
  },
  "progression": { /* same structure */ },
  "scoring": { /* same structure */ }
}`,

    simulation: `{
  "version": "1.0",
  "metadata": { /* same structure */ },
  "theme": { /* same structure */ },
  "config": { /* same structure */ },
  "content": {
    "sections": [{
      "id": "string",
      "title": "string",
      "type": "simulation",
      "content": {
        "type": "simulation",
        "initialState": {
          "turn": 0,
          "resources": {"resource-id": number},
          "variables": {},
          "unlockedActions": [],
          "completedObjectives": []
        },
        "resources": [{
          "id": "string",
          "name": "string",
          "icon": "emoji",
          "initialValue": number,
          "minValue": number,
          "maxValue": number,
          "description": "string"
        }],
        "actions": [{
          "id": "string",
          "name": "string",
          "description": "string",
          "icon": "emoji",
          "cost": {"resource-id": number},
          "effects": {"resource-id": number},
          "cooldown": number (optional)
        }],
        "events": [{
          "id": "string",
          "name": "string",
          "description": "string",
          "probability": number (0-1),
          "effects": {"resource-id": number},
          "choices": [{"text": "string", "effects": {"resource-id": number}}] (optional)
        }],
        "objectives": [{
          "id": "string",
          "description": "string",
          "type": "reach-value|maintain-value|survive-turns",
          "target": "resource-id",
          "value": number,
          "required": boolean,
          "points": number
        }],
        "maxTurns": number
      }
    }]
  },
  "progression": { /* same structure */ },
  "scoring": { /* same structure */ }
}`,

    narrative: `{
  "version": "1.0",
  "metadata": { /* same structure */ },
  "theme": { /* same structure */ },
  "config": { /* same structure */ },
  "content": {
    "sections": [{
      "id": "string",
      "title": "string",
      "type": "narrative",
      "content": {
        "type": "narrative",
        "scenes": [{
          "id": "string",
          "text": "string (the narrative text)",
          "speaker": "string (optional)",
          "background": "string (optional, image URL or description)",
          "choices": [{
            "id": "string",
            "text": "string",
            "targetScene": "scene-id",
            "effects": [{"type": "add-score", "target": "score", "value": number}] (optional)
          }] (optional),
          "nextScene": "scene-id" (if no choices),
          "isEnding": boolean (optional),
          "endingType": "success|failure|neutral" (if isEnding)
        }],
        "startScene": "scene-id"
      }
    }]
  },
  "progression": { "type": "branching", "startSection": "section-id", "showProgress": true },
  "scoring": { /* same structure */ }
}`,

    exploration: `{
  "version": "1.0",
  "metadata": { /* same structure */ },
  "theme": { /* same structure */ },
  "config": { /* same structure */ },
  "content": {
    "sections": [{
      "id": "string",
      "title": "string",
      "type": "exploration",
      "content": {
        "type": "exploration",
        "world": {
          "name": "string",
          "description": "string",
          "size": {"width": number, "height": number},
          "theme": "string"
        },
        "locations": [{
          "id": "string",
          "name": "string",
          "description": "string",
          "position": {"x": number, "y": number},
          "onVisit": {"type": "quiz|info|item", "content": object} (optional),
          "visible": boolean,
          "icon": "emoji"
        }],
        "collectibles": [{
          "id": "string",
          "name": "string",
          "description": "string",
          "icon": "emoji",
          "locationId": "location-id",
          "points": number,
          "knowledge": "string (educational content)"
        }],
        "startLocation": "location-id"
      }
    }]
  },
  "progression": { "type": "open", "showProgress": true },
  "scoring": { /* same structure */ }
}`,

    puzzle: `{
  "version": "1.0",
  "metadata": { /* same structure */ },
  "theme": { /* same structure */ },
  "config": { /* same structure */ },
  "content": {
    "sections": [{
      "id": "string",
      "title": "string",
      "type": "sorting",
      "content": {
        "type": "sorting",
        "items": [/* items to arrange/solve */],
        "categories": [/* solution categories */],
        "instructions": "string"
      }
    }]
  },
  "progression": { /* same structure */ },
  "scoring": { /* same structure */ }
}`,

    sequence: `{
  "version": "1.0",
  "metadata": { /* same structure */ },
  "theme": { /* same structure */ },
  "config": { /* same structure */ },
  "content": {
    "sections": [{
      "id": "string",
      "title": "string",
      "type": "sorting",
      "content": {
        "type": "sorting",
        "items": [{
          "id": "string",
          "text": "string",
          "correctCategory": "position-1|position-2|..."
        }],
        "categories": [
          {"id": "position-1", "name": "Step 1"},
          {"id": "position-2", "name": "Step 2"}
        ],
        "instructions": "Arrange in the correct order"
      }
    }]
  },
  "progression": { /* same structure */ },
  "scoring": { /* same structure */ }
}`
  };

  return schemas[gameType] || schemas.quiz;
}

// Select appropriate game type based on complexity
function selectGameType(complexity: string, customPrompt?: string): GameType {
  const types = GAME_TYPES_BY_COMPLEXITY[complexity] || GAME_TYPES_BY_COMPLEXITY.basic;
  
  // If custom prompt mentions specific game types, try to match
  if (customPrompt) {
    const promptLower = customPrompt.toLowerCase();
    if (promptLower.includes("quiz") || promptLower.includes("question")) return "quiz";
    if (promptLower.includes("flashcard") || promptLower.includes("memorize")) return "flashcard";
    if (promptLower.includes("match") || promptLower.includes("pair")) return "matching";
    if (promptLower.includes("sort") || promptLower.includes("categorize")) return "sorting";
    if (promptLower.includes("story") || promptLower.includes("narrative") || promptLower.includes("adventure")) return "narrative";
    if (promptLower.includes("simulation") || promptLower.includes("manage") || promptLower.includes("strategy")) return "simulation";
    if (promptLower.includes("challenge") || promptLower.includes("speed") || promptLower.includes("timed")) return "timed-challenge";
    if (promptLower.includes("explore") || promptLower.includes("discover")) return "exploration";
  }
  
  // Random selection from appropriate types
  return types[Math.floor(Math.random() * types.length)];
}

export async function generateGameSpec(req: GameGenerationRequest): Promise<GameSpec> {
  const gameType = selectGameType(req.complexity, req.customPrompt);
  
  const systemPrompt = buildGameSpecSystemPrompt(req.complexity);
  const schemaRef = buildSchemaReference(gameType);
  
  const userPrompt = `Create a ${req.complexity} complexity educational game about "${req.topic}" in the subject of ${req.subject}.

Target audience: ${req.difficulty} level learners
Duration: approximately ${req.durationMinutes} minutes
Language: ${req.language || "English"}
Game type: ${gameType}

${req.customPrompt ? `Additional requirements: ${req.customPrompt}` : ""}

The game must follow this exact JSON schema:
${schemaRef}

IMPORTANT:
- Create engaging, accurate educational content
- All IDs must be unique
- All references must point to valid IDs
- Include at least the minimum content for a complete game
- Respond with ONLY the JSON object`;

  try {
    const response = await axios.post(
      `${FORGE_API_URL}/v1/chat/completions`,
      {
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 8000,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${FORGE_API_KEY}`,
        },
      }
    );

    let content = response.data.choices[0].message.content.trim();
    
    // Extract JSON if wrapped in markdown
    if (content.startsWith("```")) {
      const match = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      if (match) {
        content = match[1];
      }
    }
    
    const gameSpec = JSON.parse(content) as GameSpec;
    
    // Validate and fix common issues
    return validateAndFixGameSpec(gameSpec, gameType);
  } catch (error) {
    console.error("GameSpec generation error:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(`AI API error: ${error.response?.data?.error?.message || error.message}`);
    }
    throw new Error("Failed to generate game specification");
  }
}

// Validate and fix common issues in AI-generated GameSpec
function validateAndFixGameSpec(spec: GameSpec, expectedType: GameType): GameSpec {
  // Ensure version exists
  if (!spec.version) {
    spec.version = "1.0";
  }
  
  // Ensure metadata has required fields
  if (!spec.metadata.learningObjectives) {
    spec.metadata.learningObjectives = [];
  }
  if (!spec.metadata.tags) {
    spec.metadata.tags = [];
  }
  if (!spec.metadata.language) {
    spec.metadata.language = "English";
  }
  
  // Ensure theme exists
  if (!spec.theme) {
    spec.theme = {
      primaryColor: "#B6EBE7",
      secondaryColor: "#7DD3C8",
      background: {
        type: "gradient",
        value: "linear-gradient(135deg, #B6EBE7 0%, #7DD3C8 100%)"
      },
      icon: "🎮",
      mood: "playful"
    };
  }
  
  // Ensure config exists
  if (!spec.config) {
    spec.config = {
      gameType: expectedType,
      timeLimit: 0,
      questionTimeLimit: 0,
      allowSkip: true,
      allowBack: true,
      hintsEnabled: true,
      maxHints: 3,
      lives: 0,
      shuffleContent: false,
      feedbackType: "immediate",
      showCorrectAnswer: true
    };
  }
  
  // Ensure progression exists
  if (!spec.progression) {
    const sectionIds = spec.content.sections.map(s => s.id);
    spec.progression = {
      type: "linear",
      sectionOrder: sectionIds,
      showProgress: true
    };
  }
  
  // Ensure scoring exists
  if (!spec.scoring) {
    spec.scoring = {
      maxScore: 100,
      pointsPerCorrect: 10,
      penaltyPerWrong: 0,
      timeBonus: false,
      streakMultiplier: 1,
      ratings: [
        { minPercentage: 90, label: "Excellent", message: "Outstanding work!", stars: 3 },
        { minPercentage: 70, label: "Good", message: "Well done!", stars: 2 },
        { minPercentage: 50, label: "Fair", message: "Keep practicing!", stars: 1 },
        { minPercentage: 0, label: "Needs Work", message: "Try again!", stars: 0 }
      ]
    };
  }
  
  return spec;
}

// Generate just the title
export async function generateGameTitle(topic: string, gameType: GameType): Promise<string> {
  try {
    const response = await axios.post(
      `${FORGE_API_URL}/v1/chat/completions`,
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Generate a catchy, engaging title for an educational game. Respond with ONLY the title."
          },
          {
            role: "user",
            content: `Create a title for a ${gameType} game about ${topic}.`
          }
        ],
        temperature: 0.9,
        max_tokens: 50,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${FORGE_API_KEY}`,
        },
      }
    );

    return response.data.choices[0].message.content.trim().replace(/^["']|["']$/g, "");
  } catch {
    return `${topic} Challenge`;
  }
}

// Generate description
export async function generateGameDescription(
  topic: string,
  gameType: GameType,
  difficulty: string
): Promise<string> {
  try {
    const response = await axios.post(
      `${FORGE_API_URL}/v1/chat/completions`,
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Write a brief, engaging description (1-2 sentences) for an educational game. Respond with ONLY the description."
          },
          {
            role: "user",
            content: `Describe a ${difficulty} level ${gameType} game about ${topic}.`
          }
        ],
        temperature: 0.8,
        max_tokens: 100,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${FORGE_API_KEY}`,
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch {
    return `A ${difficulty} level ${gameType} game about ${topic}.`;
  }
}
