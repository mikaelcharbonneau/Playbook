import { pgTable, serial, text, timestamp, varchar, integer } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: serial("id").primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 20 }).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Games table - stores all learning games created by users or AI
 */
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  topic: varchar("topic", { length: 100 }).notNull(),
  tags: text("tags").notNull(), // JSON array stored as text
  difficulty: varchar("difficulty", { length: 50 }).notNull(),
  complexity: varchar("complexity", { length: 50 }).notNull(),
  format: varchar("format", { length: 50 }).notNull(),
  durationMinutes: integer("durationMinutes").notNull(),
  language: varchar("language", { length: 50 }).notNull().default("English"),
  thumbnailUrl: text("thumbnailUrl"),
  likesCount: integer("likesCount").notNull().default(0),
  playsCount: integer("playsCount").notNull().default(0),
  createdById: integer("createdById").notNull(),
  gameContent: text("gameContent"), // JSON string containing the actual game data (questions, scenarios, etc.)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Game = typeof games.$inferSelect;
export type InsertGame = typeof games.$inferInsert;

/**
 * User bookmarks - tracks which games users have bookmarked
 */
export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  gameId: integer("gameId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Bookmark = typeof bookmarks.$inferSelect;
export type InsertBookmark = typeof bookmarks.$inferInsert;