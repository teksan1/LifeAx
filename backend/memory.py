import json,os,datetime
MEMORY_FILE=os.path.join(os.path.dirname(__file__),"data","memory.json")
def load():
 if not os.path.exists(MEMORY_FILE):return[]
 with open(MEMORY_FILE,'r')as f:return json.load(f)
def save(u,a):
 m=load();m.append({"timestamp":datetime.datetime.utcnow().isoformat(),"user":u,"assistant":a})
 with open(MEMORY_FILE,'w')as f:json.dump(m[-50:],f,indent=2)
def get_context():return"\n".join(f"User: {x['user']}\nAssistant: {x['assistant']}"for x in load()[-10:])
