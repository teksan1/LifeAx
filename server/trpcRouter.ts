import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

const t = initTRPC.create();
const DB_PATH = path.join(__dirname, 'db.json');

const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
const writeDB = (data: any) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

export const appRouter = t.router({
  getUser: t.procedure.query(() => {
    const db = readDB();
    return db.users[0];
  }),
  getNotifications: t.procedure.query(() => {
    const db = readDB();
    return db.notifications;
  }),
  markRead: t.procedure.input(z.number()).mutation((opts) => {
    const db = readDB();
    const notif = db.notifications.find((n: any) => n.id === opts.input);
    if (notif) notif.read = true;
    writeDB(db);
    return notif;
  }),
  getSettings: t.procedure.query(() => {
    const db = readDB();
    return db.settings;
  }),
  updateSettings: t.procedure.input(z.object({
    theme: z.string().optional(),
    defaultLanguage: z.string().optional()
  })).mutation((opts) => {
    const db = readDB();
    db.settings = { ...db.settings, ...opts.input };
    writeDB(db);
    return db.settings;
  }),
  getAppInfo: t.procedure.query(() => ({
    name: 'LifeAx',
    version: '1.0.0',
    defaultLanguage: 'en'
  }))
});

export type AppRouter = typeof appRouter;
