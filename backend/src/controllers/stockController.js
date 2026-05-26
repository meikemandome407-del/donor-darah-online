const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all blood stocks, aggregated by bloodType
exports.getStocks = async (req, res) => {
  try {
    const stocks = await prisma.bloodStock.findMany({
      select: { bloodType: true, quantity: true, updatedAt: true }
    });

    // In a real scenario, you'd aggregate by bloodType if there are multiple banks.
    // Here we'll aggregate them nicely.
    const aggregated = {};
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    bloodTypes.forEach(type => aggregated[type] = { quantity: 0, updatedAt: null });

    stocks.forEach(stock => {
      if (aggregated[stock.bloodType] !== undefined) {
        aggregated[stock.bloodType].quantity += stock.quantity;
        if (!aggregated[stock.bloodType].updatedAt || stock.updatedAt > aggregated[stock.bloodType].updatedAt) {
          aggregated[stock.bloodType].updatedAt = stock.updatedAt;
        }
      }
    });

    res.json(aggregated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update blood stock for a specific blood type
exports.updateStock = async (req, res) => {
  try {
    const { bloodType, quantity } = req.body;
    const adminId = req.user.id;

    if (!bloodType || quantity === undefined) {
      return res.status(400).json({ error: 'Parameter tidak lengkap' });
    }

    // Find if stock for this admin and bloodType exists
    let stock = await prisma.bloodStock.findFirst({
      where: { bloodBankId: adminId, bloodType: bloodType }
    });

    if (stock) {
      stock = await prisma.bloodStock.update({
        where: { id: stock.id },
        data: { quantity: parseInt(quantity) }
      });
    } else {
      stock = await prisma.bloodStock.create({
        data: {
          bloodBankId: adminId,
          bloodType: bloodType,
          quantity: parseInt(quantity)
        }
      });
    }

    res.json({ message: 'Stok berhasil diperbarui', stock });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reset/Delete blood stock for a specific blood type
exports.deleteStock = async (req, res) => {
  try {
    const { bloodType } = req.params;
    const adminId = req.user.id;

    await prisma.bloodStock.deleteMany({
      where: { bloodBankId: adminId, bloodType: bloodType }
    });

    res.json({ message: `Stok ${bloodType} berhasil direset/dihapus` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
