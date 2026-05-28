import React, { useEffect, useState } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'stocks' | 'donors'
  const [requests, setRequests] = useState([]);
  const [stocks, setStocks] = useState({});
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingStock, setSavingStock] = useState({});
  const [filters, setFilters] = useState({
    bloodType: 'all',
    status: 'all',
  });
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/requests');
      let data = res.data;
      if (filters.bloodType !== 'all') {
        data = data.filter(req => req.bloodType === filters.bloodType);
      }
      if (filters.status !== 'all') {
        data = data.filter(req => req.status === filters.status);
      }
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/stocks');
      setStocks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const res = await api.get('/donors/admin/all');
      setDonors(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.role === 'admin') {
      if (activeTab === 'requests') fetchRequests();
      else if (activeTab === 'stocks') fetchStocks();
      else if (activeTab === 'donors') fetchDonors();
    }
  }, [user.role, filters, activeTab]);

  const handleDonorDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data relawan ini?')) return;
    try {
      await api.delete(`/donors/admin/${id}`);
      setDonors(donors.filter(d => d.id !== id));
    } catch (err) {
      alert('Gagal menghapus relawan');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/requests/${id}/status`, { status });
      fetchRequests(); // refresh
    } catch (err) {
      alert('Gagal update status');
    }
  };

  const deleteRequest = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus permohonan ini secara permanen dari database?')) {
      try {
        await api.delete(`/requests/${id}`);
        fetchRequests();
      } catch (err) {
        alert('Gagal menghapus permohonan');
      }
    }
  };

  const handleStockChange = (type, value) => {
    setStocks(prev => ({
      ...prev,
      [type]: { ...prev[type], quantity: parseInt(value || 0) }
    }));
  };

  const handleStockSave = async (type) => {
    setSavingStock(prev => ({ ...prev, [type]: true }));
    try {
      const q = stocks[type]?.quantity || 0;
      await api.post('/stocks/update', { bloodType: type, quantity: q });
      alert(`✅ Stok ${type} berhasil diperbarui menjadi ${q} kantong.`);
    } catch (err) {
      alert(`❌ Gagal update stok ${type}`);
    } finally {
      setSavingStock(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleStockDelete = async (type) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus / mereset stok ${type} menjadi kosong (0)?`)) {
      setSavingStock(prev => ({ ...prev, [type]: true }));
      try {
        await api.delete(`/stocks/${encodeURIComponent(type)}`);
        alert(`✅ Stok ${type} berhasil direset/dihapus menjadi 0.`);
        fetchStocks();
      } catch (err) {
        alert(`❌ Gagal menghapus stok ${type}`);
      } finally {
        setSavingStock(prev => ({ ...prev, [type]: false }));
      }
    }
  };

  const exportCSV = async () => {
    try {
      const response = await api.get('/requests/admin/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'permintaan_darah.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Gagal ekspor data');
    }
  };

  if (user.role !== 'admin') {
    return <div className="container">Halaman ini hanya untuk admin.</div>;
  }

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR KIRI */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h3>⚙️ Menu Admin</h3>
        </div>
        <div className="sidebar-menu">
          <button className={`sidebar-btn ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
            📋 Semua Permintaan
          </button>
          <button className={`sidebar-btn ${activeTab === 'stocks' ? 'active' : ''}`} onClick={() => setActiveTab('stocks')}>
            🩸 Stok Kantong Darah
          </button>
          <button className={`sidebar-btn ${activeTab === 'donors' ? 'active' : ''}`} onClick={() => setActiveTab('donors')}>
            👥 Data Relawan
          </button>
          <hr />
          {activeTab === 'requests' && (
            <>
              <button className="sidebar-btn" onClick={() => setFilters({...filters, status: 'pending'})}>⏳ Pending</button>
              <button className="sidebar-btn" onClick={() => setFilters({...filters, status: 'fulfilled'})}>✅ Terpenuhi</button>
              <button className="sidebar-btn" onClick={() => setFilters({...filters, status: 'cancelled'})}>❌ Dibatalkan</button>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                <button className="sidebar-btn" style={{ fontSize: '0.8rem', padding: '8px' }} onClick={() => setFilters({...filters, bloodType: 'A+'})}>🩸 A+</button>
                <button className="sidebar-btn" style={{ fontSize: '0.8rem', padding: '8px' }} onClick={() => setFilters({...filters, bloodType: 'A-'})}>🩸 A-</button>
                <button className="sidebar-btn" style={{ fontSize: '0.8rem', padding: '8px' }} onClick={() => setFilters({...filters, bloodType: 'B+'})}>🩸 B+</button>
                <button className="sidebar-btn" style={{ fontSize: '0.8rem', padding: '8px' }} onClick={() => setFilters({...filters, bloodType: 'B-'})}>🩸 B-</button>
                <button className="sidebar-btn" style={{ fontSize: '0.8rem', padding: '8px' }} onClick={() => setFilters({...filters, bloodType: 'AB+'})}>🩸 AB+</button>
                <button className="sidebar-btn" style={{ fontSize: '0.8rem', padding: '8px' }} onClick={() => setFilters({...filters, bloodType: 'AB-'})}>🩸 AB-</button>
                <button className="sidebar-btn" style={{ fontSize: '0.8rem', padding: '8px' }} onClick={() => setFilters({...filters, bloodType: 'O+'})}>🩸 O+</button>
                <button className="sidebar-btn" style={{ fontSize: '0.8rem', padding: '8px' }} onClick={() => setFilters({...filters, bloodType: 'O-'})}>🩸 O-</button>
              </div>
              <hr />
              <button className="sidebar-btn" onClick={() => setFilters({bloodType: 'all', status: 'all'})}>🔄 Reset Filter</button>
              <button className="sidebar-btn" onClick={exportCSV}>📥 Ekspor CSV</button>
            </>
          )}
        </div>
        <div className="sidebar-footer">
          <small>© Donor Darah Online</small>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="dashboard-content">
        {activeTab === 'requests' && (
          <>
            <div className="dashboard-header">
              <h2>📋 Dashboard Permintaan Darah</h2>
              <span className="request-count">Total: {requests.length} permintaan</span>
            </div>
            {loading ? (
              <LoadingSpinner />
            ) : requests.length === 0 ? (
              <div className="card">Tidak ada permintaan.</div>
            ) : (
              <div className="requests-list">
                {requests.map(req => (
                  <div key={req.id} className="card request-card">
                    <div className="request-info">
                      <h3>🩸 {req.patientName}</h3>
                      <p><strong>Gol. Darah:</strong> {req.bloodType}</p>
                      <p><strong>RS:</strong> {req.hospital}</p>
                      <p><strong>Alamat RS:</strong> {req.address}</p>
                      <p><strong>Kontak:</strong> {req.contact}</p>
                      <p><strong>Tanggal:</strong> {new Date(req.createdAt).toLocaleDateString('id-ID')}</p>
                      <p><strong>Status:</strong> 
                        {req.status === 'pending' && <span className="status-pending"> ⏳ Pending</span>}
                        {req.status === 'fulfilled' && <span className="status-fulfilled"> ✅ Terpenuhi</span>}
                        {req.status === 'cancelled' && <span className="status-cancelled"> ❌ Dibatalkan</span>}
                      </p>
                    </div>
                    <div className="request-actions" style={{ display: 'flex', gap: '0.8rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                      {req.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(req.id, 'fulfilled')} className="btn-fulfilled">✅ Terpenuhi</button>
                          <button onClick={() => updateStatus(req.id, 'cancelled')} className="btn-cancelled">❌ Batalkan</button>
                        </>
                      )}
                      <button 
                        onClick={() => deleteRequest(req.id)} 
                        className="btn-delete" 
                        style={{ background: '#d32f2f', color: 'white', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 10px rgba(211,47,47,0.2)', width: 'max-content' }}
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        
        {activeTab === 'stocks' && (
          <>
            <div className="dashboard-header">
              <h2>🩸 Manajemen Stok Kantong Darah</h2>
              <p>Perbarui ketersediaan kantong darah di instansi Anda secara real-time.</p>
            </div>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="stock-grid" style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1.5rem'
              }}>
                {Object.keys(stocks).map(type => (
                  <div key={type} className="stock-card" style={{
                    background: 'white', padding: '1.5rem', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: 'center', border: '1px solid rgba(0,0,0,0.05)'
                  }}>
                    <div style={{
                      fontSize: '2.5rem', fontWeight: 'bold', color: '#d32f2f', marginBottom: '0.5rem'
                    }}>{type}</div>
                    <div style={{ marginBottom: '1rem', color: '#747d8c', fontSize: '0.9rem' }}>
                      Update: {stocks[type]?.updatedAt ? new Date(stocks[type].updatedAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Belum ada'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.2rem' }}>
                      <input 
                        type="number" 
                        min="0" 
                        value={stocks[type]?.quantity || 0}
                        onChange={(e) => handleStockChange(type, e.target.value)}
                        style={{ width: '80px', textAlign: 'center', fontSize: '1.2rem', padding: '0.5rem', borderRadius: '12px', border: '2px solid #eee' }}
                      />
                      <span style={{ fontWeight: 'bold', color: '#2f3542' }}>Kantong</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <button 
                        onClick={() => handleStockSave(type)}
                        disabled={savingStock[type]}
                        style={{
                          background: 'linear-gradient(135deg, #2ecc71, #27ae60)', color: 'white', border: 'none', padding: '0.6rem 0.8rem', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', flex: 1, boxShadow: '0 5px 15px rgba(46,204,113,0.3)', fontSize: '0.9rem'
                        }}
                      >
                        {savingStock[type] ? '...' : '💾 Simpan'}
                      </button>
                      <button 
                        onClick={() => handleStockDelete(type)}
                        disabled={savingStock[type]}
                        style={{
                          background: 'linear-gradient(135deg, #d32f2f, #e53935)', color: 'white', border: 'none', padding: '0.6rem 0.8rem', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', flex: 1, boxShadow: '0 5px 15px rgba(211,47,47,0.3)', fontSize: '0.9rem'
                        }}
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'donors' && (
          <>
            <div className="dashboard-header">
              <h2>👥 Rekam Jejak & Akun Relawan Terdaftar</h2>
              <p>Daftar lengkap relawan yang terdaftar di sistem beserta riwayat kesiapan dan tanggal donasi terakhir.</p>
            </div>
            {loading ? (
              <LoadingSpinner />
            ) : donors.length === 0 ? (
              <div className="card">Belum ada relawan terdaftar.</div>
            ) : (
              <div style={{ background: 'white', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', overflowX: 'auto', marginTop: '1.5rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #eee', color: '#747d8c' }}>
                      <th style={{ padding: '1rem' }}>Nama Lengkap</th>
                      <th style={{ padding: '1rem' }}>Gol. Darah</th>
                      <th style={{ padding: '1rem' }}>Telepon / Email</th>
                      <th style={{ padding: '1rem' }}>Alamat GPS</th>
                      <th style={{ padding: '1rem' }}>Status Siaga</th>
                      <th style={{ padding: '1rem' }}>Donasi Terakhir</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donors.map(donor => (
                      <tr key={donor.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '1rem', fontWeight: 'bold', color: '#2f3542' }}>{donor.fullName}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ background: 'rgba(211,47,47,0.1)', color: '#d32f2f', padding: '4px 10px', borderRadius: '8px', fontWeight: 'bold' }}>
                            {donor.bloodType}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div>{donor.phone}</div>
                          <div style={{ fontSize: '0.85rem', color: '#747d8c' }}>{donor.user?.email}</div>
                        </td>
                        <td style={{ padding: '1rem', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {donor.address}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {donor.isAvailable ? (
                            <span style={{ background: '#d4edda', color: '#155724', padding: '4px 12px', borderRadius: '50px', fontSize: '0.85rem' }}>✅ Siaga</span>
                          ) : (
                            <span style={{ background: '#f8d7da', color: '#721c24', padding: '4px 12px', borderRadius: '50px', fontSize: '0.85rem' }}>⛔ Pemulihan / Off</span>
                          )}
                        </td>
                        <td style={{ padding: '1rem', color: '#747d8c', fontSize: '0.9rem' }}>
                          {donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Belum ada'}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <button 
                            onClick={() => handleDonorDelete(donor.id)}
                            style={{
                              background: '#d32f2f', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '12px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(211,47,47,0.2)'
                            }}
                          >
                            🗑️ Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;