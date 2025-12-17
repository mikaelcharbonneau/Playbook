import { describe, it, expect } from "vitest";
import { generateGameContent, generateGameTitle, generateGameDescription } from "./ai-service";

describe("AI Game Generation", () => {
  it("should generate a quiz game with valid structure", async () => {
    const result = await generateGameContent({
      topic: "Basic Algebra",
      difficulty: "Beginner",
      complexity: "Basic",
      format: "Quiz",
      durationMinutes: 5,
      language: "English",
    });

    expect(result).toBeDefined();
    expect(result).toHaveProperty("questions");
    expect(Array.isArray((result as any).questions)).toBe(true);
    expect((result as any).questions.length).toBeGreaterThan(0);

    // Check first question structure
    const firstQuestion = (result as any).questions[0];
    expect(firstQuestion).toHaveProperty("question");
    expect(firstQuestion).toHaveProperty("options");
    expect(firstQuestion).toHaveProperty("correctAnswer");
    expect(Array.isArray(firstQuestion.options)).toBe(true);
    expect(firstQuestion.options.length).toBe(4);
    expect(typeof firstQuestion.correctAnswer).toBe("number");
    expect(firstQuestion.correctAnswer).toBeGreaterThanOrEqual(0);
    expect(firstQuestion.correctAnswer).toBeLessThan(4);
  }, 30000);

  it("should generate flashcards with valid structure", async () => {
    const result = await generateGameContent({
      topic: "Spanish Vocabulary",
      difficulty: "Beginner",
      complexity: "Basic",
      format: "Flashcards",
      durationMinutes: 10,
      language: "English",
    });

    expect(result).toBeDefined();
    expect(result).toHaveProperty("cards");
    expect(Array.isArray((result as any).cards)).toBe(true);
    expect((result as any).cards.length).toBeGreaterThan(0);

    // Check first card structure
    const firstCard = (result as any).cards[0];
    expect(firstCard).toHaveProperty("front");
    expect(firstCard).toHaveProperty("back");
    expect(typeof firstCard.front).toBe("string");
    expect(typeof firstCard.back).toBe("string");
  }, 30000);

  it("should generate a memory game with valid structure", async () => {
    const result = await generateGameContent({
      topic: "World Capitals",
      difficulty: "Intermediate",
      complexity: "Basic",
      format: "Memory",
      durationMinutes: 5,
      language: "English",
    });

    expect(result).toBeDefined();
    expect(result).toHaveProperty("cards");
    expect(result).toHaveProperty("gridSize");
    expect(Array.isArray((result as any).cards)).toBe(true);
    expect((result as any).cards.length).toBeGreaterThan(0);

    // Check card structure
    const firstCard = (result as any).cards[0];
    expect(firstCard).toHaveProperty("id");
    expect(firstCard).toHaveProperty("content");
    expect(firstCard).toHaveProperty("matchId");
    expect(firstCard).toHaveProperty("type");

    // Verify pairs exist
    const matchIds = (result as any).cards.map((c: any) => c.matchId);
    const uniqueMatchIds = new Set(matchIds);
    expect(matchIds.length).toBe(uniqueMatchIds.size * 2); // Each matchId should appear twice
  }, 30000);

  it("should generate a catchy game title", async () => {
    const title = await generateGameTitle("Physics", "Quiz");

    expect(title).toBeDefined();
    expect(typeof title).toBe("string");
    expect(title.length).toBeGreaterThan(0);
    expect(title.length).toBeLessThan(100);
  }, 15000);

  it("should generate a game description", async () => {
    const description = await generateGameDescription("History", "RPG", "Advanced");

    expect(description).toBeDefined();
    expect(typeof description).toBe("string");
    expect(description.length).toBeGreaterThan(0);
    expect(description.length).toBeLessThan(500);
  }, 15000);

  it("should handle additional instructions", async () => {
    const result = await generateGameContent({
      topic: "Chemistry",
      difficulty: "Intermediate",
      complexity: "Basic",
      format: "Quiz",
      durationMinutes: 10,
      language: "English",
      additionalInstructions: "Focus on the periodic table and atomic structure",
    });

    expect(result).toBeDefined();
    expect(result).toHaveProperty("questions");
    expect(Array.isArray((result as any).questions)).toBe(true);
  }, 30000);
});
