import { models } from '@/lib/trpc';
import { aiPlan } from '@/lib/aiCore';

export default function Meals(){
  const data = models.meals.load?.() || [];
  const ai = aiPlan({Meals:data});
  return (
    <div>
      <h1>Meals</h1>
      <pre>{JSON.stringify(data,null,2)}</pre>
      <pre>{JSON.stringify(ai,null,2)}</pre>
    </div>
  );
}
