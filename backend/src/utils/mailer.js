const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: process.env.SMTP_USER || 'ethereal.user@ethereal.email',
    pass: process.env.SMTP_PASS || 'ethereal_password'
  }
});

exports.sendEmergencyBloodRequestEmail = async (donorEmail, donorName, patientName, bloodType, hospital, distance) => {
  try {
    const info = await transporter.sendMail({
      from: '"Donor Darah Online" <noreply@donordarah.online>',
      to: donorEmail,
      subject: `🚨 Panggilan Darurat: Dibutuhkan Darah ${bloodType} di ${hospital}!`,
      html: `
        <h2>Halo ${donorName},</h2>
        <p>Ada pasien yang sangat membutuhkan bantuan Anda!</p>
        <p><strong>Nama Pasien:</strong> ${patientName}</p>
        <p><strong>Golongan Darah Dibutuhkan:</strong> ${bloodType}</p>
        <p><strong>Rumah Sakit:</strong> ${hospital}</p>
        <p><strong>Jarak dari Anda:</strong> ${distance.toFixed(2)} KM</p>
        <br/>
        <p>Golongan darah Anda cocok dan lokasi Anda cukup dekat. Mohon segera cek aplikasi Donor Darah Online untuk detail kontak dan alamat rumah sakit.</p>
        <br/>
        <p>Terima kasih,<br/>Tim Donor Darah Online</p>
      `
    });
    console.log("Email terkirim ke:", donorEmail, info.messageId);
  } catch (error) {
    console.error("Gagal mengirim email:", error);
  }
};

exports.sendStatusUpdateEmailToPatient = async (patientEmail, patientName, bloodType, hospital, status) => {
  try {
    const statusText = status === 'fulfilled' ? '✅ Terpenuhi' : '❌ Dibatalkan';
    const statusColor = status === 'fulfilled' ? '#27ae60' : '#e74c3c';
    const statusMsg = status === 'fulfilled'
      ? `Permintaan darah <strong>${bloodType}</strong> untuk pasien <strong>${patientName}</strong> di <strong>${hospital}</strong> telah <strong>TERPENUHI</strong>. Terima kasih telah menggunakan layanan kami.`
      : `Permintaan darah <strong>${bloodType}</strong> untuk pasien <strong>${patientName}</strong> di <strong>${hospital}</strong> telah <strong>DIBATALKAN</strong>. Silakan hubungi tim PMI jika masih membutuhkan bantuan.`;

    const info = await transporter.sendMail({
      from: '"Donor Darah Online" <noreply@donordarah.online>',
      to: patientEmail,
      subject: `${status === 'fulfilled' ? '✅' : '❌'} Update Permintaan Darah: ${statusText}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
          <div style="background: ${statusColor}; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <h2 style="margin: 0;">Status Permintaan Darah Diperbarui</h2>
          </div>
          <p>Halo,</p>
          <p>${statusMsg}</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p><strong>Nama Pasien:</strong> ${patientName}</p>
            <p><strong>Golongan Darah:</strong> ${bloodType}</p>
            <p><strong>Rumah Sakit:</strong> ${hospital}</p>
            <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span></p>
          </div>
          <p>Kunjungi aplikasi Donor Darah Online untuk detail lebih lanjut.</p>
          <p>Terima kasih,<br/>Tim Donor Darah Online</p>
        </div>
      `
    });
    console.log("Email status terkirim ke pasien:", patientEmail, info.messageId);
  } catch (error) {
    console.error("Gagal mengirim email status ke pasien:", error);
  }
};
