import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";

// Mock axios
vi.mock("axios");
const mockedAxios = vi.mocked(axios);

// Import after mocking
import { generateGameSpec, generateGameTitle, generateGameDescription } from "./ai-game-generator";

describe("AI Game Generator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateGameSpec", () => {
    it("should generate a valid quiz game spec for basic complexity", async () => {
      const mockQuizSpec = {
        version: "1.0",
        metadata: {
          title: "Math Quiz Challenge",
          description: "Test your math skills",
          subject: "Mathematics",
          topic: "Algebra",
          difficulty: "beginner",
          complexity: "basic",
          estimatedMinutes: 10,
          learningObjectives: ["Understand basic algebra"],
          tags: ["math", "algebra"],
          language: "English"
        },
        theme: {
          primaryColor: "#B6EBE7",
          secondaryColor: "#7DD3C8",
          background: { type: "gradient", value: "linear-gradient(135deg, #B6EBE7 0%, #7DD3C8 100%)" },
          icon: "🧮",
          mood: "playful"
        },
        config: {
          gameType: "quiz",
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
        },
        content: {
          sections: [{
            id: "main",
            title: "Quiz",
            type: "quiz",
            content: {
              type: "quiz",
              questions: [
                {
                  id: "q1",
                  question: "What is 2 + 2?",
                  questionType: "single-choice",
                  options: [
                    { id: "opt0", text: "3" },
                    { id: "opt1", text: "4" },
                    { id: "opt2", text: "5" },
                    { id: "opt3", text: "6" }
                  ],
                  correctAnswer: 1,
                  explanation: "2 + 2 = 4",
                  points: 10
                }
              ]
            }
          }]
        },
        progression: {
          type: "linear",
          sectionOrder: ["main"],
          showProgress: true
        },
        scoring: {
          maxScore: 100,
          pointsPerCorrect: 10,
          penaltyPerWrong: 0,
          timeBonus: false,
          streakMultiplier: 1,
          ratings: [
            { minPercentage: 90, label: "Excellent", message: "Outstanding!", stars: 3 },
            { minPercentage: 70, label: "Good", message: "Well done!", stars: 2 },
            { minPercentage: 0, label: "Needs Work", message: "Try again!", stars: 0 }
          ]
        }
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: {
          choices: [{
            message: {
              content: JSON.stringify(mockQuizSpec)
            }
          }]
        }
      });

      const result = await generateGameSpec({
        topic: "Algebra",
        subject: "Mathematics",
        difficulty: "beginner",
        complexity: "basic",
        durationMinutes: 10,
        language: "English"
      });

      expect(result).toBeDefined();
      expect(result.version).toBe("1.0");
      expect(result.metadata.title).toBe("Math Quiz Challenge");
      expect(result.config.gameType).toBe("quiz");
      expect(result.content.sections).toHaveLength(1);
      expect(result.content.sections[0].type).toBe("quiz");
    });

    it("should generate a simulation game spec for standard complexity", async () => {
      const mockSimSpec = {
        version: "1.0",
        metadata: {
          title: "Farm Manager",
          description: "Manage your farm resources",
          subject: "Agriculture",
          topic: "Farming",
          difficulty: "intermediate",
          complexity: "standard",
          estimatedMinutes: 20,
          learningObjectives: ["Understand resource management"],
          tags: ["farming", "simulation"],
          language: "English"
        },
        theme: {
          primaryColor: "#B6EBE7",
          secondaryColor: "#7DD3C8",
          background: { type: "gradient", value: "linear-gradient(135deg, #B6EBE7 0%, #7DD3C8 100%)" },
          icon: "🌾",
          mood: "calm"
        },
        config: {
          gameType: "simulation",
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
        },
        content: {
          sections: [{
            id: "main",
            title: "Farm Simulation",
            type: "simulation",
            content: {
              type: "simulation",
              initialState: {
                turn: 0,
                resources: { money: 1000, seeds: 50 },
                variables: {},
                unlockedActions: [],
                completedObjectives: []
              },
              resources: [
                { id: "money", name: "Money", icon: "💰", initialValue: 1000, minValue: 0, maxValue: 10000, description: "Your funds" },
                { id: "seeds", name: "Seeds", icon: "🌱", initialValue: 50, minValue: 0, maxValue: 500, description: "Planting seeds" }
              ],
              actions: [
                { id: "plant", name: "Plant Crops", description: "Plant seeds", icon: "🌱", cost: { seeds: 10 }, effects: { money: 50 } }
              ],
              events: [],
              objectives: [
                { id: "obj1", description: "Earn 5000 money", type: "reach-value", target: "money", value: 5000, required: true, points: 100 }
              ],
              maxTurns: 20
            }
          }]
        },
        progression: {
          type: "linear",
          sectionOrder: ["main"],
          showProgress: true
        },
        scoring: {
          maxScore: 100,
          pointsPerCorrect: 10,
          penaltyPerWrong: 0,
          timeBonus: false,
          streakMultiplier: 1,
          ratings: [
            { minPercentage: 90, label: "Excellent", message: "Outstanding!", stars: 3 },
            { minPercentage: 0, label: "Needs Work", message: "Try again!", stars: 0 }
          ]
        }
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: {
          choices: [{
            message: {
              content: JSON.stringify(mockSimSpec)
            }
          }]
        }
      });

      const result = await generateGameSpec({
        topic: "Farming",
        subject: "Agriculture",
        difficulty: "intermediate",
        complexity: "standard",
        durationMinutes: 20,
        language: "English"
      });

      expect(result).toBeDefined();
      expect(result.config.gameType).toBe("simulation");
      expect(result.content.sections[0].type).toBe("simulation");
    });

    it("should generate a narrative game spec for complex complexity", async () => {
      const mockNarrativeSpec = {
        version: "1.0",
        metadata: {
          title: "History Adventure",
          description: "Journey through ancient Rome",
          subject: "History",
          topic: "Roman Empire",
          difficulty: "advanced",
          complexity: "complex",
          estimatedMinutes: 30,
          learningObjectives: ["Learn about Roman history"],
          tags: ["history", "rome"],
          language: "English"
        },
        theme: {
          primaryColor: "#B6EBE7",
          secondaryColor: "#7DD3C8",
          background: { type: "gradient", value: "linear-gradient(135deg, #B6EBE7 0%, #7DD3C8 100%)" },
          icon: "🏛️",
          mood: "adventurous"
        },
        config: {
          gameType: "narrative",
          timeLimit: 0,
          questionTimeLimit: 0,
          allowSkip: true,
          allowBack: false,
          hintsEnabled: true,
          maxHints: 3,
          lives: 0,
          shuffleContent: false,
          feedbackType: "immediate",
          showCorrectAnswer: true
        },
        content: {
          sections: [{
            id: "main",
            title: "The Roman Journey",
            type: "narrative",
            content: {
              type: "narrative",
              scenes: [
                {
                  id: "scene1",
                  text: "You arrive in ancient Rome...",
                  choices: [
                    { id: "c1", text: "Visit the Colosseum", targetScene: "scene2" },
                    { id: "c2", text: "Go to the Forum", targetScene: "scene3" }
                  ]
                },
                {
                  id: "scene2",
                  text: "The Colosseum stands before you...",
                  isEnding: true,
                  endingType: "success"
                },
                {
                  id: "scene3",
                  text: "The Forum is bustling...",
                  isEnding: true,
                  endingType: "success"
                }
              ],
              startScene: "scene1"
            }
          }]
        },
        progression: {
          type: "branching",
          startSection: "main",
          showProgress: true
        },
        scoring: {
          maxScore: 100,
          pointsPerCorrect: 10,
          penaltyPerWrong: 0,
          timeBonus: false,
          streakMultiplier: 1,
          ratings: [
            { minPercentage: 90, label: "Excellent", message: "Outstanding!", stars: 3 },
            { minPercentage: 0, label: "Needs Work", message: "Try again!", stars: 0 }
          ]
        }
      };

      mockedAxios.post.mockResolvedValueOnce({
        data: {
          choices: [{
            message: {
              content: JSON.stringify(mockNarrativeSpec)
            }
          }]
        }
      });

      const result = await generateGameSpec({
        topic: "Roman Empire",
        subject: "History",
        difficulty: "advanced",
        complexity: "complex",
        durationMinutes: 30,
        language: "English",
        customPrompt: "Create an adventure through ancient Rome"
      });

      expect(result).toBeDefined();
      expect(result.config.gameType).toBe("narrative");
      expect(result.content.sections[0].type).toBe("narrative");
    });

    it("should handle markdown-wrapped JSON responses", async () => {
      const mockSpec = {
        version: "1.0",
        metadata: {
          title: "Test Game",
          description: "A test",
          subject: "Test",
          topic: "Testing",
          difficulty: "beginner",
          complexity: "basic",
          estimatedMinutes: 5,
          learningObjectives: [],
          tags: [],
          language: "English"
        },
        theme: {
          primaryColor: "#B6EBE7",
          secondaryColor: "#7DD3C8",
          background: { type: "solid", value: "#fff" },
          icon: "🎮",
          mood: "playful"
        },
        config: {
          gameType: "quiz",
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
        },
        content: {
          sections: [{
            id: "main",
            title: "Quiz",
            type: "quiz",
            content: {
              type: "quiz",
              questions: []
            }
          }]
        },
        progression: {
          type: "linear",
          sectionOrder: ["main"],
          showProgress: true
        },
        scoring: {
          maxScore: 100,
          pointsPerCorrect: 10,
          penaltyPerWrong: 0,
          timeBonus: false,
          streakMultiplier: 1,
          ratings: []
        }
      };

      // Wrap in markdown code block
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          choices: [{
            message: {
              content: "```json\n" + JSON.stringify(mockSpec) + "\n```"
            }
          }]
        }
      });

      const result = await generateGameSpec({
        topic: "Testing",
        subject: "Test",
        difficulty: "beginner",
        complexity: "basic",
        durationMinutes: 5
      });

      expect(result).toBeDefined();
      expect(result.metadata.title).toBe("Test Game");
    });

    it("should throw error on API failure", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("API Error"));
      mockedAxios.isAxiosError = vi.fn().mockReturnValue(false);

      await expect(generateGameSpec({
        topic: "Test",
        subject: "Test",
        difficulty: "beginner",
        complexity: "basic",
        durationMinutes: 5
      })).rejects.toThrow("Failed to generate game specification");
    });
  });

  describe("generateGameTitle", () => {
    it("should generate a title for a game", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          choices: [{
            message: {
              content: "Math Masters Challenge"
            }
          }]
        }
      });

      const title = await generateGameTitle("Algebra", "quiz");
      expect(title).toBe("Math Masters Challenge");
    });

    it("should remove quotes from title", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          choices: [{
            message: {
              content: '"Quoted Title"'
            }
          }]
        }
      });

      const title = await generateGameTitle("Test", "quiz");
      expect(title).toBe("Quoted Title");
    });

    it("should return fallback on error", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("API Error"));

      const title = await generateGameTitle("Algebra", "quiz");
      expect(title).toBe("Algebra Challenge");
    });
  });

  describe("generateGameDescription", () => {
    it("should generate a description for a game", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          choices: [{
            message: {
              content: "Test your algebra skills with this fun quiz!"
            }
          }]
        }
      });

      const desc = await generateGameDescription("Algebra", "quiz", "beginner");
      expect(desc).toBe("Test your algebra skills with this fun quiz!");
    });

    it("should return fallback on error", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("API Error"));

      const desc = await generateGameDescription("Algebra", "quiz", "beginner");
      expect(desc).toBe("A beginner level quiz game about Algebra.");
    });
  });
});
