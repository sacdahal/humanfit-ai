import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SignupPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Backend expects 'name', not 'username'
      const payload = { name: form.username, email: form.email, password: form.password };
      const res = await fetch('/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      let data = null;
      try { data = await res.json(); } catch {}
      if (!res.ok) {
        const detail = (data && (data.detail || data.error)) || res.statusText;
        throw new Error(detail || 'Signup failed');
      }
      localStorage.setItem('humanfit_user', JSON.stringify(data));
      navigate('/define-avatar');
    } catch (err) {
      setError('Signup failed. ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '60px auto', padding: 32, background: '#fff', borderRadius: 8, boxShadow: '0 2px 12px #0002' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Sign Up</h2>
      <label>Username:<input name="username" value={form.username} onChange={handleChange} required style={{ width: '100%', marginBottom: 12 }} /></label>
      <label>Email:<input name="email" type="email" value={form.email} onChange={handleChange} required style={{ width: '100%', marginBottom: 12 }} /></label>
      <label>Password:<input name="password" type="password" value={form.password} onChange={handleChange} required style={{ width: '100%', marginBottom: 20 }} /></label>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      <button type="submit" disabled={loading} style={{ width: '100%', padding: 10, fontWeight: 600, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}>{loading ? 'Signing up...' : 'Sign Up'}</button>
    </form>
  );
}