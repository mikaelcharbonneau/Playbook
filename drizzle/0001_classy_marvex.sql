CREATE TABLE `bookmarks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`gameId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bookmarks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `games` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`topic` varchar(100) NOT NULL,
	`tags` text NOT NULL,
	`difficulty` enum('Beginner','Intermediate','Advanced') NOT NULL,
	`complexity` enum('Basic','Normal','Complex') NOT NULL,
	`format` enum('Quiz','Flashcards','Memory','Puzzle','Racing','Simulation','Scenario','RPG','Strategy','Adventure','Other') NOT NULL,
	`durationMinutes` int NOT NULL,
	`language` varchar(50) NOT NULL DEFAULT 'English',
	`thumbnailUrl` text,
	`likesCount` int NOT NULL DEFAULT 0,
	`playsCount` int NOT NULL DEFAULT 0,
	`createdById` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `games_id` PRIMARY KEY(`id`)
);
