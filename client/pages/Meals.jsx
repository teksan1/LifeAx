import { useState,useEffect } from 'react';
export default function Meals(){
  const [meals,setMeals]=useState([]);
  useEffect(()=>{ setMeals(JSON.parse(localStorage.getItem('lifeax_meals'))||[]); },[]);
  return <div><h1>Meals</h1>{meals.map((m,i)=><div key={i}>{m.day}: {m.meals}</div>)}</div>;
}
