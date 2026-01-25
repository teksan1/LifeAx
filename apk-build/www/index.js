// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
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
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  dueDate: timestamp("dueDate"),
  completed: int("completed").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var calendarEvents = mysqlTable("calendar_events", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  startTime: timestamp("startTime").notNull(),
  endTime: timestamp("endTime").notNull(),
  location: varchar("location", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  type: mysqlEnum("type", ["task_reminder", "event_reminder", "recommendation", "milestone"]).notNull(),
  read: int("read").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var habits = mysqlTable("habits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  frequency: mysqlEnum("frequency", ["daily", "weekly", "monthly"]).notNull(),
  completedDates: text("completedDates"),
  // JSON array of dates
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var recommendations = mysqlTable("recommendations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  // e.g., 'productivity', 'health', 'learning'
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var conversationAnalysis = mysqlTable("conversation_analysis", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  stressLevel: int("stressLevel").default(0).notNull(),
  riskLevel: int("riskLevel").default(0).notNull(),
  sentiment: varchar("sentiment", { length: 50 }).notNull(),
  emotionalKeywords: text("emotionalKeywords"),
  decisionRisks: text("decisionRisks"),
  interventionNeeded: int("interventionNeeded").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var mealPlans = mysqlTable("meal_plans", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var mealPlanDays = mysqlTable("meal_plan_days", {
  id: int("id").autoincrement().primaryKey(),
  mealPlanId: int("mealPlanId").notNull().references(() => mealPlans.id, { onDelete: "cascade" }),
  dayOfWeek: int("dayOfWeek").notNull(),
  date: timestamp("date").notNull(),
  breakfast: text("breakfast"),
  lunch: text("lunch"),
  dinner: text("dinner"),
  snacks: text("snacks")
});
var recipes = mysqlTable("recipes", {
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
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var shoppingListItems = mysqlTable("shopping_list_items", {
  id: int("id").autoincrement().primaryKey(),
  mealPlanId: int("mealPlanId").notNull().references(() => mealPlans.id, { onDelete: "cascade" }),
  itemName: varchar("itemName", { length: 255 }).notNull(),
  quantity: varchar("quantity", { length: 100 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  store: mysqlEnum("store", ["coles", "woolworths"]).notNull(),
  price: int("price"),
  category: varchar("category", { length: 100 }).notNull(),
  purchased: int("purchased").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var mealPrepSessions = mysqlTable("meal_prep_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  duration: int("duration"),
  // in minutes
  status: mysqlEnum("status", ["planned", "in_progress", "completed", "cancelled"]).default("planned").notNull(),
  recipes: text("recipes"),
  // JSON array of recipe IDs
  ingredients: text("ingredients"),
  // JSON array of ingredients
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var mealPrepChecklist = mysqlTable("meal_prep_checklist", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull().references(() => mealPrepSessions.id, { onDelete: "cascade" }),
  task: varchar("task", { length: 255 }).notNull(),
  completed: int("completed").default(0).notNull(),
  order: int("order").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var mealPrepProgress = mysqlTable("meal_prep_progress", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull().references(() => mealPrepSessions.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  recipeId: int("recipeId"),
  status: mysqlEnum("status", ["not_started", "in_progress", "completed"]).default("not_started").notNull(),
  timeSpent: int("timeSpent"),
  // in minutes
  notes: text("notes"),
  photoUrl: varchar("photoUrl", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var mealPrepContainers = mysqlTable("meal_prep_containers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  mealName: varchar("mealName", { length: 255 }).notNull(),
  quantity: int("quantity").notNull(),
  containerType: varchar("containerType", { length: 100 }).notNull(),
  // glass, plastic, etc.
  prepDate: timestamp("prepDate").notNull(),
  expiryDate: timestamp("expiryDate").notNull(),
  location: varchar("location", { length: 100 }).notNull(),
  // fridge, freezer, etc.
  notes: text("notes"),
  photoUrl: varchar("photoUrl", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/db.ts
var _db = null;
async function getDb() {
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
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createConversation(userId, title) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(conversations).values({ userId, title });
  return result;
}
async function getConversations(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(conversations).where(eq(conversations.userId, userId)).orderBy(desc(conversations.updatedAt));
  return result;
}
async function addMessage(conversationId, role, content) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(messages).values({ conversationId, role, content });
  return result;
}
async function getMessages(conversationId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
  return result;
}
async function createTask(userId, title, description, priority, dueDate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(tasks).values({ userId, title, description, priority: priority || "medium", dueDate });
  return result;
}
async function getTasks(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.dueDate));
  return result;
}
async function updateTask(taskId, updates) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tasks).set(updates).where(eq(tasks.id, taskId));
}
async function deleteTask(taskId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(tasks).where(eq(tasks.id, taskId));
}
async function createCalendarEvent(userId, title, startTime, endTime, description, location) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(calendarEvents).values({ userId, title, startTime, endTime, description, location });
  return result;
}
async function getCalendarEvents(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(calendarEvents).where(eq(calendarEvents.userId, userId)).orderBy(calendarEvents.startTime);
  return result;
}
async function updateCalendarEvent(eventId, updates) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(calendarEvents).set(updates).where(eq(calendarEvents.id, eventId));
}
async function deleteCalendarEvent(eventId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(calendarEvents).where(eq(calendarEvents.id, eventId));
}
async function getNotifications(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  return result;
}
async function markNotificationAsRead(notificationId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notifications).set({ read: 1 }).where(eq(notifications.id, notificationId));
}
async function createHabit(userId, name, frequency) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(habits).values({ userId, name, frequency });
  return result;
}
async function getHabits(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(habits).where(eq(habits.userId, userId));
  return result;
}
async function createRecommendation(userId, title, content, category) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(recommendations).values({ userId, title, content, category });
  return result;
}
async function getRecommendations(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(recommendations).where(eq(recommendations.userId, userId)).orderBy(desc(recommendations.createdAt));
  return result;
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
import { z as z4 } from "zod";

// server/_core/llm.ts
var ensureArray = (value) => Array.isArray(value) ? value : [value];
var normalizeContentPart = (part) => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }
  if (part.type === "text") {
    return part;
  }
  if (part.type === "image_url") {
    return part;
  }
  if (part.type === "file_url") {
    return part;
  }
  throw new Error("Unsupported message content part");
};
var normalizeMessage = (message) => {
  const { role, name, tool_call_id } = message;
  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content).map((part) => typeof part === "string" ? part : JSON.stringify(part)).join("\n");
    return {
      role,
      name,
      tool_call_id,
      content
    };
  }
  const contentParts = ensureArray(message.content).map(normalizeContentPart);
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text
    };
  }
  return {
    role,
    name,
    content: contentParts
  };
};
var normalizeToolChoice = (toolChoice, tools) => {
  if (!toolChoice) return void 0;
  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }
  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }
    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }
    return {
      type: "function",
      function: { name: tools[0].function.name }
    };
  }
  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name }
    };
  }
  return toolChoice;
};
var resolveApiUrl = () => ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0 ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions` : "https://forge.manus.im/v1/chat/completions";
var assertApiKey = () => {
  if (!ENV.forgeApiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
};
var normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema
}) => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (explicitFormat.type === "json_schema" && !explicitFormat.json_schema?.schema) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }
  const schema = outputSchema || output_schema;
  if (!schema) return void 0;
  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }
  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...typeof schema.strict === "boolean" ? { strict: schema.strict } : {}
    }
  };
};
async function invokeLLM(params) {
  assertApiKey();
  const {
    messages: messages2,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format
  } = params;
  const payload = {
    model: "gemini-2.5-flash",
    messages: messages2.map(normalizeMessage)
  };
  if (tools && tools.length > 0) {
    payload.tools = tools;
  }
  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }
  payload.max_tokens = 32768;
  payload.thinking = {
    "budget_tokens": 128
  };
  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema
  });
  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }
  const response = await fetch(resolveApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.forgeApiKey}`
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed: ${response.status} ${response.statusText} \u2013 ${errorText}`
    );
  }
  return await response.json();
}

// server/routers.ts
import { TRPCError as TRPCError4 } from "@trpc/server";

// server/routers-enhanced.ts
import { z as z2 } from "zod";
import { TRPCError as TRPCError3 } from "@trpc/server";

// server/db-enhanced.ts
import { eq as eq2 } from "drizzle-orm";
async function analyzeConversation(conversationId, userId, stressLevel, riskLevel, sentiment, emotionalKeywords, decisionRisks) {
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
    interventionNeeded
  });
}
async function createMealPlan(userId, title, startDate, endDate, dietaryPreferences, restrictions, budget, servings = 2) {
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
    servings
  });
  return { id: result[0].insertId, title, startDate, endDate };
}
async function getMealPlans(userId) {
  const db = await getDb();
  if (!db) return [];
  const plans = await db.select().from(mealPlans).where(eq2(mealPlans.userId, userId));
  return plans;
}
async function getShoppingList(mealPlanId) {
  const db = await getDb();
  if (!db) return [];
  const items = await db.select().from(shoppingListItems).where(eq2(shoppingListItems.mealPlanId, mealPlanId));
  return items;
}
async function getShoppingListTotal(mealPlanId) {
  const db = await getDb();
  if (!db) return 0;
  const items = await db.select().from(shoppingListItems).where(eq2(shoppingListItems.mealPlanId, mealPlanId));
  return items.reduce((total, item) => total + (item.price || 0), 0);
}

// server/routers-enhanced.ts
var emotionalIntelligenceRouter = router({
  analyzeConversation: protectedProcedure.input(
    z2.object({
      conversationId: z2.number(),
      stressLevel: z2.number().min(0).max(100),
      riskLevel: z2.number().min(0).max(100),
      sentiment: z2.enum(["positive", "neutral", "negative"]),
      emotionalKeywords: z2.array(z2.string()),
      decisionRisks: z2.array(z2.string())
    })
  ).mutation(async ({ ctx, input }) => {
    await analyzeConversation(
      input.conversationId,
      ctx.user.id,
      input.stressLevel,
      input.riskLevel,
      input.sentiment,
      input.emotionalKeywords,
      input.decisionRisks
    );
    return { success: true };
  })
});
var mealPlanningRouter = router({
  createPlan: protectedProcedure.input(
    z2.object({
      title: z2.string(),
      startDate: z2.date(),
      endDate: z2.date(),
      dietaryPreferences: z2.array(z2.string()),
      restrictions: z2.array(z2.string()),
      budget: z2.number().optional(),
      servings: z2.number().default(2)
    })
  ).mutation(async ({ ctx, input }) => {
    const result = await createMealPlan(
      ctx.user.id,
      input.title,
      input.startDate,
      input.endDate,
      input.dietaryPreferences,
      input.restrictions,
      input.budget,
      input.servings
    );
    return result;
  }),
  listPlans: protectedProcedure.query(async ({ ctx }) => {
    const plans = await getMealPlans(ctx.user.id);
    return plans;
  }),
  generateMealPlan: protectedProcedure.input(
    z2.object({
      dietaryPreferences: z2.array(z2.string()),
      restrictions: z2.array(z2.string()),
      servings: z2.number()
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You are a professional meal planner. Generate a detailed 7-day meal plan with breakfast, lunch, dinner, and snacks. Format as JSON."
          },
          {
            role: "user",
            content: `Create a 7-day meal plan. Preferences: ${input.dietaryPreferences.join(", ")}. Restrictions: ${input.restrictions.join(", ")}. Servings: ${input.servings}.`
          }
        ]
      });
      const messageContent = response.choices?.[0]?.message?.content;
      if (!messageContent || typeof messageContent !== "string")
        throw new Error("No response");
      return JSON.parse(messageContent);
    } catch (error) {
      console.error("Meal plan error:", error);
      throw new TRPCError3({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to generate meal plan"
      });
    }
  })
});
var shoppingRouter = router({
  getList: protectedProcedure.input(z2.object({ mealPlanId: z2.number() })).query(async ({ input }) => {
    const items = await getShoppingList(input.mealPlanId);
    return items;
  }),
  getTotal: protectedProcedure.input(z2.object({ mealPlanId: z2.number() })).query(async ({ input }) => {
    const total = await getShoppingListTotal(input.mealPlanId);
    return { total, formatted: `$${(total / 100).toFixed(2)}` };
  })
});

// server/routers-meal-prep.ts
import { z as z3 } from "zod";

// server/db-meal-prep.ts
import { eq as eq3 } from "drizzle-orm";
async function createMealPrepSession(userId, title, date, duration, description, recipes2, ingredients) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(mealPrepSessions).values({
    userId,
    title,
    date,
    duration,
    description,
    recipes: recipes2 ? JSON.stringify(recipes2) : null,
    ingredients: ingredients ? JSON.stringify(ingredients) : null
  });
  return { id: result[0].insertId, title, date };
}
async function getMealPrepSessions(userId) {
  const db = await getDb();
  if (!db) return [];
  const sessions = await db.select().from(mealPrepSessions).where(eq3(mealPrepSessions.userId, userId));
  return sessions;
}
async function getMealPrepSessionDetails(sessionId) {
  const db = await getDb();
  if (!db) return null;
  const session = await db.select().from(mealPrepSessions).where(eq3(mealPrepSessions.id, sessionId)).limit(1);
  if (!session.length) return null;
  const checklist = await db.select().from(mealPrepChecklist).where(eq3(mealPrepChecklist.sessionId, sessionId));
  const progress = await db.select().from(mealPrepProgress).where(eq3(mealPrepProgress.sessionId, sessionId));
  return { ...session[0], checklist, progress };
}
async function updateMealPrepSessionStatus(sessionId, status) {
  const db = await getDb();
  if (!db) return;
  await db.update(mealPrepSessions).set({ status }).where(eq3(mealPrepSessions.id, sessionId));
}
async function addChecklistItem(sessionId, task, order) {
  const db = await getDb();
  if (!db) return;
  await db.insert(mealPrepChecklist).values({
    sessionId,
    task,
    order
  });
}
async function completeChecklistItem(itemId) {
  const db = await getDb();
  if (!db) return;
  await db.update(mealPrepChecklist).set({ completed: 1 }).where(eq3(mealPrepChecklist.id, itemId));
}
async function createMealPrepProgress(sessionId, userId, recipeId, notes) {
  const db = await getDb();
  if (!db) return;
  await db.insert(mealPrepProgress).values({
    sessionId,
    userId,
    recipeId,
    notes
  });
}
async function updateMealPrepProgress(progressId, status, timeSpent, photoUrl) {
  const db = await getDb();
  if (!db) return;
  await db.update(mealPrepProgress).set({ status, timeSpent, photoUrl }).where(eq3(mealPrepProgress.id, progressId));
}
async function createMealPrepContainer(userId, mealName, quantity, containerType, prepDate, expiryDate, location, notes, photoUrl) {
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
    photoUrl
  });
  return { id: result[0].insertId, mealName };
}
async function getMealPrepContainers(userId) {
  const db = await getDb();
  if (!db) return [];
  const containers = await db.select().from(mealPrepContainers).where(eq3(mealPrepContainers.userId, userId));
  return containers;
}
async function updateContainerLocation(containerId, location) {
  const db = await getDb();
  if (!db) return;
  await db.update(mealPrepContainers).set({ location }).where(eq3(mealPrepContainers.id, containerId));
}
async function deleteContainer(containerId) {
  const db = await getDb();
  if (!db) return;
  await db.delete(mealPrepContainers).where(eq3(mealPrepContainers.id, containerId));
}

// server/routers-meal-prep.ts
var mealPrepRouter = router({
  createSession: protectedProcedure.input(
    z3.object({
      title: z3.string(),
      date: z3.date(),
      duration: z3.number().optional(),
      description: z3.string().optional(),
      recipes: z3.array(z3.number()).optional(),
      ingredients: z3.array(z3.string()).optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const result = await createMealPrepSession(
      ctx.user.id,
      input.title,
      input.date,
      input.duration,
      input.description,
      input.recipes,
      input.ingredients
    );
    return result;
  }),
  listSessions: protectedProcedure.query(async ({ ctx }) => {
    const sessions = await getMealPrepSessions(ctx.user.id);
    return sessions;
  }),
  getSessionDetails: protectedProcedure.input(z3.object({ sessionId: z3.number() })).query(async ({ input }) => {
    const details = await getMealPrepSessionDetails(input.sessionId);
    return details;
  }),
  updateStatus: protectedProcedure.input(
    z3.object({
      sessionId: z3.number(),
      status: z3.enum(["planned", "in_progress", "completed", "cancelled"])
    })
  ).mutation(async ({ input }) => {
    await updateMealPrepSessionStatus(input.sessionId, input.status);
    return { success: true };
  }),
  addChecklistItem: protectedProcedure.input(
    z3.object({
      sessionId: z3.number(),
      task: z3.string(),
      order: z3.number()
    })
  ).mutation(async ({ input }) => {
    await addChecklistItem(input.sessionId, input.task, input.order);
    return { success: true };
  }),
  completeChecklistItem: protectedProcedure.input(z3.object({ itemId: z3.number() })).mutation(async ({ input }) => {
    await completeChecklistItem(input.itemId);
    return { success: true };
  }),
  createProgress: protectedProcedure.input(
    z3.object({
      sessionId: z3.number(),
      recipeId: z3.number().optional(),
      notes: z3.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    await createMealPrepProgress(
      input.sessionId,
      ctx.user.id,
      input.recipeId,
      input.notes
    );
    return { success: true };
  }),
  updateProgress: protectedProcedure.input(
    z3.object({
      progressId: z3.number(),
      status: z3.enum(["not_started", "in_progress", "completed"]),
      timeSpent: z3.number().optional(),
      photoUrl: z3.string().optional()
    })
  ).mutation(async ({ input }) => {
    await updateMealPrepProgress(
      input.progressId,
      input.status,
      input.timeSpent,
      input.photoUrl
    );
    return { success: true };
  })
});
var mealPrepContainerRouter = router({
  createContainer: protectedProcedure.input(
    z3.object({
      mealName: z3.string(),
      quantity: z3.number(),
      containerType: z3.string(),
      prepDate: z3.date(),
      expiryDate: z3.date(),
      location: z3.string(),
      notes: z3.string().optional(),
      photoUrl: z3.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const result = await createMealPrepContainer(
      ctx.user.id,
      input.mealName,
      input.quantity,
      input.containerType,
      input.prepDate,
      input.expiryDate,
      input.location,
      input.notes,
      input.photoUrl
    );
    return result;
  }),
  listContainers: protectedProcedure.query(async ({ ctx }) => {
    const containers = await getMealPrepContainers(ctx.user.id);
    return containers;
  }),
  updateLocation: protectedProcedure.input(
    z3.object({
      containerId: z3.number(),
      location: z3.string()
    })
  ).mutation(async ({ input }) => {
    await updateContainerLocation(input.containerId, input.location);
    return { success: true };
  }),
  deleteContainer: protectedProcedure.input(z3.object({ containerId: z3.number() })).mutation(async ({ input }) => {
    await deleteContainer(input.containerId);
    return { success: true };
  })
});

// server/routers.ts
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  }),
  // Chat procedures
  chat: router({
    createConversation: protectedProcedure.input(z4.object({ title: z4.string() })).mutation(async ({ ctx, input }) => {
      const result = await createConversation(ctx.user.id, input.title);
      return result;
    }),
    getConversations: protectedProcedure.query(async ({ ctx }) => {
      const conversations2 = await getConversations(ctx.user.id);
      return conversations2;
    }),
    getMessages: protectedProcedure.input(z4.object({ conversationId: z4.number() })).query(async ({ input }) => {
      const messages2 = await getMessages(input.conversationId);
      return messages2;
    }),
    sendMessage: protectedProcedure.input(z4.object({
      conversationId: z4.number(),
      message: z4.string()
    })).mutation(async ({ ctx, input }) => {
      await addMessage(input.conversationId, "user", input.message);
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are LifeAx, a compassionate life optimization assistant. Provide personalized advice on productivity, health, relationships, and personal growth. Be concise, actionable, and supportive."
            },
            { role: "user", content: input.message }
          ]
        });
        const messageContent = response.choices?.[0]?.message?.content;
        const aiContent = typeof messageContent === "string" ? messageContent : "I couldn't generate a response. Please try again.";
        await addMessage(input.conversationId, "assistant", aiContent);
        return { success: true, response: aiContent };
      } catch (error) {
        console.error("LLM error:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Failed to generate response" });
      }
    })
  }),
  // Task procedures
  tasks: router({
    create: protectedProcedure.input(z4.object({
      title: z4.string(),
      description: z4.string().optional(),
      priority: z4.enum(["low", "medium", "high"]).optional(),
      dueDate: z4.date().optional()
    })).mutation(async ({ ctx, input }) => {
      const result = await createTask(
        ctx.user.id,
        input.title,
        input.description,
        input.priority,
        input.dueDate
      );
      return result;
    }),
    list: protectedProcedure.query(async ({ ctx }) => {
      const tasks2 = await getTasks(ctx.user.id);
      return tasks2;
    }),
    update: protectedProcedure.input(z4.object({
      id: z4.number(),
      title: z4.string().optional(),
      description: z4.string().optional(),
      priority: z4.enum(["low", "medium", "high"]).optional(),
      dueDate: z4.date().optional(),
      completed: z4.number().optional()
    })).mutation(async ({ input }) => {
      const { id, ...updates } = input;
      await updateTask(id, updates);
      return { success: true };
    }),
    delete: protectedProcedure.input(z4.object({ id: z4.number() })).mutation(async ({ input }) => {
      await deleteTask(input.id);
      return { success: true };
    })
  }),
  // Calendar procedures
  calendar: router({
    createEvent: protectedProcedure.input(z4.object({
      title: z4.string(),
      startTime: z4.date(),
      endTime: z4.date(),
      description: z4.string().optional(),
      location: z4.string().optional()
    })).mutation(async ({ ctx, input }) => {
      const result = await createCalendarEvent(
        ctx.user.id,
        input.title,
        input.startTime,
        input.endTime,
        input.description,
        input.location
      );
      return result;
    }),
    getEvents: protectedProcedure.query(async ({ ctx }) => {
      const events = await getCalendarEvents(ctx.user.id);
      return events;
    }),
    updateEvent: protectedProcedure.input(z4.object({
      id: z4.number(),
      title: z4.string().optional(),
      startTime: z4.date().optional(),
      endTime: z4.date().optional(),
      description: z4.string().optional(),
      location: z4.string().optional()
    })).mutation(async ({ input }) => {
      const { id, ...updates } = input;
      await updateCalendarEvent(id, updates);
      return { success: true };
    }),
    deleteEvent: protectedProcedure.input(z4.object({ id: z4.number() })).mutation(async ({ input }) => {
      await deleteCalendarEvent(input.id);
      return { success: true };
    })
  }),
  // Notification procedures
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const notifications2 = await getNotifications(ctx.user.id);
      return notifications2;
    }),
    markAsRead: protectedProcedure.input(z4.object({ id: z4.number() })).mutation(async ({ input }) => {
      await markNotificationAsRead(input.id);
      return { success: true };
    })
  }),
  // Recommendations procedures
  recommendations: router({
    generate: protectedProcedure.query(async ({ ctx }) => {
      try {
        const userTasks = await getTasks(ctx.user.id);
        const userHabits = await getHabits(ctx.user.id);
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are a life optimization advisor. Generate 3 personalized recommendations based on the user's tasks and habits. Format as JSON array with objects containing 'title', 'content', and 'category' fields."
            },
            {
              role: "user",
              content: `Based on these tasks: ${JSON.stringify(userTasks)} and habits: ${JSON.stringify(userHabits)}, generate 3 personalized recommendations for life optimization.`
            }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "recommendations",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        content: { type: "string" },
                        category: { type: "string" }
                      },
                      required: ["title", "content", "category"]
                    }
                  }
                },
                required: ["recommendations"]
              }
            }
          }
        });
        const messageContent = response.choices?.[0]?.message?.content;
        if (!messageContent || typeof messageContent !== "string") throw new Error("No response from LLM");
        const parsed = JSON.parse(messageContent);
        for (const rec of parsed.recommendations) {
          await createRecommendation(ctx.user.id, rec.title, rec.content, rec.category);
        }
        return parsed.recommendations;
      } catch (error) {
        console.error("Recommendation generation error:", error);
        throw new TRPCError4({ code: "INTERNAL_SERVER_ERROR", message: "Failed to generate recommendations" });
      }
    }),
    list: protectedProcedure.query(async ({ ctx }) => {
      const recommendations2 = await getRecommendations(ctx.user.id);
      return recommendations2;
    })
  }),
  // Habits procedures
  emotionalIntelligence: emotionalIntelligenceRouter,
  mealPlanning: mealPlanningRouter,
  shopping: shoppingRouter,
  mealPrep: mealPrepRouter,
  mealPrepContainers: mealPrepContainerRouter,
  habits: router({
    create: protectedProcedure.input(z4.object({
      name: z4.string(),
      frequency: z4.enum(["daily", "weekly", "monthly"])
    })).mutation(async ({ ctx, input }) => {
      const result = await createHabit(ctx.user.id, input.name, input.frequency);
      return result;
    }),
    list: protectedProcedure.query(async ({ ctx }) => {
      const habits2 = await getHabits(ctx.user.id);
      return habits2;
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs2 from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var PROJECT_ROOT = import.meta.dirname;
var LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
var MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
var TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}
function trimLogFile(logPath, maxSize) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }
    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines = [];
    let keptBytes = 0;
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}
`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }
    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
  }
}
function writeToLogFile(source, entries) {
  if (entries.length === 0) return;
  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);
  const lines = entries.map((entry) => {
    const ts = (/* @__PURE__ */ new Date()).toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });
  fs.appendFileSync(logPath, `${lines.join("\n")}
`, "utf-8");
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}
function vitePluginManusDebugCollector() {
  return {
    name: "manus-debug-collector",
    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true
            },
            injectTo: "head"
          }
        ]
      };
    },
    configureServer(server) {
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }
        const handlePayload = (payload) => {
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };
        const reqBody = req.body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    }
  };
}
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), vitePluginManusDebugCollector()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
