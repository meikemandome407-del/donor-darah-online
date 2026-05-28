import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import BloodDrop from '../components/BloodDrop';

const RequestBlood = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ patientName: '', bloodType: 'A+', hospital: '', address: '', contact: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stocks, setStocks] = useState({});
  const [notifiedCount, setNotifiedCount] = useState(null);

  // Ambil data stok darah saat halaman dibuka
  useEffect(() => {
    api.get('/stocks')
      .then(res => setStocks(res.data))
      .catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/requests', form);
      setSuccess('Permintaan darah berhasil dikirim! Pendonor terdekat sedang dinotifikasi.');
      setNotifiedCount(res.data?.notifiedCount ?? null);
      setForm({ patientName: '', bloodType: 'A+', hospital: '', address: '', contact: '' });

      // Redirect ke riwayat permintaan setelah 3 detik
      setTimeout(() => {
        navigate('/my-requests');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal mengirim permintaan');
    } finally {
      setLoading(false);
    }
  };

  // Ambil info stok untuk golongan darah yang dipilih
  const selectedStock = stocks[form.bloodType];
  const stockQty = selectedStock?.quantity ?? null;
  const stockStatus = stockQty === null ? null : stockQty === 0 ? 'empty' : stockQty < 5 ? 'low' : 'ok';

  return (
    <div className="container" style={{ maxWidth: 680 }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#d32f2f', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><BloodDrop size="1.1em" /> Permintaan Darah Darurat</h1>
        <p style={{ color: '#747d8c', fontSize: '1.1rem' }}>Isi form di bawah ini. Pendonor terdekat akan otomatis dinotifikasi via email.</p>
      </div>

      {/* Info stok darah yang dipilih — terhubung langsung ke data stok PMI */}
      {stockStatus && (
        <div style={{
          background: stockStatus === 'ok' ? 'rgba(39,174,96,0.1)' : stockStatus === 'low' ? 'rgba(243,156,18,0.1)' : 'rgba(231,76,60,0.1)',
          border: `1px solid ${stockStatus === 'ok' ? 'rgba(39,174,96,0.4)' : stockStatus === 'low' ? 'rgba(243,156,18,0.4)' : 'rgba(231,76,60,0.4)'}`,
          borderRadius: '16px', padding: '1rem 1.5rem', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', gap: '1rem'
        }}>
          <div style={{ fontSize: '2rem' }}>
            {stockStatus === 'ok' ? '✅' : stockStatus === 'low' ? '⚠️' : '🚨'}
          </div>
          <div>
            <strong>Stok PMI untuk darah {form.bloodType}:</strong>{' '}
            <span style={{ fontWeight: '800', color: stockStatus === 'ok' ? '#27ae60' : stockStatus === 'low' ? '#f39c12' : '#d32f2f' }}>
              {stockQty} kantong
            </span>
            {stockStatus === 'empty' && <span style={{ color: '#d32f2f', fontSize: '0.9rem', display: 'block' }}>Stok kosong — permintaan Anda akan dikirimkan ke pendonor terdekat.</span>}
            {stockStatus === 'low' && <span style={{ color: '#f39c12', fontSize: '0.9rem', display: 'block' }}>Stok menipis — pendonor di sekitar Anda juga akan dinotifikasi.</span>}
            {stockStatus === 'ok' && <span style={{ color: '#27ae60', fontSize: '0.9rem', display: 'block' }}>Stok aman — PMI siap membantu.</span>}
          </div>
        </div>
      )}

      <div className="card">
        {success && (
          <div style={{ background: 'linear-gradient(135deg, rgba(46,204,113,0.15), rgba(39,174,96,0.1))', border: '1px solid rgba(46,204,113,0.4)', color: '#155724', padding: '1rem 1.5rem', borderRadius: '16px', marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.3rem' }}>🎉 {success}</div>
            <div style={{ fontSize: '0.9rem', color: '#2ecc71' }}>⏳ Mengalihkan ke halaman Riwayat Permintaan dalam 3 detik...</div>
          </div>
        )}
        {error && <div style={{ background: '#f8d7da', color: '#721c24', padding: '0.75rem', borderRadius: '12px', marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.3rem' }}>Nama Pasien</label>
          <input type="text" name="patientName" placeholder="Nama lengkap pasien" value={form.patientName} onChange={handleChange} required />

          <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.3rem' }}>Golongan Darah yang Dibutuhkan</label>
          <select name="bloodType" value={form.bloodType} onChange={handleChange}>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.3rem' }}>Nama Rumah Sakit</label>
          <input type="text" name="hospital" placeholder="Contoh: RSUD Prof. Dr. R.D. Kandou" value={form.hospital} onChange={handleChange} required />

          <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.3rem' }}>Alamat Lengkap Rumah Sakit</label>
          <input type="text" name="address" placeholder="Contoh: Jl. Raya Tanawangko, Manado" value={form.address} onChange={handleChange} required />

          <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.3rem' }}>Nomor Kontak (HP / WA)</label>
          <input type="text" name="contact" placeholder="Contoh: 08123456789" value={form.contact} onChange={handleChange} required />

          <button type="submit" disabled={loading} style={{ marginTop: '0.5rem', background: 'linear-gradient(135deg, #d32f2f, #b71c1c)', boxShadow: '0 5px 20px rgba(211,47,47,0.4)' }}>
            {loading ? '⏳ Mengirim & Mencari Donor...' : '🚨 Kirim Permintaan Sekarang'}
          </button>
        </form>
      </div>

      {/* Info sistem yang saling terhubung */}
      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {[
          { icon: '📧', title: 'Notifikasi Otomatis', desc: 'Pendonor kompatibel dalam radius 15 km akan dikirimi email darurat' },
          { icon: '🗺️', title: 'Pencarian Lokasi', desc: 'Sistem akan otomatis mendeteksi lokasi RS yang Anda masukkan' },
          { icon: '📋', title: 'Terlacak Real-time', desc: 'Pantau status permintaan Anda di halaman Riwayat Permintaan' },
        ].map((item, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '16px', padding: '1.2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{item.icon}</div>
            <div style={{ fontWeight: '700', marginBottom: '0.3rem', color: '#2f3542' }}>{item.title}</div>
            <div style={{ fontSize: '0.85rem', color: '#747d8c' }}>{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RequestBlood;