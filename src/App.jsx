import './App.css'
import Welcome from './Welcome';
import BodyDoubleForm from './BodyDoubleForm';
import React, { useState, useEffect } from 'react';
import SignupPage from './pages/SignupPage';
import AvatarDefinitionPage from './pages/AvatarDefinitionPage';

function migrateUserObject(user) {
  // Fix legacy/incomplete user objects in localStorage
  if (!user) return null;
  // If id is missing but user_id is present, fix it
  if (!user.id && user.user_id) user.id = user.user_id;
  // If id is missing, try to fetch from backend using access_token
  if (!user.id && user.access_token) {
    // Synchronously fetch /me (not ideal, but ensures user.id is set)
    const req = new XMLHttpRequest();
    req.open('GET', 'http://localhost:8000/me', false); // synchronous
    req.setRequestHeader('Authorization', `Bearer ${user.access_token}`);
    try {
      req.send(null);
      if (req.status === 200) {
        const me = JSON.parse(req.responseText);
        if (me && me.id) user.id = me.id;
      }
    } catch {}
  }
  // If name is missing, set to empty string
  if (!user.name) user.name = '';
  // If email is missing, set to empty string
  if (!user.email) user.email = '';
  return user;
}

function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('humanfit_user');
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      const migrated = migrateUserObject(parsed);
      // Save back the migrated user if changed
      if (migrated && JSON.stringify(migrated) !== stored) {
        localStorage.setItem('humanfit_user', JSON.stringify(migrated));
      }
      return migrated;
    } catch {
      return null;
    }
  });
  const [avatar, setAvatar] = useState(null);

  // Fetch avatar for user on login
  useEffect(() => {
    if (user && user.id && user.access_token) {
      fetch(`http://localhost:8000/me/avatar`, {
        headers: { 'Authorization': `Bearer ${user.access_token}` }
      })
        .then(res => {
          if (res.status === 401) {
            // Token invalid/expired, force logout
            localStorage.removeItem('humanfit_user');
            setUser(null);
            setAvatar(null);
            return null;
          }
          return res.ok ? res.json() : null;
        })
        .then(data => setAvatar(data))
        .catch(() => setAvatar(null));
    } else {
      setAvatar(null);
    }
  }, [user]);

  // Whenever user changes, persist to localStorage
  useEffect(() => {
    if (user && user.id && user.access_token) {
      localStorage.setItem('humanfit_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('humanfit_user');
    }
  }, [user]);

  // Add logout handler
  const handleLogout = () => {
    setUser(null);
    setAvatar(null);
    localStorage.removeItem('humanfit_user');
  };

  if (!user) {
    // Show landing page with login/signup
    return <Welcome onAuthSuccess={setUser} />;
  }
  if (!avatar) {
    // Redirect to avatar definition page
    window.location.href = '/define-avatar';
    return null;
  }

  return (
    <div className="app-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Welcome, {user.name || user.email}!</h2>
        <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', borderRadius: 8, fontWeight: 'bold' }}>Logout</button>
      </div>
      <p>Your body double is ready. Proceed to the fitting room experience.</p>
      {/* Fitting room and basket UI to be added next */}
    </div>
  );
}

export default App
