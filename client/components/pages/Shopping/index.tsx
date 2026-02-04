import { models } from '@/lib/trpc';
import { aiPlan } from '@/lib/aiCore';

export default function Shopping(){
  const data = models.shopping.load?.() || [];
  const ai = aiPlan({Shopping:data});
  return (
    <div>
      <h1>Shopping</h1>
      <pre>{JSON.stringify(data,null,2)}</pre>
      <pre>{JSON.stringify(ai,null,2)}</pre>
    </div>
  );
}
