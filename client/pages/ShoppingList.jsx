import { useState, useEffect } from 'react';

export default function ShoppingList() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem('shoppingLists')) || []);
  }, []);

  return (
    <div className="shopping-page">
      <h1>Shopping List</h1>
      <ul>
        {items.map((item,i)=><li key={i}>{item}</li>)}
      </ul>
    </div>
  );
}
