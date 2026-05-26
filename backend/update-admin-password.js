const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updateAdminPassword() {
  // ✏️ GANTI PASSWORD DI SINI
  const newPassword = 'Admin@2024';

  const hashed = await bcrypt.hash(newPassword, 10);

  const admin = await prisma.user.findUnique({ where: { email: 'admin@pmi.org' } });

  if (!admin) {
    console.log('❌ Akun admin tidak ditemukan!');
    return;
  }

  await prisma.user.update({
    where: { email: 'admin@pmi.org' },
    data: { password: hashed }
  });

  console.log('✅ Password admin berhasil diubah!');
  console.log('📧 Email   : admin@pmi.org');
  console.log('🔑 Password: ' + newPassword);
}

updateAdminPassword()
  .catch(e => console.error('❌ Error:', e.message))
  .finally(async () => await prisma.$disconnect());
