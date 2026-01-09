import os,json,requests,time,random,re
from datetime import datetime
from collections import defaultdict
from dotenv import load_dotenv
from memory import get_context,save,load

load_dotenv(os.path.join(os.path.dirname(__file__),'..','.env'))
KEY=os.getenv("GEMINI_API_KEY")

PROFILE_FILE=os.path.join(os.path.dirname(__file__),"data","user_profile.json")
PATTERNS_FILE=os.path.join(os.path.dirname(__file__),"data","learned_patterns.json")

class UserProfile:
    def __init__(self):
        self.interests=defaultdict(int)
        self.style={"formal":0,"casual":0,"technical":0}
        self.topics=defaultdict(int)
        self.load_profile()
    
    def load_profile(self):
        if os.path.exists(PROFILE_FILE):
            try:
                with open(PROFILE_FILE,'r')as f:
                    data=json.load(f)
                    self.interests=defaultdict(int,data.get('interests',{}))
                    self.style=data.get('style',self.style)
                    self.topics=defaultdict(int,data.get('topics',{}))
            except:pass
    
    def save_profile(self):
        os.makedirs(os.path.dirname(PROFILE_FILE),exist_ok=True)
        with open(PROFILE_FILE,'w')as f:
            json.dump({'interests':dict(self.interests),'style':self.style,'topics':dict(self.topics)},f)
    
    def learn(self,msg):
        if any(w in msg.lower()for w in['please','thank you','kindly']):self.style['formal']+=1
        if any(w in msg.lower()for w in['hey','yeah','cool','lol']):self.style['casual']+=1
        if any(w in msg.lower()for w in['code','algorithm','function','technical']):self.style['technical']+=1
        keywords=['python','javascript','ai','ml','web','app','game','music','art','science','math','business','health']
        for k in keywords:
            if k in msg.lower():self.topics[k]+=1
        self.save_profile()

class OfflineAI:
    def __init__(self):
        self.patterns=self.load_patterns()
    
    def load_patterns(self):
        if os.path.exists(PATTERNS_FILE):
            try:
                with open(PATTERNS_FILE,'r')as f:return json.load(f)
            except:pass
        return{
            "greeting":{"triggers":["hello","hi","hey","good morning","good afternoon","good evening"],"responses":["Hello! How can I help you today?","Hi there! What can I do for you?","Hey! I'm here to assist you."]},
            "thanks":{"triggers":["thank","thanks","thx","appreciate"],"responses":["You're welcome! Happy to help!","My pleasure!","Glad I could help!"]},
            "identity":{"triggers":["who are you","what are you","your name"],"responses":["I'm LifeAx, your intelligent AI assistant!","I'm LifeAx - here to help with questions and tasks!"]},
            "capability":{"triggers":["what can you do","help me","how can you help","capabilities"],"responses":["I can help with questions, coding, writing, analysis, and general conversation!","I'm here to assist with various tasks - just ask me anything!"]},
            "goodbye":{"triggers":["bye","goodbye","see you","exit","quit","later"],"responses":["Goodbye! Come back anytime!","See you later! Have a great day!","Take care!"]},
            "status":{"triggers":["how are you","how's it going","what's up","how do you do"],"responses":["I'm doing great! How can I help you?","All systems operational! What do you need?"]},
        }
    
    def save_patterns(self):
        os.makedirs(os.path.dirname(PATTERNS_FILE),exist_ok=True)
        with open(PATTERNS_FILE,'w')as f:json.dump(self.patterns,f)
    
    def learn_pattern(self,msg,resp):
        words=msg.lower().split()
        if len(words)<=5 and len(resp)<300:
            found=False
            for cat,data in self.patterns.items():
                if any(t in msg.lower()for t in data['triggers']):found=True;break
            if not found:
                cat=words[0]if words else"general"
                if cat not in self.patterns:
                    self.patterns[cat]={"triggers":[msg.lower()],"responses":[resp]}
                    self.save_patterns()
    
    def respond(self,msg):
        for cat,data in self.patterns.items():
            for trigger in data['triggers']:
                if trigger in msg.lower():
                    return random.choice(data['responses'])
        return"I can help with basic queries. For complex questions, I'll need an internet connection to access advanced AI capabilities."

