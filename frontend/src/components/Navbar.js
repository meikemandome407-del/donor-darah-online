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
          <Link to="/" className="logo">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="var(--primary)" style={{ filter: 'drop-shadow(0 4px 6px rgba(211,47,47,0.3))' }}>
              <path d="M12 2C12 2 4 9.4 4 15C4 19.4183 7.58172 23 12 23C16.4183 23 20 19.4183 20 15C20 9.4 12 2 12 2Z" />
              <path d="M12 23C16.418 23 20 19.418 20 15C20 9.4 12 2 12 2C12 2 4 9.4 4 15C4 16.55 4.434 17.989 5.176 19.16C6.772 17.182 8.783 15.393 11 13.916C11 13.916 11 13.916 11.001 13.916C12.441 12.868 13.882 12.274 15.344 12.196C15.86 12.169 16.368 12.222 16.85 12.35C18.17 12.7 19.167 13.682 19.648 14.93C19.877 15.524 20 16.19 20 16.91C20 16.91 20 16.911 20 16.911C19.999 18.256 19.444 19.467 18.55 20.323C16.892 21.91 14.577 22.887 12 22.996V23Z" fill="white" fillOpacity="0.2"/>
            </svg>
            <span>DONOR DARAH</span>
          </Link>
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