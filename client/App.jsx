import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Settings from './pages/Settings';
import MealPlanner from './pages/MealPlanner';
import ShoppingList from './pages/ShoppingList';

export default function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Home</Link> | 
        <Link to="/chat">Chat</Link> | 
        <Link to="/meal">Meals</Link> | 
        <Link to="/shopping">Shopping</Link> | 
        <Link to="/settings">Settings</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/meal" element={<MealPlanner />} />
        <Route path="/shopping" element={<ShoppingList />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}
