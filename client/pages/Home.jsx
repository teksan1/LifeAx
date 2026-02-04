import { useState, useEffect } from 'react';
export default function Home(){
  const [schedule,setSchedule]=useState([]);
  useEffect(()=>{ setSchedule(JSON.parse(localStorage.getItem('lifeax_schedule'))||[]); },[]);
  return <div>
    <h1>Home</h1>
    <h2>Today's Tasks</h2>
    {schedule.map((t,i)=><div key={i}>{t.time}: {t.task}</div>)}
  </div>;
}
