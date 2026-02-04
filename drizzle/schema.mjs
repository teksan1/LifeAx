"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mealPrepContainers = exports.mealPrepProgress = exports.mealPrepChecklist = exports.mealPrepSessions = exports.shoppingListItems = exports.recipes = exports.mealPlanDays = exports.mealPlans = exports.conversationAnalysis = exports.recommendations = exports.habits = exports.notifications = exports.calendarEvents = exports.tasks = exports.messages = exports.conversations = exports.users = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
exports.users = (0, mysql_core_1.mysqlTable)("users", {
    /**
     * Surrogate primary key. Auto-incremented numeric value managed by the database.
     * Use this for relations between tables.
     */
    id: (0, mysql_core_1.int)("id").autoincrement().primaryKey(),
    /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
    openId: (0, mysql_core_1.varchar)("openId", { length: 64 }).notNull().unique(),
    name: (0, mysql_core_1.text)("name"),
    email: (0, mysql_core_1.varchar)("email", { length: 320 }),
    loginMethod: (0, mysql_core_1.varchar)("loginMethod", { length: 64 }),
    role: (0, mysql_core_1.mysqlEnum)("role", ["user", "admin"]).default("user").notNull(),
    createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: (0, mysql_core_1.timestamp)("lastSignedIn").defaultNow().notNull(),
});
// Conversations table for chat history
exports.conversations = (0, mysql_core_1.mysqlTable)("conversations", {
    id: (0, mysql_core_1.int)("id").autoincrement().primaryKey(),
    userId: (0, mysql_core_1.int)("userId").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    title: (0, mysql_core_1.varchar)("title", { length: 255 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull(),
});
// Messages table for individual chat messages
exports.messages = (0, mysql_core_1.mysqlTable)("messages", {
    id: (0, mysql_core_1.int)("id").autoincrement().primaryKey(),
    conversationId: (0, mysql_core_1.int)("conversationId").notNull().references(() => exports.conversations.id, { onDelete: "cascade" }),
    role: (0, mysql_core_1.mysqlEnum)("role", ["user", "assistant"]).notNull(),
    content: (0, mysql_core_1.text)("content").notNull(),
    createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow().notNull(),
});
// Tasks table with priorities and due dates
exports.tasks = (0, mysql_core_1.mysqlTable)("tasks", {
    id: (0, mysql_core_1.int)("id").autoincrement().primaryKey(),
    userId: (0, mysql_core_1.int)("userId").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    title: (0, mysql_core_1.varchar)("title", { length: 255 }).notNull(),
    description: (0, mysql_core_1.text)("description"),
    priority: (0, mysql_core_1.mysqlEnum)("priority", ["low", "medium", "high"]).default("medium").notNull(),
    dueDate: (0, mysql_core_1.timestamp)("dueDate"),
    completed: (0, mysql_core_1.int)("completed").default(0).notNull(),
    createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull(),
});
// Calendar events table
exports.calendarEvents = (0, mysql_core_1.mysqlTable)("calendar_events", {
    id: (0, mysql_core_1.int)("id").autoincrement().primaryKey(),
    userId: (0, mysql_core_1.int)("userId").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    title: (0, mysql_core_1.varchar)("title", { length: 255 }).notNull(),
    description: (0, mysql_core_1.text)("description"),
    startTime: (0, mysql_core_1.timestamp)("startTime").notNull(),
    endTime: (0, mysql_core_1.timestamp)("endTime").notNull(),
    location: (0, mysql_core_1.varchar)("location", { length: 255 }),
    createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull(),
});
// Notifications table
exports.notifications = (0, mysql_core_1.mysqlTable)("notifications", {
    id: (0, mysql_core_1.int)("id").autoincrement().primaryKey(),
    userId: (0, mysql_core_1.int)("userId").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    title: (0, mysql_core_1.varchar)("title", { length: 255 }).notNull(),
    content: (0, mysql_core_1.text)("content").notNull(),
    type: (0, mysql_core_1.mysqlEnum)("type", ["task_reminder", "event_reminder", "recommendation", "milestone"]).notNull(),
    read: (0, mysql_core_1.int)("read").default(0).notNull(),
    createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow().notNull(),
});
// Habits table for tracking and analysis
exports.habits = (0, mysql_core_1.mysqlTable)("habits", {
    id: (0, mysql_core_1.int)("id").autoincrement().primaryKey(),
    userId: (0, mysql_core_1.int)("userId").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull(),
    frequency: (0, mysql_core_1.mysqlEnum)("frequency", ["daily", "weekly", "monthly"]).notNull(),
    completedDates: (0, mysql_core_1.text)("completedDates"), // JSON array of dates
    createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull(),
});
// Recommendations table for AI-generated insights
exports.recommendations = (0, mysql_core_1.mysqlTable)("recommendations", {
    id: (0, mysql_core_1.int)("id").autoincrement().primaryKey(),
    userId: (0, mysql_core_1.int)("userId").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    title: (0, mysql_core_1.varchar)("title", { length: 255 }).notNull(),
    content: (0, mysql_core_1.text)("content").notNull(),
    category: (0, mysql_core_1.varchar)("category", { length: 100 }).notNull(), // e.g., 'productivity', 'health', 'learning'
    createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow().notNull(),
});
// Conversation analysis for emotional intelligence
exports.conversationAnalysis = (0, mysql_core_1.mysqlTable)("conversation_analysis", {
    id: (0, mysql_core_1.int)("id").autoincrement().primaryKey(),
    conversationId: (0, mysql_core_1.int)("conversationId").notNull().references(() => exports.conversations.id, { onDelete: "cascade" }),
    userId: (0, mysql_core_1.int)("userId").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    stressLevel: (0, mysql_core_1.int)("stressLevel").default(0).notNull(),
    riskLevel: (0, mysql_core_1.int)("riskLevel").default(0).notNull(),
    sentiment: (0, mysql_core_1.varchar)("sentiment", { length: 50 }).notNull(),
    emotionalKeywords: (0, mysql_core_1.text)("emotionalKeywords"),
    decisionRisks: (0, mysql_core_1.text)("decisionRisks"),
    interventionNeeded: (0, mysql_core_1.int)("interventionNeeded").default(0).notNull(),
    createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow().notNull(),
});
// Meal plans table
exports.mealPlans = (0, mysql_core_1.mysqlTable)("meal_plans", {
    id: (0, mysql_core_1.int)("id").autoincrement().primaryKey(),
    userId: (0, mysql_core_1.int)("userId").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    title: (0, mysql_core_1.varchar)("title", { length: 255 }).notNull(),
    startDate: (0, mysql_core_1.timestamp)("startDate").notNull(),
    endDate: (0, mysql_core_1.timestamp)("endDate").notNull(),
    dietaryPreferences: (0, mysql_core_1.text)("dietaryPreferences"),
    restrictions: (0, mysql_core_1.text)("restrictions"),
    budget: (0, mysql_core_1.int)("budget"),
    servings: (0, mysql_core_1.int)("servings").default(2).notNull(),
    createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull(),
});
// Meal plan days
exports.mealPlanDays = (0, mysql_core_1.mysqlTable)("meal_plan_days", {
    id: (0, mysql_core_1.int)("id").autoincrement().primaryKey(),
    mealPlanId: (0, mysql_core_1.int)("mealPlanId").notNull().references(() => exports.mealPlans.id, { onDelete: "cascade" }),
    dayOfWeek: (0, mysql_core_1.int)("dayOfWeek").notNull(),
    date: (0, mysql_core_1.timestamp)("date").notNull(),
    breakfast: (0, mysql_core_1.text)("breakfast"),
    lunch: (0, mysql_core_1.text)("lunch"),
    dinner: (0, mysql_core_1.text)("dinner"),
    snacks: (0, mysql_core_1.text)("snacks"),
});
// Recipes database
exports.recipes = (0, mysql_core_1.mysqlTable)("recipes", {
    id: (0, mysql_core_1.int)("id").autoincrement().primaryKey(),
    title: (0, mysql_core_1.varchar)("title", { length: 255 }).notNull(),
    description: (0, mysql_core_1.text)("description"),
    servings: (0, mysql_core_1.int)("servings").default(2).notNull(),
    prepTime: (0, mysql_core_1.int)("prepTime"),
    cookTime: (0, mysql_core_1.int)("cookTime"),
    difficulty: (0, mysql_core_1.mysqlEnum)("difficulty", ["easy", "medium", "hard"]).default("medium").notNull(),
    ingredients: (0, mysql_core_1.text)("ingredients"),
    instructions: (0, mysql_core_1.text)("instructions"),
    tools: (0, mysql_core_1.text)("tools"),
    nutritionInfo: (0, mysql_core_1.text)("nutritionInfo"),
    photoUrl: (0, mysql_core_1.varchar)("photoUrl", { length: 500 }),
    dietaryTags: (0, mysql_core_1.text)("dietaryTags"),
    createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow().notNull(),
});
// Shopping list items
exports.shoppingListItems = (0, mysql_core_1.mysqlTable)("shopping_list_items", {
    id: (0, mysql_core_1.int)("id").autoincrement().primaryKey(),
    mealPlanId: (0, mysql_core_1.int)("mealPlanId").notNull().references(() => exports.mealPlans.id, { onDelete: "cascade" }),
    itemName: (0, mysql_core_1.varchar)("itemName", { length: 255 }).notNull(),
    quantity: (0, mysql_core_1.varchar)("quantity", { length: 100 }).notNull(),
    unit: (0, mysql_core_1.varchar)("unit", { length: 50 }).notNull(),
    store: (0, mysql_core_1.mysqlEnum)("store", ["coles", "woolworths"]).notNull(),
    price: (0, mysql_core_1.int)("price"),
    category: (0, mysql_core_1.varchar)("category", { length: 100 }).notNull(),
    purchased: (0, mysql_core_1.int)("purchased").default(0).notNull(),
    createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow().notNull(),
});
// Meal prep sessions table
exports.mealPrepSessions = (0, mysql_core_1.mysqlTable)("meal_prep_sessions", {
    id: (0, mysql_core_1.int)("id").autoincrement().primaryKey(),
    userId: (0, mysql_core_1.int)("userId").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    title: (0, mysql_core_1.varchar)("title", { length: 255 }).notNull(),
    description: (0, mysql_core_1.text)("description"),
    date: (0, mysql_core_1.timestamp)("date").notNull(),
    duration: (0, mysql_core_1.int)("duration"), // in minutes
    status: (0, mysql_core_1.mysqlEnum)("status", ["planned", "in_progress", "completed", "cancelled"]).default("planned").notNull(),
    recipes: (0, mysql_core_1.text)("recipes"), // JSON array of recipe IDs
    ingredients: (0, mysql_core_1.text)("ingredients"), // JSON array of ingredients
    notes: (0, mysql_core_1.text)("notes"),
    createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull(),
});
// Meal prep checklist items
exports.mealPrepChecklist = (0, mysql_core_1.mysqlTable)("meal_prep_checklist", {
    id: (0, mysql_core_1.int)("id").autoincrement().primaryKey(),
    sessionId: (0, mysql_core_1.int)("sessionId").notNull().references(() => exports.mealPrepSessions.id, { onDelete: "cascade" }),
    task: (0, mysql_core_1.varchar)("task", { length: 255 }).notNull(),
    completed: (0, mysql_core_1.int)("completed").default(0).notNull(),
    order: (0, mysql_core_1.int)("order").notNull(),
    createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow().notNull(),
});
// Meal prep progress tracking
exports.mealPrepProgress = (0, mysql_core_1.mysqlTable)("meal_prep_progress", {
    id: (0, mysql_core_1.int)("id").autoincrement().primaryKey(),
    sessionId: (0, mysql_core_1.int)("sessionId").notNull().references(() => exports.mealPrepSessions.id, { onDelete: "cascade" }),
    userId: (0, mysql_core_1.int)("userId").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    recipeId: (0, mysql_core_1.int)("recipeId"),
    status: (0, mysql_core_1.mysqlEnum)("status", ["not_started", "in_progress", "completed"]).default("not_started").notNull(),
    timeSpent: (0, mysql_core_1.int)("timeSpent"), // in minutes
    notes: (0, mysql_core_1.text)("notes"),
    photoUrl: (0, mysql_core_1.varchar)("photoUrl", { length: 500 }),
    createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull(),
});
// Meal prep storage/containers
exports.mealPrepContainers = (0, mysql_core_1.mysqlTable)("meal_prep_containers", {
    id: (0, mysql_core_1.int)("id").autoincrement().primaryKey(),
    userId: (0, mysql_core_1.int)("userId").notNull().references(() => exports.users.id, { onDelete: "cascade" }),
    mealName: (0, mysql_core_1.varchar)("mealName", { length: 255 }).notNull(),
    quantity: (0, mysql_core_1.int)("quantity").notNull(),
    containerType: (0, mysql_core_1.varchar)("containerType", { length: 100 }).notNull(), // glass, plastic, etc.
    prepDate: (0, mysql_core_1.timestamp)("prepDate").notNull(),
    expiryDate: (0, mysql_core_1.timestamp)("expiryDate").notNull(),
    location: (0, mysql_core_1.varchar)("location", { length: 100 }).notNull(), // fridge, freezer, etc.
    notes: (0, mysql_core_1.text)("notes"),
    photoUrl: (0, mysql_core_1.varchar)("photoUrl", { length: 500 }),
    createdAt: (0, mysql_core_1.timestamp)("createdAt").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updatedAt").defaultNow().onUpdateNow().notNull(),
});
