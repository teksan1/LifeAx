export function aiPlan(input:any){
  return {
    plan: "Structured daily plan generated",
    priorities: Object.keys(input),
    suggestion: "Stay consistent and follow schedule"
  };
}
