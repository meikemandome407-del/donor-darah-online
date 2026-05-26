const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  // Hapus data lama (opsional)
  await prisma.announcement.deleteMany();
  await prisma.donationSchedule.deleteMany();

  // Buat pengumuman
  await prisma.announcement.createMany({
    data: [
      {
        title: 'Ayo Donor Darah di Kota Bandung',
        content: 'Sabtu, 25 Mei 2024 di Gedung PMI Bandung. Ayo sukseskan!',
        isActive: true
      },
      {
        title: 'Stok Darah Golongan O Menipis',
        content: 'Mohon bantuan para pendonor golongan O untuk segera donor.',
        isActive: true
      },
      {
        title: 'Event Donor Darah Februari 2024',
        content: 'Catat tanggalnya dan jangan lupa hadir!',
        isActive: true
      }
    ]
  });

  // Buat jadwal donor
  await prisma.donationSchedule.create({
    data: {
      title: 'Donor Darah Sukarela',
      description: 'Acara donor darah rutin',
      location: 'Gedung PMI Kota Bandung',
      date: new Date('2024-05-25'),
      startTime: '08:00',
      endTime: '13:00',
      quota: 100,
      registered: 0
    }
  });

  console.log('✅ Data mockup berhasil ditambahkan!');
}

seed()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());