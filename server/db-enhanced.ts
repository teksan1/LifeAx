import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  conversationAnalysis, 
  mealPlans, 
  mealPlanDays, 
  recipes, 
  shoppingListItems,
  InsertConversationAnalysis,
  InsertMealPlan,
  InsertMealPlanDay,
  InsertRecipe,
  InsertShoppingListItem
} from "../drizzle/schema";
import { getDb } from "./db";

// Emotional Intelligence Functions

export async function analyzeConversation(
  conversationId: number,
  userId: number,
  stressLevel: number,
  riskLevel: number,
  sentiment: string,
  emotionalKeywords: string[],
  decisionRisks: string[]
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const interventionNeeded = stressLevel > 70 || riskLevel > 75 ? 1 : 0;

  await db.insert(conversationAnalysis).values({
    conversationId,
    userId,
    stressLevel,
    riskLevel,
    sentiment,
    emotionalKeywords: JSON.stringify(emotionalKeywords),
    decisionRisks: JSON.stringify(decisionRisks),
    interventionNeeded,
  });
}

export async function getConversationAnalysis(conversationId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(conversationAnalysis)
    .where(eq(conversationAnalysis.conversationId, conversationId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

// Meal Planning Functions

export async function createMealPlan(
  userId: number,
  title: string,
  startDate: Date,
  endDate: Date,
  dietaryPreferences: string[],
  restrictions: string[],
  budget?: number,
  servings: number = 2
): Promise<any> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(mealPlans).values({
    userId,
    title,
    startDate,
    endDate,
    dietaryPreferences: JSON.stringify(dietaryPreferences),
    restrictions: JSON.stringify(restrictions),
    budget,
    servings,
  });

  return { id: result[0].insertId, title, startDate, endDate };
}

export async function getMealPlans(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const plans = await db
    .select()
    .from(mealPlans)
    .where(eq(mealPlans.userId, userId));

  return plans;
}

export async function getMealPlanDetails(mealPlanId: number) {
  const db = await getDb();
  if (!db) return null;

  const plan = await db
    .select()
    .from(mealPlans)
    .where(eq(mealPlans.id, mealPlanId))
    .limit(1);

  if (!plan.length) return null;

  const days = await db
    .select()
    .from(mealPlanDays)
    .where(eq(mealPlanDays.mealPlanId, mealPlanId));

  return { ...plan[0], days };
}

export async function addMealPlanDay(
  mealPlanId: number,
  dayOfWeek: number,
  date: Date,
  breakfast?: any,
  lunch?: any,
  dinner?: any,
  snacks?: any
): Promise<any> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(mealPlanDays).values({
    mealPlanId,
    dayOfWeek,
    date,
    breakfast: breakfast ? JSON.stringify(breakfast) : null,
    lunch: lunch ? JSON.stringify(lunch) : null,
    dinner: dinner ? JSON.stringify(dinner) : null,
    snacks: snacks ? JSON.stringify(snacks) : null,
  });
}

export async function addRecipe(
  title: string,
  description: string,
  servings: number,
  prepTime: number,
  cookTime: number,
  difficulty: "easy" | "medium" | "hard",
  ingredients: any[],
  instructions: any[],
  tools: string[],
  nutritionInfo: any,
  photoUrl?: string,
  dietaryTags: string[] = []
): Promise<any> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(recipes).values({
    title,
    description,
    servings,
    prepTime,
    cookTime,
    difficulty,
    ingredients: JSON.stringify(ingredients),
    instructions: JSON.stringify(instructions),
    tools: JSON.stringify(tools),
    nutritionInfo: JSON.stringify(nutritionInfo),
    photoUrl,
    dietaryTags: JSON.stringify(dietaryTags),
  });

  return { id: result[0].insertId, title };
}

export async function getRecipes(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.select().from(recipes).limit(limit);
  return result;
}

export async function addShoppingListItem(
  mealPlanId: number,
  itemName: string,
  quantity: string,
  unit: string,
  store: "coles" | "woolworths",
  price?: number,
  category: string = "other"
): Promise<any> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(shoppingListItems).values({
    mealPlanId,
    itemName,
    quantity,
    unit,
    store,
    price,
    category,
  });
}

export async function getShoppingList(mealPlanId: number) {
  const db = await getDb();
  if (!db) return [];

  const items = await db
    .select()
    .from(shoppingListItems)
    .where(eq(shoppingListItems.mealPlanId, mealPlanId));

  return items;
}

export async function markShoppingItemPurchased(itemId: number) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(shoppingListItems)
    .set({ purchased: 1 })
    .where(eq(shoppingListItems.id, itemId));
}

export async function getShoppingListTotal(mealPlanId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const items = await db
    .select()
    .from(shoppingListItems)
    .where(eq(shoppingListItems.mealPlanId, mealPlanId));

  return items.reduce((total, item) => total + (item.price || 0), 0);
}
