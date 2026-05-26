import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (token && user.role === 'admin') {
      const fetchCount = async () => {
        try {
          const res = await api.get('/requests/pending/count');
          setPendingCount(res.data.count);
        } catch (err) { console.error(err); }
      };
      fetchCount();
      const interval = setInterval(fetchCount, 10000);
      return () => clearInterval(interval);
    }
  }, [token, user.role]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* KIRI: Logo + Email di bawah */}
        <div className="nav-left">
          <Link to="/" className="logo">🩸 <span>DONOR DARAH</span></Link>
        </div>

        {/* TENGAH: Menu sejajar */}
        <div className="nav-menu">
          <Link to="/">Beranda</Link>
          <Link to="/search">Cari Donor</Link>
          <Link to="/about">Tentang</Link>
          {token && user.role === 'recipient' && <Link to="/request">Permintaan Darah</Link>}
          {token && user.role === 'recipient' && <Link to="/my-requests">Riwayat Permintaan</Link>}
          {token && user.role === 'recipient' && <Link to="/profile">Profil Saya</Link>}
          {token && (user.role === 'donor' || user.role === 'admin') && <Link to="/profile">Profil Saya</Link>}
          {token && user.role === 'admin' && (
            <Link to="/dashboard" className="dashboard-link">
              Dashboard {pendingCount > 0 && <span className="badge">{pendingCount}</span>}
            </Link>
          )}
        </div>

        {/* KANAN: Tombol Logout */}
        <div className="nav-right">
          {token ? (
            <button onClick={handleLogout} className="logout-btn">Keluar</button>
          ) : (
            <div className="auth-links">
              <Link to="/login">Login</Link>
              <Link to="/register">Daftar Baru</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;