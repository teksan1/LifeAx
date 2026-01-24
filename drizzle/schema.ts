import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Conversations table for chat history
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

// Messages table for individual chat messages
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// Tasks table with priorities and due dates
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  dueDate: timestamp("dueDate"),
  completed: int("completed").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

// Calendar events table
export const calendarEvents = mysqlTable("calendar_events", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime").notNull(),
  location: varchar("location", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = typeof calendarEvents.$inferInsert;

// Notifications table
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  type: mysqlEnum("type", ["task_reminder", "event_reminder", "recommendation", "milestone"]).notNull(),
  read: int("read").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// Habits table for tracking and analysis
export const habits = mysqlTable("habits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  frequency: mysqlEnum("frequency", ["daily", "weekly", "monthly"]).notNull(),
  completedDates: text("completedDates"), // JSON array of dates
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Habit = typeof habits.$inferSelect;
export type InsertHabit = typeof habits.$inferInsert;

// Recommendations table for AI-generated insights
export const recommendations = mysqlTable("recommendations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }).notNull(), // e.g., 'productivity', 'health', 'learning'
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Recommendation = typeof recommendations.$inferSelect;
export type InsertRecommendation = typeof recommendations.$inferInsert;

// Conversation analysis for emotional intelligence
export const conversationAnalysis = mysqlTable("conversation_analysis", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  stressLevel: int("stressLevel").default(0).notNull(),
  riskLevel: int("riskLevel").default(0).notNull(),
  sentiment: varchar("sentiment", { length: 50 }).notNull(),
  emotionalKeywords: text("emotionalKeywords"),
  decisionRisks: text("decisionRisks"),
  interventionNeeded: int("interventionNeeded").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ConversationAnalysis = typeof conversationAnalysis.$inferSelect;
export type InsertConversationAnalysis = typeof conversationAnalysis.$inferInsert;

// Meal plans table
export const mealPlans = mysqlTable("meal_plans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  dietaryPreferences: text("dietaryPreferences"),
  restrictions: text("restrictions"),
  budget: int("budget"),
  servings: int("servings").default(2).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MealPlan = typeof mealPlans.$inferSelect;
export type InsertMealPlan = typeof mealPlans.$inferInsert;

// Meal plan days
export const mealPlanDays = mysqlTable("meal_plan_days", {
  id: int("id").autoincrement().primaryKey(),
  mealPlanId: int("mealPlanId").notNull().references(() => mealPlans.id, { onDelete: "cascade" }),
  dayOfWeek: int("dayOfWeek").notNull(),
  date: timestamp("date").notNull(),
  breakfast: text("breakfast"),
  lunch: text("lunch"),
  dinner: text("dinner"),
  snacks: text("snacks"),
});

export type MealPlanDay = typeof mealPlanDays.$inferSelect;
export type InsertMealPlanDay = typeof mealPlanDays.$inferInsert;

// Recipes database
export const recipes = mysqlTable("recipes", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  servings: int("servings").default(2).notNull(),
  prepTime: int("prepTime"),
  cookTime: int("cookTime"),
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).default("medium").notNull(),
  ingredients: text("ingredients"),
  instructions: text("instructions"),
  tools: text("tools"),
  nutritionInfo: text("nutritionInfo"),
  photoUrl: varchar("photoUrl", { length: 500 }),
  dietaryTags: text("dietaryTags"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = typeof recipes.$inferInsert;

// Shopping list items
export const shoppingListItems = mysqlTable("shopping_list_items", {
  id: int("id").autoincrement().primaryKey(),
  mealPlanId: int("mealPlanId").notNull().references(() => mealPlans.id, { onDelete: "cascade" }),
  itemName: varchar("itemName", { length: 255 }).notNull(),
  quantity: varchar("quantity", { length: 100 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  store: mysqlEnum("store", ["coles", "woolworths"]).notNull(),
  price: int("price"),
  category: varchar("category", { length: 100 }).notNull(),
  purchased: int("purchased").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ShoppingListItem = typeof shoppingListItems.$inferSelect;
export type InsertShoppingListItem = typeof shoppingListItems.$inferInsert;
