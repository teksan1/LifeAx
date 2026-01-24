import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { TRPCError } from "@trpc/server";
import {
  analyzeConversation,
  createMealPlan,
  getMealPlans,
  addShoppingListItem,
  getShoppingList,
  getShoppingListTotal,
} from "./db-enhanced";

export const emotionalIntelligenceRouter = router({
  analyzeConversation: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        stressLevel: z.number().min(0).max(100),
        riskLevel: z.number().min(0).max(100),
        sentiment: z.enum(["positive", "neutral", "negative"]),
        emotionalKeywords: z.array(z.string()),
        decisionRisks: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
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
    }),
});

export const mealPlanningRouter = router({
  createPlan: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        startDate: z.date(),
        endDate: z.date(),
        dietaryPreferences: z.array(z.string()),
        restrictions: z.array(z.string()),
        budget: z.number().optional(),
        servings: z.number().default(2),
      })
    )
    .mutation(async ({ ctx, input }) => {
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

  generateMealPlan: protectedProcedure
    .input(
      z.object({
        dietaryPreferences: z.array(z.string()),
        restrictions: z.array(z.string()),
        servings: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are a professional meal planner. Generate a detailed 7-day meal plan with breakfast, lunch, dinner, and snacks. Format as JSON.",
            },
            {
              role: "user",
              content: `Create a 7-day meal plan. Preferences: ${input.dietaryPreferences.join(", ")}. Restrictions: ${input.restrictions.join(", ")}. Servings: ${input.servings}.`,
            },
          ],
        });

        const messageContent = response.choices?.[0]?.message?.content;
        if (!messageContent || typeof messageContent !== "string")
          throw new Error("No response");

        return JSON.parse(messageContent);
      } catch (error) {
        console.error("Meal plan error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate meal plan",
        });
      }
    }),
});

export const shoppingRouter = router({
  getList: protectedProcedure
    .input(z.object({ mealPlanId: z.number() }))
    .query(async ({ input }) => {
      const items = await getShoppingList(input.mealPlanId);
      return items;
    }),

  getTotal: protectedProcedure
    .input(z.object({ mealPlanId: z.number() }))
    .query(async ({ input }) => {
      const total = await getShoppingListTotal(input.mealPlanId);
      return { total, formatted: `$${(total / 100).toFixed(2)}` };
    }),
});
