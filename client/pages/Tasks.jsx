import { useEffect, useState } from 'react';
import TaskItem from '../components/TaskItem.jsx';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    setTasks(JSON.parse(localStorage.getItem('schedule')) || []);
  }, []);

  const addTask = () => {
    if(!newTask) return;
    const updated = [...tasks, { id: Date.now(), task: newTask, completed: false }];
    setTasks(updated);
    localStorage.setItem('schedule', JSON.stringify(updated));
    setNewTask('');
  };

  const toggleComplete = (id) => {
    const updated = tasks.map(t => t.id === id ? {...t, completed: !t.completed} : t);
    setTasks(updated);
    localStorage.setItem('schedule', JSON.stringify(updated));
  };

  return (
    <div className="tasks-page">
      <h1>Tasks</h1>
      <div className="task-input">
        <input value={newTask} onChange={e=>setNewTask(e.target.value)} placeholder="New Task"/>
        <button onClick={addTask}>Add</button>
      </div>
      <div className="task-list">
        {tasks.map(t => <TaskItem key={t.id} task={t} onComplete={toggleComplete} />)}
      </div>
    </div>
  );
}
