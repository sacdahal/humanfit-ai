import React, { useState } from 'react';

export default function ResetPasswordForm() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await fetch('http://localhost:8000/reset_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, new_password: newPassword })
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || 'Failed to reset password');
        return;
      }
      setMessage('Password reset successful!');
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '2rem auto', background: '#181818', padding: 24, borderRadius: 12 }}>
      <h2>Reset Password</h2>
      <label style={{ display: 'block', marginBottom: 12 }}>
        Email
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', marginTop: 4 }} />
      </label>
      <label style={{ display: 'block', marginBottom: 12 }}>
        New Password
        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required style={{ width: '100%', marginTop: 4 }} />
      </label>
      <button type="submit" style={{ padding: '0.7rem 1.5rem', fontWeight: 'bold', fontSize: '1.1rem', borderRadius: 8 }}>Reset Password</button>
      {message && <div style={{ color: 'lightgreen', marginTop: 16 }}>{message}</div>}
      {error && <div style={{ color: 'salmon', marginTop: 16 }}>{error}</div>}
    </form>
  );
}
