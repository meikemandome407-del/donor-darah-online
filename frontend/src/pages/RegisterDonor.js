import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const RegisterDonor = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    email: '', 
    password: '', 
    fullName: '', 
    bloodType: 'A+', 
    phone: '', 
    address: '',
    role: 'donor' // default 'donor', opsi lain 'recipient'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Siapkan body request yang sesuai role
    const requestData = { ...form };
    if (form.role === 'recipient') {
      // Hapus data yang tidak diperlukan pasien saat daftar
      delete requestData.bloodType;
      delete requestData.address;
    }

    try {
      await api.post('/auth/register', requestData);
      alert('Pendaftaran berhasil! Silakan login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 600 }}>
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          📝 {form.role === 'donor' ? 'Daftar Sebagai Pendonor' : 'Daftar Sebagai Pasien'}
        </h2>
        {error && <div style={{ background: '#fee2e2', color: '#c0392b', padding: '0.75rem', borderRadius: '12px', marginBottom: '1rem' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <label style={{ fontWeight: '700', color: '#1e272e', display: 'block', marginBottom: '0.2rem', fontSize: '1.05rem' }}>
              Saya Ingin Mendaftar Sebagai:
            </label>
            <select 
              name="role" 
              value={form.role} 
              onChange={handleChange} 
              style={{ backgroundColor: 'white', cursor: 'pointer', border: '1px solid #e1e8ef', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
            >
              <option value="donor">🔴 Pendonor Darah (Ingin Menyumbang)</option>
              <option value="recipient">🏥 Pasien / Penerima (Butuh Darah)</option>
            </select>
          </div>

          <input type="email" name="email" placeholder="Email" onChange={handleChange} required autoComplete="off" />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required autoComplete="new-password" />
          <input type="text" name="fullName" placeholder={form.role === 'donor' ? 'Nama Lengkap' : 'Nama Lengkap Pasien/Keluarga'} onChange={handleChange} required />
          <input type="tel" name="phone" placeholder={form.role === 'donor' ? 'No. Telepon / WhatsApp' : 'No. Telepon Aktif'} onChange={handleChange} required />
          
          {form.role === 'donor' && (
            <>
              <div style={{ marginBottom: '1.5rem', textAlign: 'left', marginTop: '0.5rem' }}>
                <label style={{ fontWeight: '700', color: '#1e272e', display: 'block', marginBottom: '0.2rem', fontSize: '1.05rem' }}>
                  Golongan Darah
                </label>
                <select 
                  name="bloodType" 
                  value={form.bloodType} 
                  onChange={handleChange} 
                  style={{ backgroundColor: 'white', cursor: 'pointer', border: '1px solid #e1e8ef', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <input type="text" name="address" placeholder="Alamat lengkap (contoh: Jalan Sam Ratulangi No.1, Manado)" onChange={handleChange} required />
            </>
          )}

          <button type="submit" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? 'Memproses...' : 'Daftar Sekarang'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterDonor;