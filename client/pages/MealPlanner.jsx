import { useState, useEffect } from 'react';

export default function MealPlanner() {
  const [meals, setMeals] = useState([]);

  useEffect(() => {
    setMeals(JSON.parse(localStorage.getItem('mealPlans')) || []);
  }, []);

  return (
    <div className="meal-page">
      <h1>Meal Planner</h1>
      <ul>
        {meals.map((m,i)=><li key={i}>{m.day}: {m.meals}</li>)}
      </ul>
    </div>
  );
}
