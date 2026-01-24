import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { 
  createConversation, getConversations, addMessage, getMessages,
  createTask, getTasks, updateTask, deleteTask,
  createCalendarEvent, getCalendarEvents, updateCalendarEvent, deleteCalendarEvent,
  createNotification, getNotifications, markNotificationAsRead,
  createHabit, getHabits,
  createRecommendation, getRecommendations
} from "./db";
import {
  analyzeConversation, getConversationAnalysis,
  createMealPlan, getMealPlans, getMealPlanDetails, addMealPlanDay,
  addRecipe, getRecipes, addShoppingListItem, getShoppingList, markShoppingItemPurchased, getShoppingListTotal
} from "./db-enhanced";
import { invokeLLM } from "./_core/llm";
import { TRPCError } from "@trpc/server";
import { emotionalIntelligenceRouter, mealPlanningRouter, shoppingRouter } from "./routers-enhanced";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Chat procedures
  chat: router({
    createConversation: protectedProcedure
      .input(z.object({ title: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const result = await createConversation(ctx.user.id, input.title);
        return result;
      }),

    getConversations: protectedProcedure
      .query(async ({ ctx }) => {
        const conversations = await getConversations(ctx.user.id);
        return conversations;
      }),

    getMessages: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input }) => {
        const messages = await getMessages(input.conversationId);
        return messages;
      }),

    sendMessage: protectedProcedure
      .input(z.object({ 
        conversationId: z.number(),
        message: z.string()
      }))
      .mutation(async ({ ctx, input }) => {
        // Add user message
        await addMessage(input.conversationId, "user", input.message);

        // Generate AI response
        try {
          const response = await invokeLLM({
            messages: [
              { 
                role: "system", 
                content: "You are LifeAx, a compassionate life optimization assistant. Provide personalized advice on productivity, health, relationships, and personal growth. Be concise, actionable, and supportive." 
              },
              { role: "user", content: input.message }
            ],
          });

          const messageContent = response.choices?.[0]?.message?.content;
          const aiContent = typeof messageContent === 'string' ? messageContent : "I couldn't generate a response. Please try again.";
          
          // Add AI response
          await addMessage(input.conversationId, "assistant", aiContent);
          
          return { success: true, response: aiContent };
        } catch (error) {
          console.error("LLM error:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to generate response" });
        }
      }),
  }),

  // Task procedures
  tasks: router({
    create: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
        dueDate: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await createTask(
          ctx.user.id,
          input.title,
          input.description,
          input.priority,
          input.dueDate
        );
        return result;
      }),

    list: protectedProcedure
      .query(async ({ ctx }) => {
        const tasks = await getTasks(ctx.user.id);
        return tasks;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
        dueDate: z.date().optional(),
        completed: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await updateTask(id, updates);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteTask(input.id);
        return { success: true };
      }),
  }),

  // Calendar procedures
  calendar: router({
    createEvent: protectedProcedure
      .input(z.object({
        title: z.string(),
        startTime: z.date(),
        endTime: z.date(),
        description: z.string().optional(),
        location: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
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

    getEvents: protectedProcedure
      .query(async ({ ctx }) => {
        const events = await getCalendarEvents(ctx.user.id);
        return events;
      }),

    updateEvent: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        startTime: z.date().optional(),
        endTime: z.date().optional(),
        description: z.string().optional(),
        location: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await updateCalendarEvent(id, updates);
        return { success: true };
      }),

    deleteEvent: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteCalendarEvent(input.id);
        return { success: true };
      }),
  }),

  // Notification procedures
  notifications: router({
    list: protectedProcedure
      .query(async ({ ctx }) => {
        const notifications = await getNotifications(ctx.user.id);
        return notifications;
      }),

    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await markNotificationAsRead(input.id);
        return { success: true };
      }),
  }),

  // Recommendations procedures
  recommendations: router({
    generate: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          // Get user's tasks and habits for context
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
          if (!messageContent || typeof messageContent !== 'string') throw new Error("No response from LLM");

          const parsed = JSON.parse(messageContent);
          
          // Save recommendations to database
          for (const rec of parsed.recommendations) {
            await createRecommendation(ctx.user.id, rec.title, rec.content, rec.category);
          }

          return parsed.recommendations;
        } catch (error) {
          console.error("Recommendation generation error:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to generate recommendations" });
        }
      }),

    list: protectedProcedure
      .query(async ({ ctx }) => {
        const recommendations = await getRecommendations(ctx.user.id);
        return recommendations;
      }),
  }),

  // Habits procedures
  emotionalIntelligence: emotionalIntelligenceRouter,
  mealPlanning: mealPlanningRouter,
  shopping: shoppingRouter,

  habits: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        frequency: z.enum(["daily", "weekly", "monthly"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await createHabit(ctx.user.id, input.name, input.frequency);
        return result;
      }),

    list: protectedProcedure
      .query(async ({ ctx }) => {
        const habits = await getHabits(ctx.user.id);
        return habits;
      }),
  }),
});

export type AppRouter = typeof appRouter;
