import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Chat Procedures", () => {
  it("should create a conversation", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.chat.createConversation({ title: "Test Conversation" });
    expect(result).toBeDefined();
  });

  it("should list conversations for a user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const conversations = await caller.chat.getConversations();
    expect(Array.isArray(conversations)).toBe(true);
  });
});

describe("Task Procedures", () => {
  it("should create a task", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tasks.create({
      title: "Test Task",
      description: "Test Description",
      priority: "high",
      dueDate: new Date(Date.now() + 86400000),
    });
    expect(result).toBeDefined();
  });

  it("should list tasks for a user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const tasks = await caller.tasks.list();
    expect(Array.isArray(tasks)).toBe(true);
  });

  it("should update a task", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tasks.update({
      id: 1,
      title: "Updated Task",
      completed: 1,
    });
    expect(result.success).toBe(true);
  });

  it("should delete a task", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.tasks.delete({ id: 1 });
    expect(result.success).toBe(true);
  });
});

describe("Calendar Procedures", () => {
  it("should create a calendar event", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const now = new Date();
    const result = await caller.calendar.createEvent({
      title: "Test Event",
      startTime: now,
      endTime: new Date(now.getTime() + 3600000),
      description: "Test Description",
      location: "Test Location",
    });
    expect(result).toBeDefined();
  });

  it("should list calendar events for a user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const events = await caller.calendar.getEvents();
    expect(Array.isArray(events)).toBe(true);
  });

  it("should update a calendar event", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.calendar.updateEvent({
      id: 1,
      title: "Updated Event",
    });
    expect(result.success).toBe(true);
  });

  it("should delete a calendar event", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.calendar.deleteEvent({ id: 1 });
    expect(result.success).toBe(true);
  });
});

describe("Notification Procedures", () => {
  it("should list notifications for a user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const notifications = await caller.notifications.list();
    expect(Array.isArray(notifications)).toBe(true);
  });

  it("should mark notification as read", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.notifications.markAsRead({ id: 1 });
    expect(result.success).toBe(true);
  });
});

describe("Recommendations Procedures", () => {
  it("should list recommendations for a user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const recommendations = await caller.recommendations.list();
    expect(Array.isArray(recommendations)).toBe(true);
  });
});

describe("Habits Procedures", () => {
  it("should create a habit", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.habits.create({
      name: "Morning Exercise",
      frequency: "daily",
    });
    expect(result).toBeDefined();
  });

  it("should list habits for a user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const habits = await caller.habits.list();
    expect(Array.isArray(habits)).toBe(true);
  });
});
