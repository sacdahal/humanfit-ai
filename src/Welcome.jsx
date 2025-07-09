import React, { useState } from 'react';
import './App.css';
import ResetPasswordForm from './ResetPasswordForm';
import logo from './logo.png';

function Welcome({ onAuthSuccess }) {
  const [showLogin, setShowLogin] = useState(true);
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [fieldError, setFieldError] = useState({});

  // Always generate email for backend use only
  const getEmail = () => `${form.username}@humanfit.ai`;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldError({ ...fieldError, [e.target.name]: false });
    setError('');
  };

  const validateForm = () => {
    let valid = true;
    let fe = {};
    if (!form.username) {
      fe.username = true;
      valid = false;
    } else if (!/^\w+$/.test(form.username)) {
      fe.username = true;
      setError('Username must be alphanumeric (no spaces or special characters).');
      valid = false;
    }
    if (!form.password) {
      fe.password = true;
      valid = false;
    } else if (form.password.length < 6) {
      fe.password = true;
      setError('Password must be at least 6 characters.');
      valid = false;
    }
    setFieldError(fe);
    if (!valid && !error) setError('All fields are required.');
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;
    const email = getEmail();
    const endpoint = showLogin ? '/login' : '/signup';
    try {
      let payload;
      if (showLogin) {
        payload = { email, password: form.password };
      } else {
        payload = { name: form.username, email, password: form.password };
      }
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let errMsg = 'Authentication failed';
        try {
          const errData = await res.json();
          errMsg = errData.detail || JSON.stringify(errData) || errMsg;
        } catch {}
        throw new Error(errMsg);
      }
      const data = await res.json();
      let userObj;
      let accessToken = null;
      if (showLogin && data.access_token) {
        accessToken = data.access_token;
        const meRes = await fetch('http://localhost:8000/me', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        if (meRes.ok) {
          const me = await meRes.json();
          if (!me.id) throw new Error('Login failed: user ID missing from backend.');
          userObj = { ...me, access_token: accessToken };
        } else {
          throw new Error('Login failed: could not fetch user profile.');
        }
      } else if (!showLogin && (data.id || data.user_id)) {
        // After signup, automatically log in
        const loginRes = await fetch('/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: form.password })
        });
        if (!loginRes.ok) {
          let errMsg = 'Signup succeeded but login failed';
          try {
            const errData = await loginRes.json();
            errMsg = errData.detail || JSON.stringify(errData) || errMsg;
          } catch {}
          throw new Error(errMsg);
        }
        const loginData = await loginRes.json();
        accessToken = loginData.access_token;
        const meRes = await fetch('http://localhost:8000/me', {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        if (meRes.ok) {
          const me = await meRes.json();
          if (!me.id) throw new Error('Login failed: user ID missing from backend.');
          userObj = { ...me, access_token: accessToken };
        } else {
          throw new Error('Login failed: could not fetch user profile.');
        }
      } else {
        throw new Error('Login/signup failed: incomplete user data returned.');
      }
      localStorage.setItem('humanfit_user', JSON.stringify(userObj));
      onAuthSuccess(userObj);
    } catch (err) {
      setError(err.message);
    }
  };

  if (showReset) {
    return (
      <div className="welcome-container">
        <ResetPasswordForm />
        <button style={{ marginTop: 16 }} onClick={() => setShowReset(false)}>
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="welcome-container">
      <img src={logo} alt="HumanFit AI Logo" style={{ width: 120, margin: '0 auto 16px', display: 'block' }} />
      <h1>Welcome to HumanFit AI</h1>
      <p>Create your account or log in to start your virtual fitting experience.</p>
      <div className="auth-toggle">
        <button type="button" onClick={() => setShowLogin(true)} className={showLogin ? 'active' : ''}>Login</button>
        <button type="button" onClick={() => setShowLogin(false)} className={!showLogin ? 'active' : ''}>Sign Up</button>
      </div>
      <form className="auth-form" onSubmit={handleSubmit} style={{ maxWidth: 350, margin: '32px auto 0', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <label style={{ fontWeight: 600 }}>Username <span style={{ color: 'red' }}>*</span></label>
        <input
          type="text"
          name="username"
          placeholder="e.g. sachit"
          value={form.username}
          onChange={handleChange}
          style={{ borderColor: fieldError.username ? 'red' : '#ccc', borderWidth: 1, borderStyle: 'solid', borderRadius: 5, padding: 8 }}
        />
        <label style={{ fontWeight: 600 }}>Password <span style={{ color: 'red' }}>*</span></label>
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          style={{ borderColor: fieldError.password ? 'red' : '#ccc', borderWidth: 1, borderStyle: 'solid', borderRadius: 5, padding: 8 }}
        />
        <div style={{ margin: '8px 0', color: '#555', fontSize: 13 }}>
          <span style={{ color: '#888' }}>Email will be stored as <b>{getEmail()}</b></span>
        </div>
        <button type="submit" style={{ padding: '10px 0', fontWeight: 600, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, fontSize: 16 }}>{showLogin ? 'Login' : 'Sign Up'}</button>
        {showLogin && (
          <div style={{ marginTop: 10 }}>
            <button type="button" className="link-button" style={{ background: 'none', border: 'none', color: '#4faaff', cursor: 'pointer', textDecoration: 'underline', padding: 0 }} onClick={() => setShowReset(true)}>
              Forgot password?
            </button>
          </div>
        )}
        {error && <div className="error-msg" style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      </form>
      <div className="info-section">
        <h3>What is HumanFit AI?</h3>
        <p>
          HumanFit AI lets you create a body double, try on clothes virtually, and experience a personalized fitting room online. Mix and match outfits, see how they fit, and shop with confidence!
        </p>
      </div>
    </div>
  );
}

export default Welcome;
