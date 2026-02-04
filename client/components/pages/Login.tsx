import React, { useState } from 'react';
import { saveUserLS } from '@/lib/trpc';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
export const Login: React.FC<{onLogin:()=>void}> = ({onLogin}) => {
  const [name,setName]=useState('');
  const submit=()=>{ if(name.trim()){ saveUserLS({id:'1',name}); onLogin(); } };
  return <div>
    <h1>Login</h1>
    <label>Name: <Input value={name} onChange={setName}/></label>
    <Button onClick={submit}>Login</Button>
  </div>;
};
