export const loadUserLS = () => JSON.parse(localStorage.getItem('user')) || null;
export const saveUserLS = (u) => localStorage.setItem('user', JSON.stringify(u));
export const loadSettingsLS = () => JSON.parse(localStorage.getItem('settings')) || null;
export const saveSettingsLS = (s) => localStorage.setItem('settings', JSON.stringify(s));
export const loadNotificationsLS = () => JSON.parse(localStorage.getItem('notifications')) || [];
export const saveNotificationsLS = (n) => localStorage.setItem('notifications', JSON.stringify(n));
