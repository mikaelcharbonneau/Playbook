import axios from "axios";
import { ENV } from "./_core/env";
import type {
  QuizContent,
  FlashcardsContent,
  MemoryContent,
  PuzzleContent,
  RacingContent,
  SimulationContent,
  ScenarioContent,
  RPGContent,
  StrategyContent,
  AdventureContent,
  GameContent,
} from "@shared/game-content";
import type { GameFormat, GameDifficulty, GameComplexity } from "@shared/types";

interface GenerateGameRequest {
  topic: string;
  difficulty: GameDifficulty;
  complexity: GameComplexity;
  format: GameFormat;
  durationMinutes: number;
  language: string;
  additionalInstructions?: string;
}

const FORGE_API_URL = ENV.forgeApiUrl;
const FORGE_API_KEY = ENV.forgeApiKey;

function buildSystemPrompt(format: GameFormat, complexity: GameComplexity): string {
  const basePrompt = `You are an expert educational game designer. Your task is to create engaging, educational game content that is accurate, well-structured, and appropriate for the specified difficulty level.

CRITICAL: You must respond with ONLY valid JSON. Do not include any markdown formatting, code blocks, or explanatory text. Your entire response must be parseable JSON.`;

  const formatInstructions: Record<GameFormat, string> = {
    Quiz: `Create a quiz with multiple-choice questions. Return JSON matching this structure:
{
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": number (0-3, index of correct option),
      "explanation": "string (optional)"
    }
  ]
}`,
    Flashcards: `Create flashcards for learning. Return JSON matching this structure:
{
  "cards": [
    {
      "front": "string (term or question)",
      "back": "string (definition or answer)",
      "hint": "string (optional)"
    }
  ]
}`,
    Memory: `Create a memory matching game. Return JSON matching this structure:
{
  "cards": [
    {
      "id": "string (unique)",
      "content": "string",
      "matchId": "string (same for matching pairs)",
      "type": "text"
    }
  ],
  "gridSize": number (4 for 4x4, 6 for 6x6)
}`,
    Puzzle: `Create a puzzle game. Return JSON matching this structure:
{
  "pieces": [
    {
      "id": "string",
      "content": "string (piece content)",
      "correctPosition": number,
      "hint": "string (optional)"
    }
  ],
  "description": "string",
  "completionMessage": "string"
}`,
    Racing: `Create a racing game with educational questions. Return JSON matching this structure:
{
  "theme": "string",
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": number,
      "speedBoost": number (10-30)
    }
  ],
  "trackLength": number (1000-3000),
  "timeLimit": number (seconds)
}`,
    Simulation: `Create an interactive simulation. Return JSON matching this structure:
{
  "scenario": "string",
  "objective": "string",
  "steps": [
    {
      "id": "string",
      "description": "string",
      "action": "string",
      "feedback": "string",
      "isCorrect": boolean
    }
  ],
  "successMessage": "string",
  "failureMessage": "string"
}`,
    Scenario: `Create a branching scenario game. Return JSON matching this structure:
{
  "title": "string",
  "startScenarioId": "string",
  "scenarios": [
    {
      "id": "string",
      "description": "string",
      "imagePrompt": "string (optional)",
      "choices": [
        {
          "text": "string",
          "consequence": "string",
          "nextScenarioId": "string (optional)",
          "points": number
        }
      ],
      "isEnding": boolean
    }
  ]
}`,
    RPG: `Create an RPG with missions. Return JSON matching this structure:
{
  "story": "string",
  "character": {
    "name": "string",
    "role": "string",
    "backstory": "string"
  },
  "missions": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "objectives": ["string"],
      "challenges": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": number,
          "explanation": "string (optional)"
        }
      ],
      "reward": "string",
      "nextMissionId": "string (optional)"
    }
  ],
  "worldDescription": "string"
}`,
    Strategy: `Create a strategy game. Return JSON matching this structure:
{
  "objective": "string",
  "startingResources": [
    {
      "name": "string",
      "amount": number,
      "description": "string"
    }
  ],
  "decisions": [
    {
      "id": "string",
      "situation": "string",
      "options": [
        {
          "text": "string",
          "resourceCost": {"resourceName": number},
          "outcome": "string",
          "points": number
        }
      ]
    }
  ],
  "winCondition": "string"
}`,
    Adventure: `Create an adventure game. Return JSON matching this structure:
{
  "story": "string",
  "startLocationId": "string",
  "locations": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "challenge": {
        "question": "string",
        "options": ["string", "string", "string", "string"],
        "correctAnswer": number,
        "explanation": "string (optional)"
      },
      "connections": ["string (location IDs)"],
      "items": ["string (optional)"],
      "isGoal": boolean
    }
  ],
  "objective": "string"
}`,
    Other: `Create appropriate game content based on the topic and complexity.`,
  };

  return `${basePrompt}\n\n${formatInstructions[format]}`;
}

function buildUserPrompt(req: GenerateGameRequest): string {
  return `Create a ${req.complexity} complexity ${req.format} game about "${req.topic}" for ${req.difficulty} level learners. The game should take approximately ${req.durationMinutes} minutes to complete and be in ${req.language}.

${req.additionalInstructions ? `Additional instructions: ${req.additionalInstructions}` : ""}

Remember: Respond with ONLY the JSON object. No markdown, no code blocks, no explanations.`;
}

export async function generateGameContent(req: GenerateGameRequest): Promise<GameContent> {
  try {
    const response = await axios.post(
      `${FORGE_API_URL}/v1/chat/completions`,
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: buildSystemPrompt(req.format, req.complexity),
          },
          {
            role: "user",
            content: buildUserPrompt(req),
          },
        ],
        temperature: 0.8,
        max_tokens: 4000,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${FORGE_API_KEY}`,
        },
      }
    );

    const content = response.data.choices[0].message.content;
    
    // Try to extract JSON if it's wrapped in markdown code blocks
    let jsonContent = content.trim();
    if (jsonContent.startsWith("```")) {
      const match = jsonContent.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
      if (match) {
        jsonContent = match[1];
      }
    }
    
    const gameContent = JSON.parse(jsonContent);
    return gameContent as GameContent;
  } catch (error) {
    console.error("AI generation error:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(`AI API error: ${error.response?.data?.error?.message || error.message}`);
    }
    throw new Error("Failed to generate game content");
  }
}

export async function generateGameTitle(topic: string, format: GameFormat): Promise<string> {
  try {
    const response = await axios.post(
      `${FORGE_API_URL}/v1/chat/completions`,
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a creative game title generator. Create catchy, engaging titles for educational games. Respond with ONLY the title, no quotes or extra text.",
          },
          {
            role: "user",
            content: `Create a catchy title for a ${format} game about ${topic}.`,
          },
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
  } catch (error) {
    console.error("Title generation error:", error);
    return `${topic} ${format}`;
  }
}

export async function generateGameDescription(
  topic: string,
  format: GameFormat,
  difficulty: GameDifficulty
): Promise<string> {
  try {
    const response = await axios.post(
      `${FORGE_API_URL}/v1/chat/completions`,
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a game description writer. Create engaging, concise descriptions (1-2 sentences) for educational games. Respond with ONLY the description.",
          },
          {
            role: "user",
            content: `Write a description for a ${difficulty} level ${format} game about ${topic}.`,
          },
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
  } catch (error) {
    console.error("Description generation error:", error);
    return `A ${difficulty} level ${format} game about ${topic}.`;
  }
}
