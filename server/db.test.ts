import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "./db";
import type { InsertGame } from "../drizzle/schema";

describe("Database Operations", () => {
  let testGameId: number;
  let testUserId: number;

  beforeAll(async () => {
    // Create a test user
    await db.upsertUser({
      openId: "test-user-db-ops",
      name: "Test User",
      email: "test@example.com",
      loginMethod: "manus",
    });

    const user = await db.getUserByOpenId("test-user-db-ops");
    if (!user) throw new Error("Failed to create test user");
    testUserId = user.id;
  });

  describe("Game Operations", () => {
    it("should create a new game", async () => {
      const newGame: InsertGame = {
        title: "Test Game",
        description: "A test game for unit testing",
        topic: "Mathematics",
        tags: JSON.stringify(["Test", "Math"]),
        difficulty: "Beginner",
        complexity: "Basic",
        format: "Quiz",
        durationMinutes: 10,
        language: "English",
        thumbnailUrl: "/images/test.jpg",
        createdById: testUserId,
      };

      const result = await db.createGame(newGame);
      expect(result).toBeDefined();
    });

    it("should retrieve all games", async () => {
      const games = await db.getAllGames();
      expect(games).toBeDefined();
      expect(Array.isArray(games)).toBe(true);
      expect(games.length).toBeGreaterThan(0);
      
      // Store the first game ID for later tests
      testGameId = games[0].id;
    });

    it("should retrieve a game by ID", async () => {
      const game = await db.getGameById(testGameId);
      expect(game).toBeDefined();
      expect(game?.id).toBe(testGameId);
    });

    it("should update game play count", async () => {
      const gameBefore = await db.getGameById(testGameId);
      const playsBefore = gameBefore?.playsCount ?? 0;

      await db.updateGameStats(testGameId, "playsCount", 1);

      const gameAfter = await db.getGameById(testGameId);
      expect(gameAfter?.playsCount).toBe(playsBefore + 1);
    });

    it("should update game likes count", async () => {
      const gameBefore = await db.getGameById(testGameId);
      const likesBefore = gameBefore?.likesCount ?? 0;

      await db.updateGameStats(testGameId, "likesCount", 1);

      const gameAfter = await db.getGameById(testGameId);
      expect(gameAfter?.likesCount).toBe(likesBefore + 1);
    });
  });

  describe("Bookmark Operations", () => {
    it("should add a bookmark", async () => {
      await db.addBookmark(testUserId, testGameId);
      const isBookmarked = await db.isGameBookmarked(testUserId, testGameId);
      expect(isBookmarked).toBe(true);
    });

    it("should retrieve user bookmarks", async () => {
      const bookmarks = await db.getUserBookmarks(testUserId);
      expect(bookmarks).toBeDefined();
      expect(Array.isArray(bookmarks)).toBe(true);
      expect(bookmarks.length).toBeGreaterThan(0);
    });

    it("should get games with bookmark status", async () => {
      const games = await db.getGamesWithBookmarkStatus(testUserId);
      expect(games).toBeDefined();
      expect(Array.isArray(games)).toBe(true);
      
      const bookmarkedGame = games.find(g => g.id === testGameId);
      expect(bookmarkedGame?.isBookmarked).toBe(true);
    });

    it("should remove a bookmark", async () => {
      await db.removeBookmark(testUserId, testGameId);
      const isBookmarked = await db.isGameBookmarked(testUserId, testGameId);
      expect(isBookmarked).toBe(false);
    });
  });

  describe("User Operations", () => {
    it("should upsert a user", async () => {
      await db.upsertUser({
        openId: "test-user-upsert",
        name: "Upsert Test",
        email: "upsert@example.com",
        loginMethod: "manus",
      });

      const user = await db.getUserByOpenId("test-user-upsert");
      expect(user).toBeDefined();
      expect(user?.name).toBe("Upsert Test");
    });

    it("should update existing user on upsert", async () => {
      await db.upsertUser({
        openId: "test-user-upsert",
        name: "Updated Name",
        email: "updated@example.com",
        loginMethod: "manus",
      });

      const user = await db.getUserByOpenId("test-user-upsert");
      expect(user).toBeDefined();
      expect(user?.name).toBe("Updated Name");
      expect(user?.email).toBe("updated@example.com");
    });
  });
});
