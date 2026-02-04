import React, { useEffect, useState } from 'react';
import { trpc, loadSettingsLS, saveSettingsLS } from '@/lib/trpc';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export const Settings: React.FC = () => {
  const [settings,setSettings] = useState<{theme:string,language:string}>({theme:'',language:''});

  useEffect(()=>{
    const local = loadSettingsLS(); 
    if(local){ setSettings(local); }
    trpc.getSettings.query().then(s=>{ setSettings(s); saveSettingsLS(s); });
  },[]);

  const save=()=>{ trpc.updateSettings.mutate(settings).then(()=>saveSettingsLS(settings)); };

  return <div>
    <h1>Settings</h1>
    <label>Theme: <Input value={settings.theme} onChange={v=>setSettings({...settings,theme:v})}/></label>
    <label>Language: <Input value={settings.language} onChange={v=>setSettings({...settings,language:v})}/></label>
    <Button onClick={save}>Save</Button>
  </div>;
};
