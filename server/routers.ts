import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import type { CreateGameInput } from "@shared/types";
import * as aiService from "./ai-service";

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
        difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
        complexity: z.enum(["Basic", "Normal", "Complex"]),
        format: z.enum(["Quiz", "Flashcards", "Memory", "Puzzle", "Racing", "Simulation", "Scenario", "RPG", "Strategy", "Adventure", "Other"]),
        durationMinutes: z.number(),
        language: z.string(),
        additionalInstructions: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Generate game content using AI
        const gameContent = await aiService.generateGameContent(input);
        const title = await aiService.generateGameTitle(input.topic, input.format);
        const description = await aiService.generateGameDescription(
          input.topic,
          input.format,
          input.difficulty
        );

        // Create the game in database
        const tags = [input.format, input.difficulty, input.complexity, "AI Generated"];
        await db.createGame({
          title,
          description,
          topic: input.topic,
          tags: JSON.stringify(tags),
          difficulty: input.difficulty,
          complexity: input.complexity,
          format: input.format,
          durationMinutes: input.durationMinutes,
          language: input.language,
          thumbnailUrl: "/images/game-thumb-science.jpg", // Default thumbnail
          gameContent: JSON.stringify(gameContent),
          createdById: ctx.user.id,
        });

        return {
          success: true,
          title,
          description,
          gameContent,
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
      }));
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
