import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import BloodDrop from '../components/BloodDrop';

const SearchDonor = () => {
  const [bloodType, setBloodType] = useState('A+');
  const [radius, setRadius] = useState(10);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => {
          console.warn(err);
          setUserLocation({ lat: -6.2, lng: 106.816666 });
        }
      );
    } else {
      setUserLocation({ lat: -6.2, lng: 106.816666 });
    }
  }, []);

  const handleSearch = async () => {
    if (!userLocation) return alert('Lokasi tidak tersedia');
    setLoading(true);
    try {
      const res = await api.get('/donors/nearby', {
        params: { bloodType, lat: userLocation.lat, lng: userLocation.lng, radius }
      });
      setDonors(res.data);
      if (res.data.length === 0) alert('Tidak ada donor dalam radius tersebut');
    } catch (err) {
      alert('Gagal mencari donor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container search-page">
      <div className="search-header">
        <h1>📍 Cari Donor Darah Terdekat</h1>
        <p>Temukan pahlawan donor darah di sekitar Anda secara real-time dengan pencocokan medis otomatis.</p>
      </div>
      
      <div className="search-card">
        <div className="search-form">
          <div className="form-group">
            <label>Golongan Darah Pasien</label>
            <select value={bloodType} onChange={(e) => setBloodType(e.target.value)} className="form-control">
              <option value="A+">A+</option><option value="A-">A-</option>
              <option value="B+">B+</option><option value="B-">B-</option>
              <option value="AB+">AB+</option><option value="AB-">AB-</option>
              <option value="O+">O+</option><option value="O-">O-</option>
            </select>
          </div>
          <div className="form-group">
            <label>Radius Pencarian (km)</label>
            <input type="range" value={radius} onChange={(e) => setRadius(e.target.value)} min="1" max="50" style={{ width: '100%', marginBottom: '0' }} />
            <div style={{ textAlign: 'center', marginTop: '5px', fontWeight: 'bold' }}>{radius} km</div>
          </div>
          <div className="form-group" style={{ flex: '0 0 auto' }}>
            <button onClick={handleSearch} disabled={loading || !userLocation} className="search-btn">
              {loading ? 'Mencari...' : '🔍 Cari'}
            </button>
          </div>
        </div>
      </div>
      
      <div className="search-results">
        {loading && <LoadingSpinner />}
        {!loading && donors.length > 0 && (
          <>
            <h2>Hasil Pencarian ({donors.length} Donor Ditemukan)</h2>
            <div className="donor-grid">
              {donors.map(d => (
                <div key={d.id} className="donor-card">
                  <div className="donor-avatar"><BloodDrop size="2.2rem" /></div>
                  <div className="donor-info">
                    <h3>{d.fullName}</h3>
                    <p><strong>Golongan Darah:</strong> <span style={{ color: d.bloodType === bloodType ? '#27ae60' : '#f39c12', fontWeight: 'bold' }}>{d.bloodType}</span> {d.bloodType !== bloodType ? '(Cocok/Universal)' : ''}</p>
                    <p><strong>Telepon:</strong> {d.phone || 'Privasi Dilindungi'}</p>
                    <p><strong>Alamat:</strong> {d.address}</p>
                    <p><strong>Jarak:</strong> {d.distance.toFixed(2)} km</p>
                    {d.isAvailable ? <span className="badge-available">✅ Tersedia</span> : <span className="badge-unavailable">⛔ Pemulihan</span>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {!loading && donors.length === 0 && (
           <div className="empty-state">
             <div className="empty-icon">📍</div>
             <h3>Tidak Ditemukan</h3>
             <p>Coba perluas radius pencarian Anda.</p>
           </div>
        )}
      </div>
    </div>
  );
};
export default SearchDonor;