import { useState,useEffect } from 'react';
export default function Shopping(){
  const [shopping,setShopping]=useState([]);
  useEffect(()=>{ setShopping(JSON.parse(localStorage.getItem('lifeax_shopping'))||[]); },[]);
  return <div><h1>Shopping List</h1>{shopping.map((s,i)=><div key={i}>{s}</div>)}</div>;
}
