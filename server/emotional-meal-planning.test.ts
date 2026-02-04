import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("Emotional Intelligence Features", () => {
  it("analyzes conversation for emotional state", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.emotionalIntelligence.analyzeConversation({
      conversationId: 1,
      stressLevel: 75,
      riskLevel: 60,
      sentiment: "negative",
      emotionalKeywords: ["stressed", "worried"],
      decisionRisks: ["impulsive decision"],
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });
});

describe("Meal Planning Features", () => {
  it("creates a meal plan", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    const result = await caller.mealPlanning.createPlan({
      title: "Weekly Meal Prep",
      startDate,
      endDate,
      dietaryPreferences: ["Vegan"],
      restrictions: ["Gluten-Free"],
      budget: 10000,
      servings: 2,
    });

    expect(result).toBeDefined();
    expect(result.title).toBe("Weekly Meal Prep");
  });

  it("lists meal plans for user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const plans = await caller.mealPlanning.listPlans();

    expect(Array.isArray(plans)).toBe(true);
  });

  it.skip("generates a meal plan with AI", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.mealPlanning.generateMealPlan({
      dietaryPreferences: ["Vegetarian"],
      restrictions: [],
      servings: 2,
    });

    expect(result).toBeDefined();
  }, { timeout: 30000 });
});

describe("Shopping List Features", () => {
  it.skip("gets shopping list for meal plan", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const items = await caller.shopping.getList({
      mealPlanId: 1,
    });

    expect(Array.isArray(items)).toBe(true);
  });

  it.skip("calculates shopping list total", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const total = await caller.shopping.getTotal({
      mealPlanId: 1,
    });

    expect(total).toBeDefined();
    expect(total.total).toBeGreaterThanOrEqual(0);
    expect(total.formatted).toBeDefined();
  });
});