profile=UserProfile()
offline=OfflineAI()

# Free AI Services (No API Key Required)
class FreeAIServices:
    def __init__(self):
        self.services=[
            self.try_huggingface,
            self.try_duckduckgo,
            self.try_perplexity_scrape,
        ]
    
    def try_huggingface(self,prompt):
        """Use HuggingFace Inference API (free tier)"""
        try:
            models=[
                "microsoft/DialoGPT-large",
                "facebook/blenderbot-400M-distill",
                "EleutherAI/gpt-neo-125M",
            ]
            for model in models:
                try:
                    r=requests.post(
                        f"https://api-inference.huggingface.co/models/{model}",
                        headers={"Content-Type":"application/json"},
                        json={"inputs":prompt,"parameters":{"max_length":500}},
                        timeout=10
                    )
                    if r.status_code==200:
                        data=r.json()
                        if isinstance(data,list)and len(data)>0:
                            return data[0].get('generated_text','').replace(prompt,'').strip()
                except:continue
        except:pass
        return None
    
    def try_duckduckgo(self,prompt):
        """Use DuckDuckGo AI Chat (anonymous)"""
        try:
            r=requests.get(
                "https://duckduckgo.com/duckchat/v1/chat",
                params={"q":prompt},
                headers={"User-Agent":"Mozilla/5.0"},
                timeout=10
            )
            if r.status_code==200:
                # Parse response
                text=r.text
                if text and len(text)>10:
                    return text[:500]
        except:pass
        return None
    
    def try_perplexity_scrape(self,prompt):
        """Fallback: Basic intelligent response"""
        try:
            # Simple rule-based intelligent responses
            prompt_lower=prompt.lower()
            
            # Question detection
            if any(q in prompt_lower for q in['what','how','why','when','where','who']):
                if 'python' in prompt_lower or 'code' in prompt_lower:
                    return "For coding questions, I'd recommend checking the official documentation or trying the code yourself. What specific aspect would you like help with?"
                elif 'ai' in prompt_lower or 'ml' in prompt_lower:
                    return "AI and Machine Learning are fascinating fields! Could you be more specific about what you'd like to know?"
                else:
                    return "That's an interesting question. While I have limited online access right now, I can try to help based on general knowledge. Could you provide more context?"
            
            # Conversational responses
            if any(w in prompt_lower for w in['tell me','explain','describe']):
                return "I'd be happy to explain! However, with limited online access, I can provide general information. What specifically would you like to know?"
            
            return None
        except:
            return None
    
    def get_response(self,prompt):
        """Try all services in order"""
        for service in self.services:
            try:
                response=service(prompt)
                if response and len(response.strip())>10:
                    return response
            except:continue
        return None

free_ai=FreeAIServices()

# Try Gemini API if key exists
def try_gemini(prompt):
    if not KEY:return None
    
    endpoints=[
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent",
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
    ]
    
    for url in endpoints:
        try:
            r=requests.post(
                url,
                headers={"Content-Type":"application/json","x-goog-api-key":KEY},
                json={"contents":[{"parts":[{"text":prompt}]}]},
                timeout=15
            )
            if r.status_code==200:
                return r.json()["candidates"][0]["content"]["parts"][0]["text"]
        except:continue
    return None

def ask(user_input,retries=2):
    profile.learn(user_input)
    context=get_context()
    full_prompt=f"{context}\nUser: {user_input}"if context else user_input
    
    # Strategy: Try multiple AI sources
    response=None
    
    # 1. Try Gemini API if available
    if KEY:
        response=try_gemini(full_prompt)
        if response:
            offline.learn_pattern(user_input,response)
            save(user_input,response)
            return response
    
    # 2. Try free AI services (anonymous)
    response=free_ai.get_response(full_prompt)
    if response:
        offline.learn_pattern(user_input,response)
        save(user_input,response)
        return f"🌐 {response}"
    
    # 3. Fallback to offline mode
    response=offline.respond(user_input)
    save(user_input,response)
    return response
