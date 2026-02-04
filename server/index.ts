import express from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import { z } from 'zod';
import { initTRPC } from '@trpc/server';
import cors from 'cors';

const t = initTRPC.create();

type User = { id: string; name: string; email: string };
type Notification = { id: string; message: string; read: boolean; date: string };
type Settings = { theme: string; language: string };

let currentUser: User = { id: '1', name: 'Test User', email: 'user@example.com' };
let notifications: Notification[] = [
  { id: 'n1', message: 'Welcome to LifeAx!', read: false, date: new Date().toISOString() },
  { id: 'n2', message: 'Your profile is live.', read: true, date: new Date().toISOString() }
];
let settings: Settings = { theme: 'light', language: 'en' };

const appRouter = t.router({
  getCurrentUser: t.procedure.query(() => currentUser),
  getNotifications: t.procedure.query(() => notifications),
  markNotificationRead: t.procedure.input(z.object({ id: z.string() })).mutation(({ input }) => {
    const note = notifications.find(n => n.id === input.id);
    if (note) note.read = true;
    return { success: true };
  }),
  getSettings: t.procedure.query(() => settings),
  updateSettings: t.procedure.input(z.object({ theme: z.string(), language: z.string() })).mutation(({ input }) => {
    settings = input;
    return { success: true };
  })
});

export type AppRouter = typeof appRouter;

const app = express();
app.use(cors());
app.use('/trpc', trpcExpress.createExpressMiddleware({ router: appRouter, createContext: () => ({}) }));

const port = 4000;
app.listen(port, () => console.log(`✅ TRPC server running on http://localhost:${port}/trpc`));
