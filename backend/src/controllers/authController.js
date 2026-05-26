const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { geocodeAddress, DEFAULT_COORDS } = require('../utils/geocode');

const prisma = new PrismaClient();

exports.register = async (req, res) => {
  try {
    const { email, password, fullName, bloodType, phone, address, role = 'donor' } = req.body;
    if (!email || !password || !fullName || !phone)
      return res.status(400).json({ error: 'Email, password, nama, dan telepon harus diisi' });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email sudah terdaftar' });

    const hashed = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Buat User dengan role yang dipilih (donor atau recipient)
      const user = await tx.user.create({
        data: { email, password: hashed, role }
      });

      // 2. Jika rolenya adalah donor, buat juga profil Donor-nya
      let donor = null;
      if (role === 'donor') {
        if (!bloodType || !address) {
          throw new Error('Pendonor wajib mengisi golongan darah dan alamat');
        }
        let coords = await geocodeAddress(address);
        donor = await tx.donor.create({
          data: {
            userId: user.id,
            fullName,
            bloodType,
            phone,
            address,
            lat: coords.lat,
            lng: coords.lng,
            isAvailable: true,
          }
        });
      } else if (role === 'recipient') {
        // Untuk recipient (pasien), kita bisa simpan info kontak dasar di tabel terpisah 
        // atau memanfaatkan data user. Untuk keselarasan, kita juga bisa buat profil donor 
        // dengan flag isAvailable: false agar datanya tercatat atau dilewatkan saja.
        // Di sini kita pilih cukup buat user saja karena Request memiliki tabel tersendiri.
      }

      return { user, donor };
    });

    res.status(201).json({ 
      message: 'Pendaftaran berhasil', 
      role: result.user.role,
      donorId: result.donor ? result.donor.id : null 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Email atau password salah' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Email atau password salah' });
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};