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

describe("Meal Prep Features", () => {
  it("creates a meal prep session", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.mealPrep.createSession({
      title: "Sunday Meal Prep",
      date: new Date(),
      duration: 120,
      description: "Prep for the week",
    });

    expect(result).toBeDefined();
    expect(result.title).toBe("Sunday Meal Prep");
  });

  it("lists meal prep sessions", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const sessions = await caller.mealPrep.listSessions();

    expect(Array.isArray(sessions)).toBe(true);
  });

  it("updates meal prep session status", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.mealPrep.updateStatus({
      sessionId: 1,
      status: "in_progress",
    });

    expect(result.success).toBe(true);
  });

  it("adds checklist item to session", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.mealPrep.addChecklistItem({
      sessionId: 1,
      task: "Chop vegetables",
      order: 1,
    });

    expect(result.success).toBe(true);
  });

  it("completes checklist item", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.mealPrep.completeChecklistItem({
      itemId: 1,
    });

    expect(result.success).toBe(true);
  });

  it("creates meal prep progress", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.mealPrep.createProgress({
      sessionId: 1,
      recipeId: 1,
      notes: "Cooking chicken",
    });

    expect(result.success).toBe(true);
  });

  it("updates meal prep progress", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.mealPrep.updateProgress({
      progressId: 1,
      status: "completed",
      timeSpent: 45,
    });

    expect(result.success).toBe(true);
  });
});

describe("Meal Prep Container Features", () => {
  it("creates a meal prep container", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.mealPrepContainers.createContainer({
      mealName: "Chicken & Rice",
      quantity: 3,
      containerType: "glass",
      prepDate: new Date(),
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      location: "fridge",
      notes: "Reheat at 350°F",
    });

    expect(result).toBeDefined();
    expect(result.mealName).toBe("Chicken & Rice");
  });

  it("lists meal prep containers", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const containers = await caller.mealPrepContainers.listContainers();

    expect(Array.isArray(containers)).toBe(true);
  });

  it("updates container location", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.mealPrepContainers.updateLocation({
      containerId: 1,
      location: "freezer",
    });

    expect(result.success).toBe(true);
  });

  it("deletes a container", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.mealPrepContainers.deleteContainer({
      containerId: 1,
    });

    expect(result.success).toBe(true);
  });
});
