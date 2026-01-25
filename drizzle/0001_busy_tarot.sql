CREATE TABLE `calendar_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`startTime` datetime NOT NULL,
	`endTime` datetime NOT NULL,
	`location` varchar(255),
	`color` varchar(7) DEFAULT '#FF0000',
	`isRecurring` boolean DEFAULT false,
	`recurrenceRule` varchar(255),
	`reminders` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `calendar_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`role` enum('user','assistant','system') NOT NULL,
	`content` longtext NOT NULL,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `engagement_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` datetime NOT NULL,
	`tasksCompleted` int DEFAULT 0,
	`chatInteractions` int DEFAULT 0,
	`therapySessionsCompleted` int DEFAULT 0,
	`averageMood` decimal(3,2),
	`productivityScore` decimal(5,2),
	`sleepQuality` decimal(3,2),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `engagement_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patterns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`patternType` varchar(100) NOT NULL,
	`description` text,
	`frequency` varchar(50),
	`confidence` decimal(3,2),
	`data` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `patterns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('pending','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`dueDate` datetime,
	`completedAt` datetime,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `therapy_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`frequency` enum('daily','weekly','biweekly','monthly') NOT NULL DEFAULT 'weekly',
	`intensity` enum('light','moderate','deep') NOT NULL DEFAULT 'moderate',
	`style` enum('reflective','analytical','supportive','challenging') NOT NULL DEFAULT 'reflective',
	`reportingStyle` enum('summary','detailed','insights') NOT NULL DEFAULT 'summary',
	`autoIncludeActivities` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `therapy_config_id` PRIMARY KEY(`id`),
	CONSTRAINT `therapy_config_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `therapy_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255),
	`frequency` enum('daily','weekly','biweekly','monthly') NOT NULL DEFAULT 'weekly',
	`intensity` enum('light','moderate','deep') NOT NULL DEFAULT 'moderate',
	`style` enum('reflective','analytical','supportive','challenging') NOT NULL DEFAULT 'reflective',
	`reportingStyle` enum('summary','detailed','insights') NOT NULL DEFAULT 'summary',
	`sessionContent` longtext,
	`insights` longtext,
	`mood` varchar(50),
	`energyLevel` int,
	`activitiesIncluded` json,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `therapy_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`autonomyLevel` enum('suggest','auto','manual') NOT NULL DEFAULT 'suggest',
	`enableNotifications` boolean DEFAULT true,
	`enableReminders` boolean DEFAULT true,
	`enableTherapyInsights` boolean DEFAULT true,
	`theme` enum('dark','light') NOT NULL DEFAULT 'dark',
	`language` varchar(10) DEFAULT 'en',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_preferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sleepTime` varchar(5),
	`wakeTime` varchar(5),
	`bio` text,
	`avatar` varchar(512),
	`timezone` varchar(64) DEFAULT 'UTC',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `calendar_events` ADD CONSTRAINT `calendar_events_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `engagement_metrics` ADD CONSTRAINT `engagement_metrics_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `patterns` ADD CONSTRAINT `patterns_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `therapy_config` ADD CONSTRAINT `therapy_config_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `therapy_sessions` ADD CONSTRAINT `therapy_sessions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_preferences` ADD CONSTRAINT `user_preferences_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_profiles` ADD CONSTRAINT `user_profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;