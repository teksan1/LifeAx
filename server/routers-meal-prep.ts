import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createMealPrepSession,
  getMealPrepSessions,
  getMealPrepSessionDetails,
  updateMealPrepSessionStatus,
  addChecklistItem,
  completeChecklistItem,
  createMealPrepProgress,
  updateMealPrepProgress,
  createMealPrepContainer,
  getMealPrepContainers,
  updateContainerLocation,
  deleteContainer,
} from "./db-meal-prep";

export const mealPrepRouter = router({
  createSession: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        date: z.date(),
        duration: z.number().optional(),
        description: z.string().optional(),
        recipes: z.array(z.number()).optional(),
        ingredients: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
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

  getSessionDetails: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input }) => {
      const details = await getMealPrepSessionDetails(input.sessionId);
      return details;
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        status: z.enum(["planned", "in_progress", "completed", "cancelled"]),
      })
    )
    .mutation(async ({ input }) => {
      await updateMealPrepSessionStatus(input.sessionId, input.status);
      return { success: true };
    }),

  addChecklistItem: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        task: z.string(),
        order: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      await addChecklistItem(input.sessionId, input.task, input.order);
      return { success: true };
    }),

  completeChecklistItem: protectedProcedure
    .input(z.object({ itemId: z.number() }))
    .mutation(async ({ input }) => {
      await completeChecklistItem(input.itemId);
      return { success: true };
    }),

  createProgress: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        recipeId: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await createMealPrepProgress(
        input.sessionId,
        ctx.user.id,
        input.recipeId,
        input.notes
      );
      return { success: true };
    }),

  updateProgress: protectedProcedure
    .input(
      z.object({
        progressId: z.number(),
        status: z.enum(["not_started", "in_progress", "completed"]),
        timeSpent: z.number().optional(),
        photoUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await updateMealPrepProgress(
        input.progressId,
        input.status,
        input.timeSpent,
        input.photoUrl
      );
      return { success: true };
    }),
});

export const mealPrepContainerRouter = router({
  createContainer: protectedProcedure
    .input(
      z.object({
        mealName: z.string(),
        quantity: z.number(),
        containerType: z.string(),
        prepDate: z.date(),
        expiryDate: z.date(),
        location: z.string(),
        notes: z.string().optional(),
        photoUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
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

  updateLocation: protectedProcedure
    .input(
      z.object({
        containerId: z.number(),
        location: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await updateContainerLocation(input.containerId, input.location);
      return { success: true };
    }),

  deleteContainer: protectedProcedure
    .input(z.object({ containerId: z.number() }))
    .mutation(async ({ input }) => {
      await deleteContainer(input.containerId);
      return { success: true };
    }),
});
