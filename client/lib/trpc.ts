// --- Fake TRPC client ---
export const trpc = {
  getCurrentUser: { query: async () => ({ id: '1', name: 'Test User', email: 'user@example.com' }) },
  getNotifications: { query: async () => [
    { id: 'n1', message: 'Welcome to LifeAx!', read: false, date: new Date().toISOString() },
    { id: 'n2', message: 'Your profile is stubbed.', read: true, date: new Date().toISOString() }
  ] },
  markNotificationRead: { mutate: async ({id}:any) => ({ success: true }) },
  getSettings: { query: async () => ({ theme: 'light', language: 'en' }) },
  updateSettings: { mutate: async (settings:any) => ({ success: true }) },
};

// --- LocalStorage helpers ---
export function saveUserLS(user:any){ localStorage.setItem('lifeax_user', JSON.stringify(user)); }
export function loadUserLS(){ const u = localStorage.getItem('lifeax_user'); return u ? JSON.parse(u) : null; }
export function clearUserLS(){ localStorage.removeItem('lifeax_user'); }

export function saveSettingsLS(s:any){ localStorage.setItem('lifeax_settings', JSON.stringify(s)); }
export function loadSettingsLS(){ const s = localStorage.getItem('lifeax_settings'); return s ? JSON.parse(s) : null; }

export function saveNotificationsLS(n:any[]){ localStorage.setItem('lifeax_notifications', JSON.stringify(n)); }
export function loadNotificationsLS(){ const n = localStorage.getItem('lifeax_notifications'); return n ? JSON.parse(n) : []; }

export function saveLS(key:string,val:any){ localStorage.setItem(key,JSON.stringify(val)); }
export function loadLS(key:string,def:any){ const v=localStorage.getItem(key); return v?JSON.parse(v):def; }

export const models = {
  habits: { load:()=>loadLS('habits',[]), save:(v:any)=>saveLS('habits',v)},
  tasks: { load:()=>loadLS('tasks',[]), save:(v:any)=>saveLS('tasks',v)},
  finance:{ load:()=>loadLS('finance',[]), save:(v:any)=>saveLS('finance',v)},
  routines:{ load:()=>loadLS('routines',[]), save:(v:any)=>saveLS('routines',v)},
  meals:  { load:()=>loadLS('meals',[]), save:(v:any)=>saveLS('meals',v)},
  shopping:{load:()=>loadLS('shopping',[]), save:(v:any)=>saveLS('shopping',v)},
};
