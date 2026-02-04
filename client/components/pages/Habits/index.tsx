import { models } from '@/lib/trpc';
import { aiPlan } from '@/lib/aiCore';

export default function Habits(){
  const data = models.habits.load?.() || [];
  const ai = aiPlan({Habits:data});
  return (
    <div>
      <h1>Habits</h1>
      <pre>{JSON.stringify(data,null,2)}</pre>
      <pre>{JSON.stringify(ai,null,2)}</pre>
    </div>
  );
}
