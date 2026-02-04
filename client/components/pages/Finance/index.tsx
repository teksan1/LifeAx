import { models } from '@/lib/trpc';
import { aiPlan } from '@/lib/aiCore';

export default function Finance(){
  const data = models.finance.load?.() || [];
  const ai = aiPlan({Finance:data});
  return (
    <div>
      <h1>Finance</h1>
      <pre>{JSON.stringify(data,null,2)}</pre>
      <pre>{JSON.stringify(ai,null,2)}</pre>
    </div>
  );
}
