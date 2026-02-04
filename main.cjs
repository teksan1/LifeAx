const path = require('path');
const fs = require('fs');
const readline = require('readline');
const fetch = require('node-fetch');
const { Configuration, OpenAIApi } = require('openai');
const chokidar = require('chokidar'); // watch for disk changes

// --- Node localStorage mock ---
global.localStorage = {
  _data: {},
  setItem(k,v){ this._data[k]=v; },
  getItem(k){ return this._data[k] || null; },
  removeItem(k){ delete this._data[k]; },
  clear(){ this._data={}; }
};

// --- File-based persistent storage with live update ---
const DATA_FILE = path.resolve(process.cwd(),'lifeax_data.json');
let diskStore = {};
if(fs.existsSync(DATA_FILE)){
  try{ diskStore=JSON.parse(fs.readFileSync(DATA_FILE,'utf-8')); }catch(e){ diskStore={}; }
}
function saveDisk(){ fs.writeFileSync(DATA_FILE, JSON.stringify(diskStore, null, 2)); }
const saveStore = (k,v)=>{
  diskStore[k]=v;
  saveDisk();
  localStorage.setItem(k, JSON.stringify(v));
};
const loadStore = (k)=>{
  if(localStorage.getItem(k)) return JSON.parse(localStorage.getItem(k));
  if(diskStore[k]) return diskStore[k];
  return null;
};

// --- Watch file changes to live-update GUI ---
chokidar.watch(DATA_FILE).on('change', ()=>{
  try{
    const newData = JSON.parse(fs.readFileSync(DATA_FILE,'utf-8'));
    for(const k in newData) localStorage.setItem(k, JSON.stringify(newData[k]));
  }catch(e){ console.log('⚠️ Live update error:', e.message); }
});

// --- TRPC placeholder ---
const trpcPathJs = path.resolve(process.cwd(),'client/lib/trpc.js');
const trpcPathTs = path.resolve(process.cwd(),'client/lib/trpc.ts');
const trpcPath = fs.existsSync(trpcPathJs)?trpcPathJs:trpcPathTs;
const { loadUserLS, saveUserLS, loadSettingsLS, saveSettingsLS, loadNotificationsLS, saveNotificationsLS } = require(trpcPath);

// --- Initialize stores ---
const stores = { behavioralProfile:'lifeax_behavior', schedule:'lifeax_schedule', aiChatLog:'lifeax_ai_chat', mealPlans:'lifeax_meals', shoppingLists:'lifeax_shopping' };

if(!loadUserLS()) saveUserLS({id:'1',name:'User'});
if(!loadSettingsLS()) saveSettingsLS({theme:'dark',language:'en'});
if(!loadNotificationsLS()) saveNotificationsLS([]);
for(const k in stores){
  if(!loadStore(stores[k])){
    if(k==='behavioralProfile') saveStore(stores[k], { sleepPattern:'normal', focusPeak:'morning', tasksCompleted:0 });
    else saveStore(stores[k], []);
  }
}

// --- OpenAI ---
const AI_KEY = process.env.OPENAI_API_KEY || "sk-your-key-here";
const openai = new OpenAIApi(new Configuration({apiKey:AI_KEY}));
async function queryAI(prompt){
  try{
    const resp = await openai.chat.completions.create({ model:"gpt-3.5-turbo", messages:[{role:'user', content:prompt}] });
    return resp.choices?.[0]?.message?.content || "🤖 AI could not respond";
  }catch(e){ return "🤖 AI error:"+e.message; }
}

// --- AI Engine with live GUI sync ---
const AIEngine = {
  async chat(msg){
    const log = loadStore(stores.aiChatLog) || [];
    const reply = await queryAI(msg);
    log.push({from:'AI', message:reply});
    saveStore(stores.aiChatLog, log);
    return reply;
  },
  addMealPlan(day, meals){
    const plans = loadStore(stores.mealPlans) || [];
    plans.push({day, meals});
    saveStore(stores.mealPlans, plans);
  },
  addShoppingItems(items){
    const shopping = loadStore(stores.shoppingLists) || [];
    shopping.push(...items);
    saveStore(stores.shoppingLists, shopping);
  },
  scheduleTask(time, task){
    const sched = loadStore(stores.schedule) || [];
    sched.push({time, task});
    saveStore(stores.schedule, sched);
  },
  async runDailyPlanner(){
    console.log('📅 Daily Plan');
    console.log('Schedule:', loadStore(stores.schedule));
    console.log('Meals:', loadStore(stores.mealPlans));
    console.log('Shopping:', loadStore(stores.shoppingLists));
    console.log('Behavior:', loadStore(stores.behavioralProfile));
    const plan = await this.chat("Generate full daily plan including tasks, meals, shopping based on profile.");
    console.log('🤖 AI Daily Plan:', plan);
  }
};

// --- CLI ---
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
console.log('🚀 LifeAx CLI ready (plan, meal, shopping, chat, exit).');

rl.on('line', async input=>{
  const args=input.trim().split(' '); const cmd=args.shift();
  switch(cmd){
    case'plan': await AIEngine.runDailyPlanner(); break;
    case'meal': AIEngine.addMealPlan(args[0]||'today', args.slice(1).join(' ')); console.log('✅ Meal added'); break;
    case'shopping': AIEngine.addShoppingItems(args); console.log('✅ Shopping items added'); break;
    case'chat': const reply=await AIEngine.chat(args.join(' ')); console.log('🤖',reply); break;
    case'exit': rl.close(); process.exit(0); break;
    default: console.log('⚠️ Unknown command:',cmd);
  }
});
