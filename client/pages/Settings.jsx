import { useState,useEffect } from 'react';
export default function Settings(){
  const [settings,setSettings]=useState({theme:'dark',language:'en'});
  useEffect(()=>{ setSettings(JSON.parse(localStorage.getItem('settings'))||{theme:'dark',language:'en'}); },[]);
  const updateSetting=(k,v)=>{ const u={...settings,[k]:v}; setSettings(u); localStorage.setItem('settings',JSON.stringify(u)); };
  return <div>
    <h1>Settings</h1>
    <div><label>Theme:</label>
      <select value={settings.theme} onChange={e=>updateSetting('theme',e.target.value)}><option value="dark">Dark</option><option value="light">Light</option></select>
    </div>
    <div><label>Language:</label>
      <select value={settings.language} onChange={e=>updateSetting('language',e.target.value)}><option value="en">English</option><option value="es">Spanish</option><option value="fr">French</option></select>
    </div>
    <button onClick={()=>alert('Settings saved!')}>Save</button>
  </div>;
}
