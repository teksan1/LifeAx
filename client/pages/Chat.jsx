import { useState,useEffect } from 'react';
export default function Chat(){
  const [log,setLog]=useState([]);
  useEffect(()=>{ setLog(JSON.parse(localStorage.getItem('lifeax_ai_chat'))||[]); },[]);
  return <div>
    <h1>AI Chat</h1>
    {log.map((l,i)=><div key={i}><b>{l.from}:</b> {l.message}</div>)}
  </div>;
}
