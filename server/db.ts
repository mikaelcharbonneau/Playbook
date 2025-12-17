import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, games, InsertGame, bookmarks, InsertBookmark } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ===== Game Queries =====

export async function createGame(game: InsertGame) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(games).values(game);
  return result;
}

export async function getAllGames() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(games).orderBy(desc(games.createdAt));
}

export async function getGameById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(games).where(eq(games.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateGameStats(gameId: number, field: 'likesCount' | 'playsCount', increment: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(games)
    .set({ [field]: sql`${games[field]} + ${increment}` })
    .where(eq(games.id, gameId));
}

export async function deleteGame(gameId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(games).where(eq(games.id, gameId));
}

// ===== Bookmark Queries =====

export async function getUserBookmarks(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(bookmarks)
    .where(eq(bookmarks.userId, userId));

  return result;
}

export async function isGameBookmarked(userId: number, gameId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.gameId, gameId)))
    .limit(1);

  return result.length > 0;
}

export async function addBookmark(userId: number, gameId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(bookmarks).values({ userId, gameId });
}

export async function removeBookmark(userId: number, gameId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(bookmarks).where(
    and(eq(bookmarks.userId, userId), eq(bookmarks.gameId, gameId))
  );
}

export async function getGamesWithBookmarkStatus(userId: number | null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const allGames = await getAllGames();
  
  if (!userId) {
    return allGames.map(game => ({ ...game, isBookmarked: false }));
  }

  const userBookmarks = await getUserBookmarks(userId);
  const bookmarkedGameIds = new Set(userBookmarks.map(b => b.gameId));

  return allGames.map(game => ({
    ...game,
    isBookmarked: bookmarkedGameIds.has(game.id),
  }));
}
