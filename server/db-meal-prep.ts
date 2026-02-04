import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  mealPrepSessions,
  mealPrepChecklist,
  mealPrepProgress,
  mealPrepContainers,
  InsertMealPrepSession,
  InsertMealPrepChecklist,
  InsertMealPrepProgress,
  InsertMealPrepContainer,
} from "../drizzle/schema";
import { getDb } from "./db";

// Meal Prep Sessions

export async function createMealPrepSession(
  userId: number,
  title: string,
  date: Date,
  duration?: number,
  description?: string,
  recipes?: number[],
  ingredients?: string[]
): Promise<any> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(mealPrepSessions).values({
    userId,
    title,
    date,
    duration,
    description,
    recipes: recipes ? JSON.stringify(recipes) : null,
    ingredients: ingredients ? JSON.stringify(ingredients) : null,
  });

  return { id: result[0].insertId, title, date };
}

export async function getMealPrepSessions(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const sessions = await db
    .select()
    .from(mealPrepSessions)
    .where(eq(mealPrepSessions.userId, userId));

  return sessions;
}

export async function getMealPrepSessionDetails(sessionId: number) {
  const db = await getDb();
  if (!db) return null;

  const session = await db
    .select()
    .from(mealPrepSessions)
    .where(eq(mealPrepSessions.id, sessionId))
    .limit(1);

  if (!session.length) return null;

  const checklist = await db
    .select()
    .from(mealPrepChecklist)
    .where(eq(mealPrepChecklist.sessionId, sessionId));

  const progress = await db
    .select()
    .from(mealPrepProgress)
    .where(eq(mealPrepProgress.sessionId, sessionId));

  return { ...session[0], checklist, progress };
}

export async function updateMealPrepSessionStatus(
  sessionId: number,
  status: "planned" | "in_progress" | "completed" | "cancelled"
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(mealPrepSessions)
    .set({ status })
    .where(eq(mealPrepSessions.id, sessionId));
}

// Meal Prep Checklist

export async function addChecklistItem(
  sessionId: number,
  task: string,
  order: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(mealPrepChecklist).values({
    sessionId,
    task,
    order,
  });
}

export async function completeChecklistItem(itemId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(mealPrepChecklist)
    .set({ completed: 1 })
    .where(eq(mealPrepChecklist.id, itemId));
}

// Meal Prep Progress

export async function createMealPrepProgress(
  sessionId: number,
  userId: number,
  recipeId?: number,
  notes?: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(mealPrepProgress).values({
    sessionId,
    userId,
    recipeId,
    notes,
  });
}

export async function updateMealPrepProgress(
  progressId: number,
  status: "not_started" | "in_progress" | "completed",
  timeSpent?: number,
  photoUrl?: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(mealPrepProgress)
    .set({ status, timeSpent, photoUrl })
    .where(eq(mealPrepProgress.id, progressId));
}

// Meal Prep Containers

export async function createMealPrepContainer(
  userId: number,
  mealName: string,
  quantity: number,
  containerType: string,
  prepDate: Date,
  expiryDate: Date,
  location: string,
  notes?: string,
  photoUrl?: string
): Promise<any> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(mealPrepContainers).values({
    userId,
    mealName,
    quantity,
    containerType,
    prepDate,
    expiryDate,
    location,
    notes,
    photoUrl,
  });

  return { id: result[0].insertId, mealName };
}

export async function getMealPrepContainers(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const containers = await db
    .select()
    .from(mealPrepContainers)
    .where(eq(mealPrepContainers.userId, userId));

  return containers;
}

export async function updateContainerLocation(
  containerId: number,
  location: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(mealPrepContainers)
    .set({ location })
    .where(eq(mealPrepContainers.id, containerId));
}

export async function deleteContainer(containerId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Note: In production, you might want to soft delete or archive instead
  await db
    .delete(mealPrepContainers)
    .where(eq(mealPrepContainers.id, containerId));
}
