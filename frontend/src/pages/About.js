import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      {/* HERO SECTION */}
      <div className="hero" style={{
        background: 'linear-gradient(135deg, #2f3542 0%, #1e272e 100%)',
        color: 'white', borderRadius: '30px', padding: '4rem 2rem', textAlign: 'center',
        boxShadow: '0 20px 50px rgba(0,0,0,0.2)', marginBottom: '4rem'
      }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', background: 'linear-gradient(135deg, #ff4757, #ff6b81)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Arsitektur & Cara Kerja Sistem
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#a4b0be', maxWidth: '800px', margin: '0 auto' }}>
          Platform cerdas penghubung pasien kritis dengan pahlawan donor darah di sekitar mereka secara otomatis menggunakan algoritma geolokasi dan kecocokan medis.
        </p>
      </div>

      {/* 4 FITUR KECERDASAN */}
      <h2 style={{ fontSize: '2.2rem', textAlign: 'center', marginBottom: '2.5rem', color: '#2f3542' }}>🧠 4 Pilar Algoritma Pintar</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
        <div className="card" style={{ padding: '2rem', borderRadius: '24px', textAlign: 'center', transition: 'transform 0.3s ease' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛰️</div>
          <h3 style={{ fontSize: '1.4rem', color: '#ff4757', marginBottom: '0.8rem' }}>Radar Geolokasi (Haversine)</h3>
          <p style={{ color: '#747d8c', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Menggunakan rumus matematika geografi untuk menghitung jarak absolut dalam kilometer antara pasien dan calon donor berdasarkan titik satelit.
          </p>
        </div>
        <div className="card" style={{ padding: '2rem', borderRadius: '24px', textAlign: 'center', transition: 'transform 0.3s ease' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧬</div>
          <h3 style={{ fontSize: '1.4rem', color: '#ff4757', marginBottom: '0.8rem' }}>Matriks Kompatibilitas</h3>
          <p style={{ color: '#747d8c', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Sistem paham aturan transfusi silang. Contohnya, resipien AB+ tidak hanya disandingkan dengan AB+, tetapi juga dengan donor golongan O, A, dan B.
          </p>
        </div>
        <div className="card" style={{ padding: '2rem', borderRadius: '24px', textAlign: 'center', transition: 'transform 0.3s ease' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <h3 style={{ fontSize: '1.4rem', color: '#ff4757', marginBottom: '0.8rem' }}>Filter Pemulihan 90 Hari</h3>
          <p style={{ color: '#747d8c', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Menjaga kesehatan relawan. Setelah berdonasi, sistem akan mengistirahatkan profil pendonor dan menyembunyikannya dari pencarian publik selama 3 bulan.
          </p>
        </div>
        <div className="card" style={{ padding: '2rem', borderRadius: '24px', textAlign: 'center', transition: 'transform 0.3s ease' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-10px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✉️</div>
          <h3 style={{ fontSize: '1.4rem', color: '#ff4757', marginBottom: '0.8rem' }}>SOS Email Darurat Otomatis</h3>
          <p style={{ color: '#747d8c', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Ketika ada formulir permohonan darah baru, sistem memindai radius 15 KM dan langsung mengirimkan sirine email ke pendonor terdekat yang cocok.
          </p>
        </div>
      </div>

      {/* STRUKTUR ALUR KERJA */}
      <div className="card" style={{ padding: '3rem 2rem', borderRadius: '30px', background: 'linear-gradient(135deg, white, #f8f9fa)' }}>
        <h2 style={{ fontSize: '2.2rem', textAlign: 'center', marginBottom: '1rem', color: '#2f3542' }}>🔄 Skema Alur Transaksi Darah</h2>
        <p style={{ textAlign: 'center', color: '#747d8c', marginBottom: '3rem', maxWidth: '700px', margin: '0 auto 3rem auto' }}>Bagaimana aplikasi menghubungkan masyarakat, rumah sakit, dan relawan pendonor secara terpadu.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', background: 'white', padding: '1.5rem', borderRadius: '20px', boxShadow: '0 5px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#ff4757', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', flexShrink: 0 }}>1</div>
            <div>
              <h4 style={{ fontSize: '1.3rem', color: '#2f3542', marginBottom: '0.5rem' }}>Publikasi Ketersediaan RS (Admin)</h4>
              <p style={{ color: '#747d8c', lineHeight: '1.5', margin: 0 }}>Pihak Rumah Sakit atau PMI memperbarui angka stok kantong darah melalui Dashboard Admin yang langsung tercermin di halaman depan web untuk masyarakat umum.</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', background: 'white', padding: '1.5rem', borderRadius: '20px', boxShadow: '0 5px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#ff4757', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', flexShrink: 0 }}>2</div>
            <div>
              <h4 style={{ fontSize: '1.3rem', color: '#2f3542', marginBottom: '0.5rem' }}>Pengajuan Permohonan SOS (Pasien)</h4>
              <p style={{ color: '#747d8c', lineHeight: '1.5', margin: 0 }}>Keluarga pasien yang membutuhkan darah mengisi formulir online (Golongan darah, Nama RS, Kontak). Status permohonan masuk ke antrean dengan label ⏳ Pending.</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', background: 'white', padding: '1.5rem', borderRadius: '20px', boxShadow: '0 5px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#ff4757', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', flexShrink: 0 }}>3</div>
            <div>
              <h4 style={{ fontSize: '1.3rem', color: '#2f3542', marginBottom: '0.5rem' }}>Penjodohan & Sirine Otomatis (Sistem)</h4>
              <p style={{ color: '#747d8c', lineHeight: '1.5', margin: 0 }}>Sistem memindai database relawan pendonor dalam radius terdekat dan mengirimkan email pemberitahuan otomatis agar mereka bergegas menuju Rumah Sakit terkait.</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', background: 'white', padding: '1.5rem', borderRadius: '20px', boxShadow: '0 5px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#2ecc71', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', flexShrink: 0 }}>4</div>
            <div>
              <h4 style={{ fontSize: '1.3rem', color: '#2f3542', marginBottom: '0.5rem' }}>Verifikasi & Istirahat (Penyelesaian)</h4>
              <p style={{ color: '#747d8c', lineHeight: '1.5', margin: 0 }}>Admin memverifikasi bahwa darah telah berhasil didonorkan (Status berubah menjadi ✅ Terpenuhi). Relawan mencatat donasinya di profil dan mendapatkan masa istirahat 90 hari.</p>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
          <Link to="/search">
            <button style={{ padding: '0.8rem 2.5rem', fontSize: '1.2rem' }}>🔍 Uji Coba Cari Donor Sekarang</button>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default About;