import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import * as aiGameGenerator from "./ai-game-generator";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  ai: router({
    generateGame: protectedProcedure
      .input(z.object({
        topic: z.string(),
        subject: z.string(),
        difficulty: z.enum(["beginner", "intermediate", "advanced"]),
        complexity: z.enum(["basic", "standard", "complex"]),
        durationMinutes: z.number(),
        language: z.string().optional(),
        customPrompt: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Generate complete game specification using AI
        const gameSpec = await aiGameGenerator.generateGameSpec({
          topic: input.topic,
          subject: input.subject,
          difficulty: input.difficulty,
          complexity: input.complexity,
          durationMinutes: input.durationMinutes,
          language: input.language,
          customPrompt: input.customPrompt,
        });

        // Map complexity to display format
        const complexityMap: Record<string, string> = {
          basic: "Basic",
          standard: "Normal",
          complex: "Complex"
        };

        // Map difficulty to display format
        const difficultyMap: Record<string, string> = {
          beginner: "Beginner",
          intermediate: "Intermediate",
          advanced: "Advanced"
        };

        // Determine format from game type
        const formatMap: Record<string, string> = {
          quiz: "Quiz",
          flashcard: "Flashcards",
          matching: "Memory",
          sorting: "Puzzle",
          "timed-challenge": "Quiz",
          simulation: "Simulation",
          narrative: "Scenario",
          exploration: "Adventure",
          puzzle: "Puzzle",
          sequence: "Puzzle"
        };

        const format = (formatMap[gameSpec.config.gameType] || "Other") as "Quiz" | "Flashcards" | "Memory" | "Puzzle" | "Racing" | "Simulation" | "Scenario" | "RPG" | "Strategy" | "Adventure" | "Other";
        const difficultyDisplay = difficultyMap[input.difficulty] as "Beginner" | "Intermediate" | "Advanced";
        const complexityDisplay = complexityMap[input.complexity] as "Basic" | "Normal" | "Complex";
        const tags = [format, difficultyDisplay, complexityDisplay, "AI Generated"];

        // Create the game in database with the full GameSpec
        await db.createGame({
          title: gameSpec.metadata.title,
          description: gameSpec.metadata.description,
          topic: input.topic,
          tags: JSON.stringify(tags),
          difficulty: difficultyDisplay,
          complexity: complexityDisplay,
          format: format,
          durationMinutes: input.durationMinutes,
          language: input.language || "English",
          thumbnailUrl: "/images/game-thumb-science.jpg",
          gameContent: JSON.stringify(gameSpec),
          createdById: ctx.user.id,
        });

        return {
          success: true,
          title: gameSpec.metadata.title,
          description: gameSpec.metadata.description,
          gameSpec,
        };
      }),

    // Endpoint for prompt-based generation
    generateFromPrompt: protectedProcedure
      .input(z.object({
        prompt: z.string(),
        subject: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Parse the prompt to extract parameters
        const promptLower = input.prompt.toLowerCase();
        
        // Detect difficulty
        let difficulty: "beginner" | "intermediate" | "advanced" = "intermediate";
        if (promptLower.includes("beginner") || promptLower.includes("easy") || promptLower.includes("basic")) {
          difficulty = "beginner";
        } else if (promptLower.includes("advanced") || promptLower.includes("hard") || promptLower.includes("expert")) {
          difficulty = "advanced";
        }

        // Detect complexity
        let complexity: "basic" | "standard" | "complex" = "basic";
        if (promptLower.includes("simulation") || promptLower.includes("strategy") || promptLower.includes("manage")) {
          complexity = "standard";
        } else if (promptLower.includes("story") || promptLower.includes("adventure") || promptLower.includes("rpg") || promptLower.includes("narrative")) {
          complexity = "complex";
        }

        // Estimate duration
        let durationMinutes = 10;
        if (complexity === "standard") durationMinutes = 20;
        if (complexity === "complex") durationMinutes = 30;

        // Generate the game
        const gameSpec = await aiGameGenerator.generateGameSpec({
          topic: input.prompt,
          subject: input.subject || "General",
          difficulty,
          complexity,
          durationMinutes,
          customPrompt: input.prompt,
        });

        // Map values for database
        const complexityMap: Record<string, string> = {
          basic: "Basic",
          standard: "Normal",
          complex: "Complex"
        };

        const difficultyMap: Record<string, string> = {
          beginner: "Beginner",
          intermediate: "Intermediate",
          advanced: "Advanced"
        };

        const formatMap: Record<string, string> = {
          quiz: "Quiz",
          flashcard: "Flashcards",
          matching: "Memory",
          sorting: "Puzzle",
          "timed-challenge": "Quiz",
          simulation: "Simulation",
          narrative: "Scenario",
          exploration: "Adventure",
          puzzle: "Puzzle",
          sequence: "Puzzle"
        };

        const format = (formatMap[gameSpec.config.gameType] || "Other") as "Quiz" | "Flashcards" | "Memory" | "Puzzle" | "Racing" | "Simulation" | "Scenario" | "RPG" | "Strategy" | "Adventure" | "Other";
        const difficultyDisplay = difficultyMap[difficulty] as "Beginner" | "Intermediate" | "Advanced";
        const complexityDisplay = complexityMap[complexity] as "Basic" | "Normal" | "Complex";
        const tags = [format, difficultyDisplay, complexityDisplay, "AI Generated"];

        await db.createGame({
          title: gameSpec.metadata.title,
          description: gameSpec.metadata.description,
          topic: gameSpec.metadata.topic,
          tags: JSON.stringify(tags),
          difficulty: difficultyDisplay,
          complexity: complexityDisplay,
          format: format,
          durationMinutes,
          language: "English",
          thumbnailUrl: "/images/game-thumb-science.jpg",
          gameContent: JSON.stringify(gameSpec),
          createdById: ctx.user.id,
        });

        return {
          success: true,
          title: gameSpec.metadata.title,
          description: gameSpec.metadata.description,
          gameSpec,
        };
      }),
  }),

  games: router({
    list: publicProcedure.query(async ({ ctx }) => {
      const userId = ctx.user?.id ?? null;
      const games = await db.getGamesWithBookmarkStatus(userId);
      return games.map(game => ({
        ...game,
        tags: JSON.parse(game.tags),
        difficulty: game.difficulty as "Beginner" | "Intermediate" | "Advanced",
        complexity: game.complexity as "Basic" | "Normal" | "Complex",
        format: game.format as "Quiz" | "Flashcards" | "Memory" | "Puzzle" | "Racing" | "Simulation" | "Scenario" | "RPG" | "Strategy" | "Adventure" | "Other",
      }));
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const game = await db.getGameById(input.id);
        if (!game) return null;
        return {
          ...game,
          tags: JSON.parse(game.tags),
          gameContent: game.gameContent ? JSON.parse(game.gameContent) : null,
          difficulty: game.difficulty as "Beginner" | "Intermediate" | "Advanced",
          complexity: game.complexity as "Basic" | "Normal" | "Complex",
          format: game.format as "Quiz" | "Flashcards" | "Memory" | "Puzzle" | "Racing" | "Simulation" | "Scenario" | "RPG" | "Strategy" | "Adventure" | "Other",
        };
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string(),
        topic: z.string(),
        tags: z.array(z.string()),
        difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
        complexity: z.enum(["Basic", "Normal", "Complex"]),
        format: z.enum(["Quiz", "Flashcards", "Memory", "Puzzle", "Racing", "Simulation", "Scenario", "RPG", "Strategy", "Adventure", "Other"]),
        durationMinutes: z.number(),
        language: z.string(),
        thumbnailUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createGame({
          ...input,
          tags: JSON.stringify(input.tags),
          createdById: ctx.user.id,
        });
        return { success: true };
      }),

    incrementPlays: publicProcedure
      .input(z.object({ gameId: z.number() }))
      .mutation(async ({ input }) => {
        await db.updateGameStats(input.gameId, 'playsCount', 1);
        return { success: true };
      }),

    incrementLikes: publicProcedure
      .input(z.object({ gameId: z.number() }))
      .mutation(async ({ input }) => {
        await db.updateGameStats(input.gameId, 'likesCount', 1);
        return { success: true };
      }),
  }),

  bookmarks: router({
    toggle: protectedProcedure
      .input(z.object({ gameId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const isBookmarked = await db.isGameBookmarked(ctx.user.id, input.gameId);
        if (isBookmarked) {
          await db.removeBookmark(ctx.user.id, input.gameId);
          return { isBookmarked: false };
        } else {
          await db.addBookmark(ctx.user.id, input.gameId);
          return { isBookmarked: true };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
