import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      // Redirect berdasarkan role
      if (res.data.user.role === 'admin') {
        navigate('/dashboard');
      } else if (res.data.user.role === 'recipient') {
        navigate('/request');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 500 }}>
      <div className="card">
        <h2 style={{ textAlign: 'center' }}>🔐 Login</h2>
        {error && <div style={{ background: '#fee2e2', color: '#c0392b', padding: '0.75rem', borderRadius: '12px', marginBottom: '1rem' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" disabled={loading}>{loading ? 'Memproses...' : 'Login'}</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1rem' }}>Belum punya akun? <Link to="/register" style={{ color: '#d32f2f' }}>Daftar Akun Baru</Link></p>
      </div>
    </div>
  );
};

export default Login;