import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Planner from './pages/Planner';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Router>
      <div className="flex h-screen">
        <nav className="w-64 bg-gray-800 text-white p-4 flex flex-col">
          <h1 className="text-xl font-bold mb-6">LifeAx</h1>
          <Link className="mb-2 hover:bg-gray-700 p-2 rounded" to="/">Home</Link>
          <Link className="mb-2 hover:bg-gray-700 p-2 rounded" to="/chat">Chat</Link>
          <Link className="mb-2 hover:bg-gray-700 p-2 rounded" to="/planner">Planner</Link>
          <Link className="mb-2 hover:bg-gray-700 p-2 rounded" to="/settings">Settings</Link>
        </nav>
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
