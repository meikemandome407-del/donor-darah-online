import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState({});
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const fetchRequests = async () => {
    try {
      const res = await api.get('/requests/my');
      setRequests(res.data);
    } catch (err) {
      setError('Gagal mengambil riwayat permintaan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan permintaan ini?')) return;
    setCancelling(prev => ({ ...prev, [id]: true }));
    try {
      await api.patch(`/requests/${id}/cancel`);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r));
      showToast('✅ Permintaan berhasil dibatalkan.');
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.error || 'Gagal membatalkan permintaan.'));
    } finally {
      setCancelling(prev => ({ ...prev, [id]: false }));
    }
  };

  const statusConfig = {
    pending: { label: '⏳ Menunggu', color: '#f39c12', bg: 'rgba(243,156,18,0.1)', border: 'rgba(243,156,18,0.3)' },
    fulfilled: { label: '✅ Terpenuhi', color: '#27ae60', bg: 'rgba(39,174,96,0.1)', border: 'rgba(39,174,96,0.3)' },
    cancelled: { label: '❌ Dibatalkan', color: '#c0392b', bg: 'rgba(192,57,43,0.1)', border: 'rgba(192,57,43,0.3)' },
  };

  const pending = requests.filter(r => r.status === 'pending').length;
  const fulfilled = requests.filter(r => r.status === 'fulfilled').length;

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="container"><div className="card" style={{ color: 'red' }}>{error}</div></div>;

  return (
    <div className="container">
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999,
          background: toast.startsWith('✅') ? '#27ae60' : '#d32f2f',
          color: 'white', padding: '1rem 1.5rem', borderRadius: '16px',
          fontWeight: '600', boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          animation: 'fadeInUp 0.3s ease'
        }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#2f3542' }}>📋 Riwayat Permintaan Darah</h1>
        <p style={{ color: '#747d8c', fontSize: '1.1rem' }}>Pantau status semua permintaan darah yang pernah Anda ajukan.</p>
      </div>

      {requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(255,255,255,0.8)', borderRadius: '24px', border: '1px dashed rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
          <h3 style={{ color: '#2f3542', marginBottom: '0.5rem' }}>Belum ada permintaan darah.</h3>
          <p style={{ color: '#747d8c', marginBottom: '1.5rem' }}>Buat permintaan pertama Anda sekarang jika sedang membutuhkan darah.</p>
          <Link to="/request">
            <button style={{ width: 'auto', padding: '0.8rem 2rem', background: 'linear-gradient(135deg, #d32f2f, #b71c1c)', boxShadow: '0 4px 15px rgba(211,47,47,0.3)' }}>
              🩸 Buat Permintaan Baru
            </button>
          </Link>
        </div>
      ) : (
        <>
          {/* Ringkasan Statistik */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Total Permintaan', value: requests.length, color: '#3498db', icon: '📋' },
              { label: 'Menunggu', value: pending, color: '#f39c12', icon: '⏳' },
              { label: 'Terpenuhi', value: fulfilled, color: '#27ae60', icon: '✅' },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, minWidth: '140px', background: 'white', borderRadius: '16px', padding: '1.2rem', textAlign: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', border: `1px solid rgba(0,0,0,0.05)` }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '0.2rem' }}>{s.icon}</div>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.85rem', color: '#747d8c', fontWeight: '600' }}>{s.label}</div>
              </div>
            ))}
            <div style={{ flex: 1, minWidth: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Link to="/request">
                <button style={{ width: 'auto', padding: '0.8rem 1.5rem', fontSize: '0.95rem', background: 'linear-gradient(135deg, #d32f2f, #b71c1c)' }}>
                  + Permintaan Baru
                </button>
              </Link>
            </div>
          </div>

          {/* Daftar Permintaan */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {requests.map(req => {
              const cfg = statusConfig[req.status] || statusConfig.pending;
              return (
                <div key={req.id} style={{
                  background: 'white', borderRadius: '20px', padding: '1.5rem 2rem',
                  boxShadow: '0 5px 20px rgba(0,0,0,0.05)', border: `1px solid rgba(0,0,0,0.05)`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap',
                  borderLeft: `5px solid ${cfg.color}`, transition: 'transform 0.2s, box-shadow 0.2s'
                }}>
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: '800', background: 'rgba(211,47,47,0.1)', color: '#d32f2f', padding: '4px 12px', borderRadius: '8px' }}>
                        {req.bloodType}
                      </span>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#2f3542' }}>🩸 {req.patientName}</h3>
                      <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, padding: '3px 12px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: '700' }}>
                        {cfg.label}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem 1.5rem', fontSize: '0.95rem', color: '#555' }}>
                      <p style={{ margin: 0 }}><strong>🏥 RS:</strong> {req.hospital}</p>
                      <p style={{ margin: 0 }}><strong>📅 Tanggal:</strong> {new Date(req.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      <p style={{ margin: 0, gridColumn: 'span 2' }}><strong>📍 Alamat:</strong> {req.address}</p>
                      <p style={{ margin: 0 }}><strong>📞 Kontak:</strong> {req.contact}</p>
                    </div>
                  </div>

                  {/* Aksi — hanya tampil jika masih pending */}
                  {req.status === 'pending' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                      <button
                        onClick={() => handleCancel(req.id)}
                        disabled={cancelling[req.id]}
                        style={{ background: 'none', border: '2px solid #d32f2f', color: '#d32f2f', padding: '0.5rem 1.2rem', borderRadius: '50px', fontWeight: '700', cursor: 'pointer', width: 'auto', fontSize: '0.9rem', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.target.style.background = '#d32f2f'; e.target.style.color = 'white'; }}
                        onMouseLeave={e => { e.target.style.background = 'none'; e.target.style.color = '#d32f2f'; }}
                      >
                        {cancelling[req.id] ? '⏳...' : '❌ Batalkan'}
                      </button>
                      <span style={{ fontSize: '0.78rem', color: '#aaa', textAlign: 'right' }}>Menunggu konfirmasi PMI</span>
                    </div>
                  )}
                  {req.status === 'fulfilled' && (
                    <div style={{ textAlign: 'center', padding: '0.8rem 1.2rem', background: 'rgba(39,174,96,0.1)', borderRadius: '12px', border: '1px solid rgba(39,174,96,0.3)' }}>
                      <div style={{ fontSize: '1.5rem' }}>🎉</div>
                      <div style={{ fontSize: '0.8rem', color: '#27ae60', fontWeight: '600' }}>Terpenuhi!</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default MyRequests;