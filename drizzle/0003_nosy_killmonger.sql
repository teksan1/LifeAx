CREATE TABLE `meal_prep_checklist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`task` varchar(255) NOT NULL,
	`completed` int NOT NULL DEFAULT 0,
	`order` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `meal_prep_checklist_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meal_prep_containers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`mealName` varchar(255) NOT NULL,
	`quantity` int NOT NULL,
	`containerType` varchar(100) NOT NULL,
	`prepDate` timestamp NOT NULL,
	`expiryDate` timestamp NOT NULL,
	`location` varchar(100) NOT NULL,
	`notes` text,
	`photoUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `meal_prep_containers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meal_prep_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`userId` int NOT NULL,
	`recipeId` int,
	`status` enum('not_started','in_progress','completed') NOT NULL DEFAULT 'not_started',
	`timeSpent` int,
	`notes` text,
	`photoUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `meal_prep_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meal_prep_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`date` timestamp NOT NULL,
	`duration` int,
	`status` enum('planned','in_progress','completed','cancelled') NOT NULL DEFAULT 'planned',
	`recipes` text,
	`ingredients` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `meal_prep_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `meal_prep_checklist` ADD CONSTRAINT `meal_prep_checklist_sessionId_meal_prep_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `meal_prep_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `meal_prep_containers` ADD CONSTRAINT `meal_prep_containers_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `meal_prep_progress` ADD CONSTRAINT `meal_prep_progress_sessionId_meal_prep_sessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `meal_prep_sessions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `meal_prep_progress` ADD CONSTRAINT `meal_prep_progress_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `meal_prep_sessions` ADD CONSTRAINT `meal_prep_sessions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;