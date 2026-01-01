// src/controllers/sellerController.js
const prisma = require('../prisma/prismaConnection');

const getMyListings = async (req, res) => {
  try {
    const profile = await prisma.sellerProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ message: "Seller profile not found" });

    const listings = await prisma.product.findMany({
      where: { sellerId: profile.id },
      include: { images: { orderBy: { position: 'asc' } } }
    });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyListings };