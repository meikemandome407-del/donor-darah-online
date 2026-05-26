const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getStats = async (req, res) => {
  try {
    const totalDonors = await prisma.donor.count();
    const availableDonors = await prisma.donor.count({ where: { isAvailable: true } });
    const totalRequests = await prisma.request.count();
    const pendingRequests = await prisma.request.count({ where: { status: 'pending' } });
    res.json({ totalDonors, availableDonors, totalRequests, pendingRequests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};