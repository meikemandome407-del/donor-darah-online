const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedJakarta() {
  const password = await bcrypt.hash('password123', 10);

  const donorsToAdd = [
    {
      email: 'sitib+@gmail.com',
      fullName: 'Siti Aminah (B+)',
      bloodType: 'B+',
      phone: '081233445566',
      address: 'Jakarta Pusat',
      lat: -6.2005,
      lng: 106.8170
    },
    {
      email: 'ahmadab+@gmail.com',
      fullName: 'Ahmad Fauzi (AB+)',
      bloodType: 'AB+',
      phone: '081277889900',
      address: 'Jakarta Selatan',
      lat: -6.2010,
      lng: 106.8160
    },
    {
      email: 'ratnao-@gmail.com',
      fullName: 'Ratna Dewi (O-)',
      bloodType: 'O-',
      phone: '081255554444',
      address: 'Jakarta Pusat',
      lat: -6.1990,
      lng: 106.8180
    }
  ];

  for (let d of donorsToAdd) {
    let u = await prisma.user.findUnique({ where: { email: d.email } });
    if (!u) {
      u = await prisma.user.create({
        data: { email: d.email, password, role: 'donor' }
      });
      await prisma.donor.create({
        data: {
          userId: u.id,
          fullName: d.fullName,
          bloodType: d.bloodType,
          phone: d.phone,
          address: d.address,
          lat: d.lat,
          lng: d.lng,
          isAvailable: true
        }
      });
      console.log(`✅ Seeded ${d.fullName} in Jakarta`);
    } else {
      console.log(`⚡ ${d.fullName} already exists`);
    }
  }
}

seedJakarta()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
