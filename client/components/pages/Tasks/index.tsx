import { models } from '@/lib/trpc';
import { aiPlan } from '@/lib/aiCore';

export default function Tasks(){
  const data = models.tasks.load?.() || [];
  const ai = aiPlan({Tasks:data});
  return (
    <div>
      <h1>Tasks</h1>
      <pre>{JSON.stringify(data,null,2)}</pre>
      <pre>{JSON.stringify(ai,null,2)}</pre>
    </div>
  );
}
