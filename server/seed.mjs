import { drizzle } from "drizzle-orm/mysql2";
import { games, users } from "../drizzle/schema.js";
import dotenv from "dotenv";

dotenv.config();

const MOCK_USERS = [
  {
    openId: "mock-user-1",
    name: "MathWhiz",
    email: "mathwhiz@example.com",
    loginMethod: "manus",
  },
  {
    openId: "mock-user-2",
    name: "ScienceGuru",
    email: "scienceguru@example.com",
    loginMethod: "manus",
  },
  {
    openId: "mock-user-3",
    name: "PolyglotPro",
    email: "polyglotpro@example.com",
    loginMethod: "manus",
  },
  {
    openId: "mock-user-4",
    name: "HistoryBuff",
    email: "historybuff@example.com",
    loginMethod: "manus",
  },
];

const MOCK_GAMES = [
  {
    title: "Algebra Basics: Solving for X",
    description: "Master the fundamentals of linear equations in this quick 5-minute quiz.",
    topic: "Mathematics",
    tags: JSON.stringify(["Algebra", "Beginner", "Quiz"]),
    difficulty: "Beginner",
    complexity: "Basic",
    format: "Quiz",
    durationMinutes: 5,
    language: "English",
    thumbnailUrl: "/images/game-thumb-math.jpg",
    likesCount: 1240,
    playsCount: 5400,
    createdById: 1,
  },
  {
    title: "French Vocabulary: Animals",
    description: "Learn the names of 20 common animals in French with these interactive flashcards.",
    topic: "Languages and Literature",
    tags: JSON.stringify(["French", "Vocabulary", "Flashcards"]),
    difficulty: "Beginner",
    complexity: "Basic",
    format: "Flashcards",
    durationMinutes: 10,
    language: "French",
    thumbnailUrl: "/images/game-thumb-language.jpg",
    likesCount: 850,
    playsCount: 3200,
    createdById: 3,
  },
  {
    title: "Newton's Racing Challenge",
    description: "Race against time! Solve physics problems to boost your car's speed and learn about velocity and acceleration.",
    topic: "Physics",
    tags: JSON.stringify(["Physics", "Racing", "Intermediate"]),
    difficulty: "Intermediate",
    complexity: "Normal",
    format: "Racing",
    durationMinutes: 15,
    language: "English",
    thumbnailUrl: "/images/game-thumb-science.jpg",
    likesCount: 2100,
    playsCount: 8900,
    createdById: 2,
  },
  {
    title: "World Capitals Speed Run",
    description: "How many world capitals can you name in 2 minutes?",
    topic: "Geography",
    tags: JSON.stringify(["Geography", "Speed", "Quiz"]),
    difficulty: "Intermediate",
    complexity: "Basic",
    format: "Quiz",
    durationMinutes: 2,
    language: "English",
    thumbnailUrl: "/images/game-thumb-language.jpg",
    likesCount: 3400,
    playsCount: 12000,
    createdById: 3,
  },
  {
    title: "Code Typer: Python Edition",
    description: "Type real Python code to defeat bugs and learn syntax in this fast-paced typing game.",
    topic: "Computer Science",
    tags: JSON.stringify(["Python", "Coding", "Beginner"]),
    difficulty: "Beginner",
    complexity: "Normal",
    format: "Simulation",
    durationMinutes: 20,
    language: "English",
    thumbnailUrl: "/images/game-thumb-math.jpg",
    likesCount: 1800,
    playsCount: 6700,
    createdById: 1,
  },
  {
    title: "Advanced Calculus: Derivatives",
    description: "Deep dive into differentiation rules and applications.",
    topic: "Mathematics",
    tags: JSON.stringify(["Calculus", "Advanced", "Quiz"]),
    difficulty: "Advanced",
    complexity: "Basic",
    format: "Quiz",
    durationMinutes: 30,
    language: "English",
    thumbnailUrl: "/images/game-thumb-math.jpg",
    likesCount: 560,
    playsCount: 1500,
    createdById: 1,
  },
  {
    title: "Spanish Conversation Starters",
    description: "Practice common greetings and introductions in Spanish.",
    topic: "Languages and Literature",
    tags: JSON.stringify(["Spanish", "Speaking", "Scenario"]),
    difficulty: "Beginner",
    complexity: "Basic",
    format: "Scenario",
    durationMinutes: 10,
    language: "Spanish",
    thumbnailUrl: "/images/game-thumb-language.jpg",
    likesCount: 920,
    playsCount: 4100,
    createdById: 3,
  },
  {
    title: "Chronicles of Rome: The Senate",
    description: "Roleplay as a Roman Senator. Complete missions, make political alliances, and learn about the fall of the Republic.",
    topic: "History",
    tags: JSON.stringify(["History", "RPG", "Advanced"]),
    difficulty: "Advanced",
    complexity: "Complex",
    format: "RPG",
    durationMinutes: 45,
    language: "English",
    thumbnailUrl: "/images/game-thumb-science.jpg",
    likesCount: 1450,
    playsCount: 5600,
    createdById: 4,
  },
];

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const db = drizzle(process.env.DATABASE_URL);

  console.log("🌱 Seeding database...");

  // Insert mock users
  console.log("Inserting users...");
  for (const user of MOCK_USERS) {
    await db.insert(users).values(user).onDuplicateKeyUpdate({
      set: { name: user.name },
    });
  }

  // Insert mock games
  console.log("Inserting games...");
  for (const game of MOCK_GAMES) {
    await db.insert(games).values(game);
  }

  console.log("✅ Seeding complete!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
