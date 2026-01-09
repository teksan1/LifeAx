import os,requests,time
from dotenv import load_dotenv
from memory import get_context,save

load_dotenv(os.path.join(os.path.dirname(__file__),'..','.env'))
KEY=os.getenv("GEMINI_API_KEY")
if not KEY:raise RuntimeError("No API key")

# Multiple endpoints to try (from newest to oldest/most stable)
ENDPOINTS=[
    ("gemini-2.0-flash-exp","https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent"),
    ("gemini-1.5-flash","https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"),
    ("gemini-1.5-flash-latest","https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent"),
    ("gemini-1.5-pro","https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent"),
    ("gemini-pro","https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"),
]

# Try to find working endpoint on first load
WORKING_ENDPOINT=None

def find_working_endpoint():
    global WORKING_ENDPOINT
    if WORKING_ENDPOINT:return WORKING_ENDPOINT
    
    for name,url in ENDPOINTS:
        try:
            r=requests.post(
                url,
                headers={"Content-Type":"application/json","x-goog-api-key":KEY},
                json={"contents":[{"parts":[{"text":"Hi"}]}]},
                timeout=10
            )
            if r.status_code in [200,429]:
                WORKING_ENDPOINT=(name,url)
                return WORKING_ENDPOINT
        except:
            continue
    return None

def ask(u,retries=3):
    global WORKING_ENDPOINT
    c=get_context();p=f"{c}\nUser: {u}"if c else u
    
    # Find working endpoint if not already found
    if not WORKING_ENDPOINT:
        endpoint=find_working_endpoint()
        if not endpoint:
            return"❌ Could not connect to any Gemini API endpoint. Check your API key at https://aistudio.google.com/apikey"
    
    for attempt in range(retries):
        # Try all endpoints if current one fails
        endpoints_to_try=[WORKING_ENDPOINT] if WORKING_ENDPOINT else ENDPOINTS
        
        for name,url in endpoints_to_try:
            try:
                r=requests.post(
                    url,
                    headers={"Content-Type":"application/json","x-goog-api-key":KEY},
                    json={"contents":[{"parts":[{"text":p}]}]},
                    timeout=30
                )
                
                if r.status_code==429:
                    if attempt<retries-1:
                        wait=2**(attempt+1)
                        time.sleep(wait)
                        continue
                    return"⚠️ Rate limited. Your API key may be overused. Get a new one at https://aistudio.google.com/apikey"
                
                if r.status_code==404:
                    # This endpoint doesn't work, try next
                    continue
                
                if r.status_code==400:
                    error_msg=r.json().get("error",{}).get("message","")
                    if "API_KEY_INVALID" in error_msg or "invalid" in error_msg.lower():
                        return"❌ Invalid API key. Get a valid key at https://aistudio.google.com/apikey"
                    continue
                
                r.raise_for_status()
                a=r.json()["candidates"][0]["content"]["parts"][0]["text"]
                
                # Update working endpoint if we found a new one
                if not WORKING_ENDPOINT or WORKING_ENDPOINT[1]!=url:
                    WORKING_ENDPOINT=(name,url)
                
                save(u,a)
                return a
                
            except requests.exceptions.RequestException:
                continue
            except (KeyError,IndexError):
                continue
        
        # If we get here, all endpoints failed this attempt
        if attempt<retries-1:
            time.sleep(2)
    
    return"❌ All API endpoints failed. Please check: (1) Your internet connection, (2) API key validity at https://aistudio.google.com/apikey, (3) API quotas"
