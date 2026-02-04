import React, { useEffect, useState } from 'react';
import { trpc, loadNotificationsLS, saveNotificationsLS } from '@/lib/trpc';
import { Button } from '@/components/ui/Button';

export const Notifications: React.FC = () => {
  const [notes,setNotes] = useState<any[]>([]);
  useEffect(()=>{
    const localNotes = loadNotificationsLS(); 
    if(localNotes.length){ setNotes(localNotes); }
    trpc.getNotifications.query().then(n=>{ setNotes(n); saveNotificationsLS(n); });
  },[]);

  const markRead=(id:string)=>{
    trpc.markNotificationRead.mutate({id}).then(()=>{
      const updated = notes.map(n=>n.id===id?{...n,read:true}:n);
      setNotes(updated); saveNotificationsLS(updated);
    });
  };

  return <div>
    <h1>Notifications</h1>
    <ul>{notes.map(n=><li key={n.id}>{n.message} [{n.read?'read':'unread'}] <Button onClick={()=>markRead(n.id)}>Mark read</Button></li>)}</ul>
  </div>;
};
