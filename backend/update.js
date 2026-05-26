const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function update() {
  const donors = await prisma.donor.findMany();
  for (let d of donors) {
    if (!d.bloodType.includes('+') && !d.bloodType.includes('-')) {
      await prisma.donor.update({
        where: { id: d.id },
        data: { bloodType: d.bloodType + '+' }
      });
      console.log(`Updated ${d.fullName} to ${d.bloodType}+`);
    }
  }
}
update().then(() => prisma.$disconnect());
