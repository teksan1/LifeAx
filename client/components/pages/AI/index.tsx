import { models } from '@/lib/trpc';
import { aiPlan } from '@/lib/aiCore';

export default function AI(){
  const data = models.ai.load?.() || [];
  const ai = aiPlan({AI:data});
  return (
    <div>
      <h1>AI</h1>
      <pre>{JSON.stringify(data,null,2)}</pre>
      <pre>{JSON.stringify(ai,null,2)}</pre>
    </div>
  );
}
