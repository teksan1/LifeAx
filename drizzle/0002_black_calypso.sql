CREATE TABLE `conversation_analysis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`userId` int NOT NULL,
	`stressLevel` int NOT NULL DEFAULT 0,
	`riskLevel` int NOT NULL DEFAULT 0,
	`sentiment` varchar(50) NOT NULL,
	`emotionalKeywords` text,
	`decisionRisks` text,
	`interventionNeeded` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conversation_analysis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meal_plan_days` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mealPlanId` int NOT NULL,
	`dayOfWeek` int NOT NULL,
	`date` timestamp NOT NULL,
	`breakfast` text,
	`lunch` text,
	`dinner` text,
	`snacks` text,
	CONSTRAINT `meal_plan_days_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meal_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`dietaryPreferences` text,
	`restrictions` text,
	`budget` int,
	`servings` int NOT NULL DEFAULT 2,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `meal_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recipes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`servings` int NOT NULL DEFAULT 2,
	`prepTime` int,
	`cookTime` int,
	`difficulty` enum('easy','medium','hard') NOT NULL DEFAULT 'medium',
	`ingredients` text,
	`instructions` text,
	`tools` text,
	`nutritionInfo` text,
	`photoUrl` varchar(500),
	`dietaryTags` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `recipes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shopping_list_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mealPlanId` int NOT NULL,
	`itemName` varchar(255) NOT NULL,
	`quantity` varchar(100) NOT NULL,
	`unit` varchar(50) NOT NULL,
	`store` enum('coles','woolworths') NOT NULL,
	`price` int,
	`category` varchar(100) NOT NULL,
	`purchased` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `shopping_list_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `conversation_analysis` ADD CONSTRAINT `conversation_analysis_conversationId_conversations_id_fk` FOREIGN KEY (`conversationId`) REFERENCES `conversations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `conversation_analysis` ADD CONSTRAINT `conversation_analysis_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `meal_plan_days` ADD CONSTRAINT `meal_plan_days_mealPlanId_meal_plans_id_fk` FOREIGN KEY (`mealPlanId`) REFERENCES `meal_plans`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `meal_plans` ADD CONSTRAINT `meal_plans_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `shopping_list_items` ADD CONSTRAINT `shopping_list_items_mealPlanId_meal_plans_id_fk` FOREIGN KEY (`mealPlanId`) REFERENCES `meal_plans`(`id`) ON DELETE cascade ON UPDATE no action;