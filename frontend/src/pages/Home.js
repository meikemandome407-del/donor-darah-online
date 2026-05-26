import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MapDonors from '../components/MapDonors';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const [stats, setStats] = useState(null);
  const [stocks, setStocks] = useState({});
  const [loadingStocks, setLoadingStocks] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const role = user?.role;

  useEffect(() => {
    api.get('/stats').then(res => setStats(res.data)).catch(err => console.error(err));
    api.get('/stocks').then(res => {
      setStocks(res.data);
      setLoadingStocks(false);
    }).catch(err => {
      console.error(err);
      setLoadingStocks(false);
    });
  }, []);

  // CTA personal berdasarkan role user yang sedang login
  const renderCTA = () => {
    if (!token) {
      // Belum login
      return (
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
          <Link to="/register">
            <button style={{ width: 'auto', padding: '0.9rem 2.2rem', background: 'white', color: '#e74c3c', border: '2px solid white', fontWeight: '800', fontSize: '1.05rem', borderRadius: '50px', cursor: 'pointer' }}>
              🩸 Daftar Sebagai Donor
            </button>
          </Link>
          <Link to="/search">
            <button style={{ width: 'auto', padding: '0.9rem 2.2rem', background: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid rgba(255,255,255,0.6)', fontWeight: '700', fontSize: '1.05rem', borderRadius: '50px', cursor: 'pointer' }}>
              🔍 Cari Donor Sekarang
            </button>
          </Link>
        </div>
      );
    }

    if (role === 'donor') {
      return (
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
          <Link to="/profile">
            <button style={{ width: 'auto', padding: '0.9rem 2.2rem', background: 'white', color: '#e74c3c', border: '2px solid white', fontWeight: '800', fontSize: '1.05rem', borderRadius: '50px', cursor: 'pointer' }}>
              👤 Lihat Profil Saya
            </button>
          </Link>
          <Link to="/search">
            <button style={{ width: 'auto', padding: '0.9rem 2.2rem', background: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid rgba(255,255,255,0.6)', fontWeight: '700', fontSize: '1.05rem', borderRadius: '50px', cursor: 'pointer' }}>
              🔍 Cari Donor Lain
            </button>
          </Link>
        </div>
      );
    }

    if (role === 'recipient') {
      return (
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
          <Link to="/request">
            <button style={{ width: 'auto', padding: '0.9rem 2.2rem', background: 'white', color: '#e74c3c', border: '2px solid white', fontWeight: '800', fontSize: '1.05rem', borderRadius: '50px', cursor: 'pointer' }}>
              🚨 Minta Darah Sekarang
            </button>
          </Link>
          <Link to="/my-requests">
            <button style={{ width: 'auto', padding: '0.9rem 2.2rem', background: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid rgba(255,255,255,0.6)', fontWeight: '700', fontSize: '1.05rem', borderRadius: '50px', cursor: 'pointer' }}>
              📋 Lihat Riwayat Saya
            </button>
          </Link>
        </div>
      );
    }

    if (role === 'admin') {
      return (
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
          <Link to="/dashboard">
            <button style={{ width: 'auto', padding: '0.9rem 2.2rem', background: 'white', color: '#e74c3c', border: '2px solid white', fontWeight: '800', fontSize: '1.05rem', borderRadius: '50px', cursor: 'pointer' }}>
              ⚙️ Buka Dashboard Admin
            </button>
          </Link>
          <Link to="/search">
            <button style={{ width: 'auto', padding: '0.9rem 2.2rem', background: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid rgba(255,255,255,0.6)', fontWeight: '700', fontSize: '1.05rem', borderRadius: '50px', cursor: 'pointer' }}>
              🔍 Lihat Data Donor
            </button>
          </Link>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="container">
      {/* Hero Banner dengan sapaan personal */}
      <div className="hero">
        {token && role === 'recipient' ? (
          <>
            <h1>Kami Siap Membantu Anda 💙</h1>
            <p>Temukan pendonor terdekat atau ajukan permintaan darah darurat. Ratusan pahlawan siap membantu.</p>
          </>
        ) : token && role === 'donor' ? (
          <>
            <h1>Terima Kasih, Pahlawan! 🩸</h1>
            <p>Kontribusi Anda sangat berarti. Pantau status ketersediaan Anda dan catat riwayat donasi Anda.</p>
          </>
        ) : token && role === 'admin' ? (
          <>
            <h1>Selamat Datang, Admin 🏥</h1>
            <p>Kelola permintaan darah, stok kantong, dan data relawan melalui dashboard yang terintegrasi.</p>
          </>
        ) : (
          <>
            <h1>Selamat Datang di Donor Darah Online</h1>
            <p>Selamatkan nyawa dengan mendonorkan darah. Temukan donor terdekat sekarang juga!</p>
          </>
        )}
        {renderCTA()}
      </div>

      {/* Stats */}
      {stats ? (
        <div className="stats-section">
          <div className="stat-card"><h3>🩸 {stats.totalDonors}</h3><p>Total Donor</p></div>
          <div className="stat-card"><h3>✅ {stats.availableDonors}</h3><p>Donor Tersedia</p></div>
          <div className="stat-card"><h3>📋 {stats.totalRequests}</h3><p>Permintaan Darah</p></div>
          <div className="stat-card"><h3>⏳ {stats.pendingRequests}</h3><p>Pending</p></div>
        </div>
      ) : <LoadingSpinner />}

      {/* Stok Darah Widget */}
      <div style={{ marginTop: '4rem', marginBottom: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2.2rem', color: '#2f3542', marginBottom: '0.5rem' }}>🏥 Ketersediaan Stok Darah Terkini</h2>
          <p style={{ color: '#747d8c', fontSize: '1.1rem' }}>
            {role === 'recipient'
              ? 'Cek ketersediaan darah yang Anda butuhkan sebelum mengajukan permintaan.'
              : 'Informasi stok kantong darah real-time dari instansi Palang Merah / Rumah Sakit terdaftar.'}
          </p>
        </div>
        {loadingStocks ? (
          <LoadingSpinner />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1.2rem', justifyContent: 'center' }}>
            {Object.keys(stocks).map(type => {
              const q = stocks[type]?.quantity || 0;
              const isLow = q === 0;
              return (
                <div
                  key={type}
                  className={isLow ? 'pulse-empty' : ''}
                  style={{
                    background: isLow
                      ? 'linear-gradient(135deg, rgba(255,71,87,0.1), rgba(255,107,129,0.15))'
                      : 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
                    border: isLow ? '2px solid rgba(255,71,87,0.4)' : '1px solid var(--glass-border)',
                    borderRadius: '20px', padding: '1.2rem 0.8rem', textAlign: 'center',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.05)', backdropFilter: 'blur(10px)',
                    transition: 'transform 0.3s ease', cursor: role === 'recipient' ? 'pointer' : 'default'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  onClick={() => {
                    // Pasien klik golongan darah → langsung navigasi ke form permintaan
                    if (role === 'recipient') window.location.href = '/request';
                  }}
                >
                  <div style={{ fontSize: '2.2rem', fontWeight: '800', color: isLow ? '#ff4757' : '#2f3542' }}>{type}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: isLow ? '#ff4757' : '#2ecc71', margin: '0.3rem 0' }}>
                    {q} <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#747d8c' }}>kntg</span>
                  </div>
                  <div style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 'bold', background: isLow ? '#ff4757' : '#2ecc71', color: 'white', marginTop: '0.4rem' }}>
                    {isLow ? 'KOSONG' : 'AMAN'}
                  </div>
                  {role === 'recipient' && isLow && (
                    <div style={{ fontSize: '0.7rem', color: '#ff4757', marginTop: '0.3rem' }}>Klik untuk minta</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {role === 'recipient' && (
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <p style={{ color: '#747d8c', fontSize: '0.95rem' }}>💡 Klik kartu golongan darah di atas untuk langsung mengajukan permintaan darah.</p>
          </div>
        )}
      </div>

      {/* Peta Donor */}
      <h2 className="section-title">📍 Peta Lokasi Donor Aktif</h2>
      <MapDonors />

      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <Link to="/search">
          <button style={{ width: 'auto', minWidth: '250px' }}>🔍 Cari Donor Terdekat</button>
        </Link>
      </div>
    </div>
  );
};

export default Home;