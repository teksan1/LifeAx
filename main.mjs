import path from 'path';
import fs from 'fs';
import readline from 'readline';
import { Configuration, OpenAIApi } from 'openai';
import fetch from 'node-fetch';
import { 
  loadUserLS, saveUserLS,
  loadSettingsLS, saveSettingsLS,
  loadNotificationsLS, saveNotificationsLS
} from './client/lib/trpc.mjs';

global.localStorage = { _data:{}, setItem(k,v){this._data[k]=v;}, getItem(k){return this._data[k]||null;}, removeItem(k){delete this._data[k];}, clear(){this._data={};} };
const DATA_FILE = path.resolve('./lifeax_data.json');
let diskStore = {};
if(fs.existsSync(DATA_FILE)){ try{ diskStore = JSON.parse(fs.readFileSync(DATA_FILE,'utf-8')); } catch(e){ diskStore={}; } }
function saveDisk(){ fs.writeFileSync(DATA_FILE, JSON.stringify(diskStore,null,2)); }
const saveStore = (k,v)=>{ diskStore[k]=v; saveDisk(); localStorage.setItem(k,JSON.stringify(v)); };
const loadStore = (k)=>{ if(localStorage.getItem(k)) return JSON.parse(localStorage.getItem(k)); if(diskStore[k]) return diskStore[k]; return null; };

const stores = { behavioralProfile:'lifeax_behavior', schedule:'lifeax_schedule', aiChatLog:'lifeax_ai_chat', mealPlans:'lifeax_meals', shoppingLists:'lifeax_shopping' };
if(!loadUserLS()) saveUserLS({id:'1',name:'User'});
if(!loadSettingsLS()) saveSettingsLS({theme:'dark',language:'en'});
if(!loadNotificationsLS()) saveNotificationsLS([]);
for(const k in stores){ if(!loadStore(stores[k])){ if(k==='behavioralProfile') saveStore(stores[k], { sleepPattern:'normal', focusPeak:'morning', tasksCompleted:0 }); else saveStore(stores[k], []); } }

const AI_KEY = process.env.OPENAI_API_KEY || "sk-your-key-here";
const openai = new OpenAIApi(new Configuration({ apiKey: AI_KEY }));
async function queryAI(prompt){ try{ const resp = await openai.chat.completions.create({ model:"gpt-3.5-turbo", messages:[{role:'user', content:prompt}] }); return resp.choices?.[0]?.message?.content || "🤖 AI could not respond"; } catch(e){ return "🤖 AI error: "+e.message; } }

export const AIEngine = {
  async chat(msg){ const log = loadStore(stores.aiChatLog) || []; const reply = await queryAI(msg); log.push({from:'AI', message:reply}); saveStore(stores.aiChatLog, log); return reply; },
  addMealPlan(day, meals){ const plans = loadStore(stores.meals) || []; plans.push({day, meals}); saveStore(stores.mealPlans, plans); },
  addShoppingItems(items){ const shopping = loadStore(stores.shoppingLists) || []; shopping.push(...items); saveStore(stores.shoppingLists, shopping); },
  scheduleTask(time, task){ const sched = loadStore(stores.schedule) || []; sched.push({time, task}); saveStore(stores.schedule, sched); },
  async runDailyPlanner(){ console.log('📅 Daily Plan'); console.log('Schedule:', loadStore(stores.schedule)); console.log('Meals:', loadStore(stores.mealPlans)); console.log('Shopping:', loadStore(stores.shoppingLists)); console.log('Behavior:', loadStore(stores.behavioralProfile)); const plan = await this.chat("Generate full daily plan including tasks, meals, shopping based on profile."); console.log('🤖 AI Daily Plan:', plan); }
};

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
console.log('🚀 LifeAx CLI ready (plan, meal, shopping, chat, exit).');
rl.on('line', async input=>{ const args = input.trim().split(' '); const cmd = args.shift(); switch(cmd){ case 'plan': await AIEngine.runDailyPlanner(); break; case 'meal': AIEngine.addMealPlan(args[0]||'today', args.slice(1).join(' ')); console.log('✅ Meal added'); break; case 'shopping': AIEngine.addShoppingItems(args); console.log('✅ Shopping items added'); break; case 'chat': const reply = await AIEngine.chat(args.join(' ')); console.log('🤖', reply); break; case 'exit': rl.close(); process.exit(0); break; default: console.log('⚠️ Unknown command:', cmd); } });
