const { PrismaClient } = require('@prisma/client');
const { geocodeAddress } = require('../utils/geocode');
const { sendEmergencyBloodRequestEmail, sendStatusUpdateEmailToPatient } = require('../utils/mailer');
const prisma = new PrismaClient();

const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

exports.createRequest = async (req, res) => {
  try {
    const { patientName, bloodType, hospital, address, contact } = req.body;
    const userId = req.user.id;
    if (!patientName || !bloodType || !hospital || !address || !contact)
      return res.status(400).json({ error: 'Semua field harus diisi' });
    const coords = await geocodeAddress(address);
    const request = await prisma.request.create({
      data: {
        patientName,
        bloodType,
        hospital,
        address,
        lat: coords.lat,
        lng: coords.lng,
        contact,
        status: 'pending',
        userId,
      }
    });

    // Notify compatible nearby donors
    const compatibility = {
      'A+': ['A+', 'A-', 'O+', 'O-'],
      'A-': ['A-', 'O-'],
      'B+': ['B+', 'B-', 'O+', 'O-'],
      'B-': ['B-', 'O-'],
      'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      'AB-': ['AB-', 'A-', 'B-', 'O-'],
      'O+': ['O+', 'O-'],
      'O-': ['O-']
    };
    const compatibleTypes = compatibility[bloodType] || [bloodType];
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const eligibleDonors = await prisma.donor.findMany({
      where: { 
        bloodType: { in: compatibleTypes }, 
        isAvailable: true,
        OR: [
          { lastDonationDate: null },
          { lastDonationDate: { lte: ninetyDaysAgo } }
        ]
      },
      include: { user: { select: { email: true } } }
    });

    // Filter by radius (e.g., 15 km max)
    const MAX_RADIUS = 15;
    eligibleDonors.forEach(donor => {
      const distance = haversineDistance(coords.lat, coords.lng, donor.lat, donor.lng);
      if (distance <= MAX_RADIUS && donor.user.email) {
        // Dispatch email async
        sendEmergencyBloodRequestEmail(donor.user.email, donor.fullName, patientName, bloodType, hospital, distance);
      }
    });

    res.status(201).json({ message: 'Permintaan darah berhasil dikirim dan donor di sekitar telah dinotifikasi', request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await prisma.request.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true } } }
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const reqData = await prisma.request.findUnique({
      where: { id: parseInt(id) },
      include: { user: { select: { email: true } } }
    });
    if (!reqData) return res.status(404).json({ error: 'Permintaan tidak ditemukan' });

    const updated = await prisma.request.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    // HUBUNGAN 1: Jika status 'fulfilled' → kurangi stok 1 kantong darah
    if (status === 'fulfilled' && reqData.status !== 'fulfilled' && reqData.bloodType) {
      const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
      if (adminUser) {
        const stock = await prisma.bloodStock.findFirst({
          where: { bloodBankId: adminUser.id, bloodType: reqData.bloodType }
        });
        if (stock && stock.quantity > 0) {
          await prisma.bloodStock.update({
            where: { id: stock.id },
            data: { quantity: { decrement: 1 } }
          });
        }
      }
    }

    // HUBUNGAN 2: Kirim notifikasi email ke pasien ketika status berubah
    if ((status === 'fulfilled' || status === 'cancelled') && reqData.status !== status) {
      if (reqData.user && reqData.user.email) {
        sendStatusUpdateEmailToPatient(
          reqData.user.email,
          reqData.patientName,
          reqData.bloodType,
          reqData.hospital,
          status
        );
      }
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Pasien batalkan permintaannya sendiri (hanya jika masih pending)
exports.cancelRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const reqData = await prisma.request.findUnique({ where: { id: parseInt(id) } });
    if (!reqData) return res.status(404).json({ error: 'Permintaan tidak ditemukan' });
    if (reqData.userId !== userId) return res.status(403).json({ error: 'Anda tidak berhak membatalkan permintaan ini' });
    if (reqData.status !== 'pending') return res.status(400).json({ error: 'Hanya permintaan dengan status pending yang bisa dibatalkan' });

    const updated = await prisma.request.update({
      where: { id: parseInt(id) },
      data: { status: 'cancelled' }
    });
    res.json({ message: 'Permintaan berhasil dibatalkan', request: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await prisma.request.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPendingCount = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const count = await prisma.request.count({ where: { status: 'pending' } });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.exportRequests = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Akses ditolak. Khusus Admin.' });

    const requests = await prisma.request.findMany({
      orderBy: { createdAt: 'desc' }
    });

    let csvContent = "ID,Nama Pasien,Golongan Darah,Rumah Sakit,Alamat,Kontak,Status,Tanggal Pengajuan\n";

    requests.forEach(r => {
      const dateStr = new Date(r.createdAt).toISOString().split('T')[0];
      const escapeCSV = (str) => `"${(str || '').replace(/"/g, '""')}"`;
      csvContent += `${r.id},${escapeCSV(r.patientName)},${r.bloodType},${escapeCSV(r.hospital)},${escapeCSV(r.address)},${escapeCSV(r.contact)},${r.status},${dateStr}\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename="permintaan_darah.csv"');
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Khusus Admin' });
    const { id } = req.params;
    await prisma.request.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Permintaan berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};