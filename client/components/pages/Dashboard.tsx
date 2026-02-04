import React, { useEffect, useState } from 'react';
import { trpc, loadUserLS } from '@/lib/trpc';

export const Dashboard: React.FC = () => {
  const [user,setUser] = useState<{id:string,name:string}|null>(null);

  useEffect(()=>{
    const u = loadUserLS();
    if(u){ setUser(u); }
    else { trpc.getCurrentUser.query().then(setUser); }
  },[]);

  return <div>
    <h1>Dashboard</h1>
    <p>Welcome, {user?.name || 'loading...'}</p>
  </div>;
};
