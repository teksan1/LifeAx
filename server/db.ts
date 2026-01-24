import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, conversations, messages, tasks, calendarEvents, notifications, habits, recommendations, Conversation, Message, Task, CalendarEvent, Notification, Habit, Recommendation, InsertConversation, InsertMessage, InsertTask, InsertCalendarEvent, InsertNotification, InsertHabit, InsertRecommendation } from "../drizzle/schema";
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

// Chat queries
export async function createConversation(userId: number, title: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(conversations).values({ userId, title });
  return result;
}

export async function getConversations(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(conversations).where(eq(conversations.userId, userId)).orderBy(desc(conversations.updatedAt));
  return result;
}

export async function addMessage(conversationId: number, role: "user" | "assistant", content: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(messages).values({ conversationId, role, content });
  return result;
}

export async function getMessages(conversationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
  return result;
}

// Task queries
export async function createTask(userId: number, title: string, description?: string, priority?: string, dueDate?: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(tasks).values({ userId, title, description, priority: (priority as any) || "medium", dueDate });
  return result;
}

export async function getTasks(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.dueDate));
  return result;
}

export async function updateTask(taskId: number, updates: Partial<InsertTask>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tasks).set(updates).where(eq(tasks.id, taskId));
}

export async function deleteTask(taskId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(tasks).where(eq(tasks.id, taskId));
}

// Calendar queries
export async function createCalendarEvent(userId: number, title: string, startTime: Date, endTime: Date, description?: string, location?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(calendarEvents).values({ userId, title, startTime, endTime, description, location });
  return result;
}

export async function getCalendarEvents(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(calendarEvents).where(eq(calendarEvents.userId, userId)).orderBy(calendarEvents.startTime);
  return result;
}

export async function updateCalendarEvent(eventId: number, updates: Partial<InsertCalendarEvent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(calendarEvents).set(updates).where(eq(calendarEvents.id, eventId));
}

export async function deleteCalendarEvent(eventId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(calendarEvents).where(eq(calendarEvents.id, eventId));
}

// Notification queries
export async function createNotification(userId: number, title: string, content: string, type: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(notifications).values({ userId, title, content, type: (type as any) });
  return result;
}

export async function getNotifications(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  return result;
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notifications).set({ read: 1 }).where(eq(notifications.id, notificationId));
}

// Habit queries
export async function createHabit(userId: number, name: string, frequency: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(habits).values({ userId, name, frequency: (frequency as any) });
  return result;
}

export async function getHabits(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(habits).where(eq(habits.userId, userId));
  return result;
}

// Recommendation queries
export async function createRecommendation(userId: number, title: string, content: string, category: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(recommendations).values({ userId, title, content, category });
  return result;
}

export async function getRecommendations(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(recommendations).where(eq(recommendations.userId, userId)).orderBy(desc(recommendations.createdAt));
  return result;
}
