const { PrismaClient } = require('@prisma/client');
const { geocodeAddress } = require('../utils/geocode');
const prisma = new PrismaClient();

const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

exports.getAllDonors = async (req, res) => {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const donors = await prisma.donor.findMany({
      where: { 
        isAvailable: true,
        OR: [
          { lastDonationDate: null },
          { lastDonationDate: { lte: ninetyDaysAgo } }
        ]
      },
      select: { id: true, fullName: true, bloodType: true, lat: true, lng: true, address: true, phone: true }
    });
    
    // Mask phone numbers for privacy
    const masked = donors.map(d => ({
      ...d,
      phone: d.phone ? d.phone.replace(/(\d{4})\d{4}(\d+)/, '$1****$2') : ''
    }));
    
    res.json(masked);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.searchNearby = async (req, res) => {
  try {
    const { bloodType, lat, lng, radius = 10 } = req.query;
    if (!bloodType || lat === undefined || lng === undefined)
      return res.status(400).json({ error: 'Parameter tidak lengkap' });
      
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const maxRadius = parseFloat(radius);
    
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

    const donors = await prisma.donor.findMany({
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
    
    const withDistance = donors.map(d => ({
      ...d,
      phone: d.phone ? d.phone.replace(/(\d{4})\d{4}(\d+)/, '$1****$2') : '', // Mask phone
      distance: haversineDistance(userLat, userLng, d.lat, d.lng)
    }));
    
    const filtered = withDistance.filter(d => d.distance <= maxRadius).sort((a,b) => a.distance - b.distance);
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.toggleAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const donor = await prisma.donor.findUnique({ where: { id: parseInt(id) } });
    if (!donor) return res.status(404).json({ error: 'Donor tidak ditemukan' });
    const updated = await prisma.donor.update({
      where: { id: parseInt(id) },
      data: { isAvailable: !donor.isAvailable }
    });
    res.json({ message: 'Status diperbarui', isAvailable: updated.isAvailable });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    let donor = await prisma.donor.findUnique({
      where: { userId },
      include: { user: { select: { email: true } } }
    });
    
    // Jika user adalah admin dan belum punya profil institusi, buatkan otomatis
    if (!donor && req.user.role === 'admin') {
      donor = await prisma.donor.create({
        data: {
          userId,
          fullName: 'Palang Merah Indonesia (PMI Pusat)',
          bloodType: 'A+',
          phone: '021-3906666',
          address: 'Jl. Kramat Raya No.47, Senen, Jakarta Pusat',
          lat: -6.1843,
          lng: 106.8431,
          isAvailable: true
        },
        include: { user: { select: { email: true } } }
      });
    }

    if (!donor) return res.status(404).json({ error: 'Profil tidak ditemukan' });
    res.json(donor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, phone, address, bloodType } = req.body;
    let coords = null;
    if (address) {
      coords = await geocodeAddress(address);
    }
    const updated = await prisma.donor.update({
      where: { userId },
      data: {
        fullName: fullName || undefined,
        phone: phone || undefined,
        address: address || undefined,
        bloodType: bloodType || undefined,
        lat: coords ? coords.lat : undefined,
        lng: coords ? coords.lng : undefined,
      }
    });
    res.json({ message: 'Profil diperbarui', donor: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

  const recordDonation = async (req, res) => {
  try {
    const userId = req.user.id;
    const donor = await prisma.donor.findUnique({ where: { userId } });
    if (!donor) return res.status(404).json({ error: 'Profil donor tidak ditemukan' });

    const updated = await prisma.donor.update({
      where: { userId },
      data: { lastDonationDate: new Date(), isAvailable: false }
    });

    // HUBUNGAN DATABASE: Cari admin (bank darah) untuk menambah stok
    if (donor.bloodType) {
      const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
      if (adminUser) {
        const existingStock = await prisma.bloodStock.findFirst({
          where: { bloodBankId: adminUser.id, bloodType: donor.bloodType }
        });

        if (existingStock) {
          await prisma.bloodStock.update({
            where: { id: existingStock.id },
            data: { quantity: { increment: 1 } }
          });
        } else {
          await prisma.bloodStock.create({
            data: {
              bloodBankId: adminUser.id,
              bloodType: donor.bloodType,
              quantity: 1
            }
          });
        }
      }
    }

    res.json({ message: 'Donasi berhasil dicatat! Stok kantong darah PMI bertambah 1 dan masa istirahat 90 hari dimulai.', donor: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.recordDonation = recordDonation;

exports.getAdminDonors = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Khusus Admin' });
    const donors = await prisma.donor.findMany({
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(donors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteDonor = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Khusus Admin' });
    const { id } = req.params;
    await prisma.donor.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Data relawan berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};