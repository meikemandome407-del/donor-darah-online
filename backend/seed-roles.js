const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedRoles() {
  const password = await bcrypt.hash('password123', 10);

  // 1. Akun Admin (PMI / RS)
  let admin = await prisma.user.findUnique({ where: { email: 'admin@pmi.org' } });
  if (!admin) {
    admin = await prisma.user.create({
      data: { email: 'admin@pmi.org', password, role: 'admin' }
    });
    console.log('✅ Akun Admin dibuat: admin@pmi.org / password123');
  } else {
    await prisma.user.update({ where: { email: 'admin@pmi.org' }, data: { password, role: 'admin' } });
    console.log('✅ Akun Admin direset: admin@pmi.org / password123');
  }

  // 2. Akun Donor
  let donorUser = await prisma.user.findUnique({ where: { email: 'budi.donor@gmail.com' } });
  if (!donorUser) {
    donorUser = await prisma.user.create({
      data: { email: 'budi.donor@gmail.com', password, role: 'donor' }
    });
    await prisma.donor.create({
      data: {
        userId: donorUser.id,
        fullName: 'Budi Raharjo',
        bloodType: 'O+',
        phone: '081299887766',
        address: 'Bandung',
        lat: -6.9175,
        lng: 107.6191,
        isAvailable: true
      }
    });
    console.log('✅ Akun Donor dibuat: budi.donor@gmail.com / password123');
  } else {
    await prisma.user.update({ where: { email: 'budi.donor@gmail.com' }, data: { password, role: 'donor' } });
    console.log('✅ Akun Donor direset: budi.donor@gmail.com / password123');
  }

  // 3. Akun Recipient / Pasien
  let recipient = await prisma.user.findUnique({ where: { email: 'pasien.sari@gmail.com' } });
  if (!recipient) {
    recipient = await prisma.user.create({
      data: { email: 'pasien.sari@gmail.com', password, role: 'recipient' }
    });
    console.log('✅ Akun Pasien dibuat: pasien.sari@gmail.com / password123');
  } else {
    await prisma.user.update({ where: { email: 'pasien.sari@gmail.com' }, data: { password, role: 'recipient' } });
    console.log('✅ Akun Pasien direset: pasien.sari@gmail.com / password123');
  }

  console.log('🎉 Semua akun siap digunakan untuk pengujian!');
}

seedRoles()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
