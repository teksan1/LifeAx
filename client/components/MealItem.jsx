export default function MealItem({ meal }) {
  return (
    <div className="meal-item">
      <strong>{meal.day}:</strong> {meal.meals}
    </div>
  );
}
