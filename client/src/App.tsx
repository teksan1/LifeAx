import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Dashboard } from '@/components/pages/Dashboard';
import { Notifications } from '@/components/pages/Notifications';
import { Settings } from '@/components/pages/Settings';
import { Login } from '@/components/pages/Login';
import { loadUserLS } from '@/lib/trpc';

export const App: React.FC = () => {
  const [loggedIn, setLoggedIn] = useState(!!loadUserLS());

  const logout = () => setLoggedIn(false);
  const handleLogin = () => setLoggedIn(true);

  if (!loggedIn) return <Login onLogin={handleLogin} />;

  return (
    <Router>
      <nav>
        <Link to="/">Dashboard</Link> |{' '}
        <Link to="/notifications">Notifications</Link> |{' '}
        <Link to="/settings">Settings</Link>
        <button onClick={logout} style={{ marginLeft: '1em' }}>Logout</button>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
};

export default App;
