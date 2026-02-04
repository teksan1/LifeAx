export default function TaskItem({ task, onComplete }) {
  return (
    <div className="task-item">
      <input type="checkbox" checked={task.completed} onChange={() => onComplete(task.id)} />
      <span className={task.completed ? 'completed' : ''}>{task.name}</span>
    </div>
  );
}
