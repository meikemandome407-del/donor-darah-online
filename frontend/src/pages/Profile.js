import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import BloodDrop from '../components/BloodDrop';

// ============ KOMPONEN PROFIL PASIEN (RECIPIENT) ============
const RecipientProfile = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/requests/my')
      .then(res => setRequests(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pending = requests.filter(r => r.status === 'pending').length;
  const fulfilled = requests.filter(r => r.status === 'fulfilled').length;
  const cancelled = requests.filter(r => r.status === 'cancelled').length;
  const initial = user.email ? user.email[0].toUpperCase() : '?';

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <div style={{ background: 'white', borderRadius: '32px', boxShadow: '0 20px 35px -10px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ background: 'var(--primary-gradient)', padding: '2rem', textAlign: 'center', color: 'white' }}>
          <div style={{ width: '100px', height: '100px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}>
            {initial}
          </div>
          <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{user.email}</h2>
          <span style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '4px 16px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 'bold', display: 'inline-block', marginTop: '0.5rem' }}>
            🏥 Pasien / Penerima Darah
          </span>
        </div>

        {/* Statistik Permintaan */}
        <div style={{ padding: '2rem' }}>
          <h3 style={{ borderLeft: '4px solid var(--primary)', paddingLeft: '0.75rem', marginBottom: '1.5rem', color: 'var(--text-dark)' }}>Ringkasan Permintaan Darah Saya</h3>
          {loading ? <LoadingSpinner /> : (
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '150px', background: 'rgba(243,156,18,0.1)', border: '1px solid rgba(243,156,18,0.3)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#f39c12' }}>{pending}</div>
                <div style={{ color: '#747d8c', fontWeight: '600' }}>⏳ Pending</div>
              </div>
              <div style={{ flex: 1, minWidth: '150px', background: 'rgba(39,174,96,0.1)', border: '1px solid rgba(39,174,96,0.3)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#27ae60' }}>{fulfilled}</div>
                <div style={{ color: '#747d8c', fontWeight: '600' }}>✅ Terpenuhi</div>
              </div>
              <div style={{ flex: 1, minWidth: '150px', background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#c0392b' }}>{cancelled}</div>
                <div style={{ color: '#747d8c', fontWeight: '600' }}>❌ Dibatalkan</div>
              </div>
            </div>
          )}

          {/* Aksi Cepat */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
            <Link to="/request" className="btn btn-primary">
              <BloodDrop size="1.1em" color="white" style={{ marginRight: '4px' }} /> Buat Permintaan Baru
            </Link>
            <Link to="/my-requests" className="btn btn-outline-dark">
              📋 Lihat Riwayat Permintaan
            </Link>
            <Link to="/search" className="btn btn-outline-primary">
              🔍 Cari Donor Terdekat
            </Link>
          </div>
        </div>

        <div style={{ background: '#f9f9f9', padding: '1.2rem 2rem', textAlign: 'center', borderTop: '1px solid #eee', fontSize: '0.85rem', color: '#747d8c', fontWeight: '500' }}>
          Semoga cepat mendapatkan bantuan yang dibutuhkan. 🏥
        </div>
      </div>
    </div>
  );
};

// ============ KOMPONEN PROFIL DONOR / ADMIN ============
const DonorProfile = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ fullName: '', phone: '', address: '', bloodType: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/donors/me');
        setProfile(res.data);
        setForm(res.data);
      } catch (err) {
        console.error(err);
        setMessage('Gagal memuat profil');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/donors/me', form);
      setProfile({ ...profile, ...form });
      setEditMode(false);
      setMessage('✅ Profil berhasil diperbarui!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Gagal update profil');
    }
  };

  const toggleAvailability = async () => {
    try {
      await api.patch(`/donors/${profile.id}/toggle`, {});
      setProfile({ ...profile, isAvailable: !profile.isAvailable });
      setMessage(`Status berhasil diubah menjadi ${!profile.isAvailable ? 'Tersedia' : 'Tidak Tersedia'}`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Gagal mengubah status');
    }
  };

  const recordDonation = async () => {
    try {
      const res = await api.post('/donors/me/record');
      setProfile({ ...profile, lastDonationDate: res.data.donor.lastDonationDate, isAvailable: false });
      setMessage(res.data.message);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Gagal mencatat donasi');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!profile) return <div className="container"><div className="card">Profil tidak ditemukan</div></div>;

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';
  const initial = profile.fullName ? profile.fullName.charAt(0).toUpperCase() : '?';
  const joinDate = profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Belum diketahui';

  return (
    <div className="container" style={{ maxWidth: '900px', margin: '2rem auto' }}>
      {message && (
        <div className="toast-message" style={{
          background: message.includes('✅') ? '#4caf50' : '#f44336',
          color: 'white', padding: '0.75rem 1rem', borderRadius: '12px', marginBottom: '1rem', textAlign: 'center', animation: 'fadeIn 0.3s'
        }}>
          {message}
        </div>
      )}

      <div className="profile-card" style={{ background: 'white', borderRadius: '32px', boxShadow: '0 20px 35px -10px rgba(0,0,0,0.15)', overflow: 'hidden', transition: 'all 0.3s', padding: 0 }}>
        <div style={{ background: isAdmin ? 'linear-gradient(135deg, #2c3e50, #3498db)' : 'var(--primary-gradient)', padding: '2rem 2rem 1.5rem 2rem', textAlign: 'center', color: 'white' }}>
          <div style={{ width: '100px', height: '100px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', fontSize: '3rem', fontWeight: 'bold', color: isAdmin ? '#2c3e50' : 'var(--primary)', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}>
            {initial}
          </div>
          <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{profile.fullName}</h2>
          <p style={{ opacity: 0.9, marginTop: '0.5rem' }}>
            {isAdmin ? (
              <span style={{ background: '#34495e', padding: '4px 14px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 'bold', display: 'inline-block' }}>🏥 Pusat Pengelola Bank Darah (Admin)</span>
            ) : profile.isAvailable ? (
              <span style={{ background: '#2ecc71', padding: '4px 12px', borderRadius: '50px', fontSize: '0.8rem', display: 'inline-block' }}>✅ Tersedia donor</span>
            ) : (
              <span style={{ background: '#7f8c8d', padding: '4px 12px', borderRadius: '50px', fontSize: '0.8rem', display: 'inline-block' }}>⛔ Sedang tidak tersedia</span>
            )}
          </p>
        </div>

        <div style={{ padding: '2rem' }}>
          {!editMode ? (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginBottom: '2rem', textAlign: 'left' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ borderLeft: `4px solid ${isAdmin ? '#3498db' : 'var(--primary)'}`, paddingLeft: '0.75rem', marginBottom: '1rem' }}>{isAdmin ? 'Informasi Institusi' : 'Informasi Pribadi'}</h3>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: '600', color: isAdmin ? '#2980b9' : 'var(--primary)' }}>📧 Email Kontak</span>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#555', fontWeight: '500' }}>{profile.user?.email || '-'}</p>
                  </div>
                  {!isAdmin && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <span style={{ fontWeight: '600', color: 'var(--primary)' }}><BloodDrop size="0.95em" style={{ marginRight: '5px' }} />Golongan Darah</span>
                      <p style={{ margin: '0.25rem 0 0 0', color: '#555', fontWeight: '500' }}>{profile.bloodType}</p>
                    </div>
                  )}
                  <div style={{ marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: '600', color: isAdmin ? '#2980b9' : 'var(--primary)' }}>📞 Telepon / Hotline</span>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#555', fontWeight: '500' }}>{profile.phone}</p>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ borderLeft: `4px solid ${isAdmin ? '#3498db' : 'var(--primary)'}`, paddingLeft: '0.75rem', marginBottom: '1rem' }}>Kantor &amp; Aktivitas</h3>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: '600', color: isAdmin ? '#2980b9' : 'var(--primary)' }}>📍 Alamat Fisik / Markas</span>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#555', fontWeight: '500' }}>{profile.address}</p>
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: '600', color: isAdmin ? '#2980b9' : 'var(--primary)' }}>📅 Terdaftar Sejak</span>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#555', fontWeight: '500' }}>{joinDate}</p>
                  </div>
                  {!isAdmin && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <span style={{ fontWeight: '600', color: 'var(--primary)' }}><BloodDrop size="0.95em" style={{ marginRight: '5px' }} />Terakhir Donor</span>
                      <p style={{ margin: '0.25rem 0 0 0', color: '#555', fontWeight: '500' }}>
                        {profile.lastDonationDate ? new Date(profile.lastDonationDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Belum pernah/Tidak tercatat'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button onClick={() => setEditMode(true)} className="btn btn-outline-dark" style={{ width: 'auto' }}>
                  ✏️ Edit Informasi {isAdmin ? 'Institusi' : 'Profil'}
                </button>
                {!isAdmin && (
                  <>
                    <button onClick={toggleAvailability} className="btn" style={{ background: 'none', border: `2px solid ${profile.isAvailable ? 'var(--primary)' : '#2ecc71'}`, color: profile.isAvailable ? 'var(--primary)' : '#2ecc71', width: 'auto' }}>
                      {profile.isAvailable ? '🔴 Tandai Tidak Tersedia' : '🟢 Tandai Tersedia'}
                    </button>
                    <button onClick={recordDonation} className="btn btn-primary" style={{ width: 'auto' }}>
                      💖 Catat Donor Baru
                    </button>
                  </>
                )}
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: isAdmin ? '#2980b9' : 'var(--primary)' }}>✏️ Edit Informasi {isAdmin ? 'Institusi' : 'Profil'}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.4rem', fontSize: '0.9rem' }}>{isAdmin ? 'Nama Institusi / RS' : 'Nama Lengkap'}</label>
                  <input name="fullName" placeholder="Nama" value={form.fullName} onChange={handleChange} required />
                </div>
                {!isAdmin && (
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Golongan Darah</label>
                    <select name="bloodType" value={form.bloodType} onChange={handleChange} required>
                      <option value="A+">A+</option><option value="A-">A-</option>
                      <option value="B+">B+</option><option value="B-">B-</option>
                      <option value="AB+">AB+</option><option value="AB-">AB-</option>
                      <option value="O+">O+</option><option value="O-">O-</option>
                    </select>
                  </div>
                )}
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Telepon / Hotline</label>
                  <input name="phone" placeholder="Telepon" value={form.phone} onChange={handleChange} required />
                </div>
                <div style={{ gridColumn: isAdmin ? 'span 2' : 'auto' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.4rem', fontSize: '0.9rem' }}>Alamat Markas / Fisik</label>
                  <input name="address" placeholder="Alamat lengkap" value={form.address} onChange={handleChange} required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>💾 Simpan Perubahan</button>
                <button type="button" onClick={() => setEditMode(false)} className="btn btn-outline-dark" style={{ width: 'auto' }}>❌ Batal</button>
              </div>
            </form>
          )}
        </div>

        <div style={{ background: '#f9f9f9', padding: '1.2rem 2rem', textAlign: 'center', borderTop: '1px solid #eee', fontSize: '0.85rem', color: '#747d8c', fontWeight: '500' }}>
          {isAdmin ? 'Pusat Komando & Pengawasan Distribusi Kantong Darah Terpadu.' : 'Jadilah pahlawan dengan mendonorkan darah secara rutin.'}
        </div>
      </div>
    </div>
  );
};

// ============ EXPORT UTAMA — Otomatis pilih profil sesuai role ============
const Profile = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.role === 'recipient') return <RecipientProfile />;
  return <DonorProfile />;
};

export default Profile;