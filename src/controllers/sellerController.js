// src/controllers/sellerController.js
const prisma = require('../prisma/prismaConnection');

const getMyListings = async (req, res) => {
  try {
    const profile = await prisma.sellerProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ message: "Seller profile not found" });

    const listings = await prisma.product.findMany({
      where: { sellerId: profile.id },
      include: {
        images: { orderBy: { position: 'asc' } },
        category: { select: { name: true } }
      }
    });

    const listingsWithCategory = listings.map(item => ({
      ...item,
      category: item.category ? item.category.name : "Uncategorized"
    }));

    res.json(listingsWithCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSellerProfile = async (req, res) => {
  try {
    const { businessName, gstNumber, name, phone, street, city, state, zip } = req.body;
    const userId = req.user.id;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Check and Update Seller Profile
      const existingProfile = await tx.sellerProfile.findUnique({ where: { userId } });
      if (!existingProfile) {
        throw new Error("Seller profile not found");
      }

      await tx.sellerProfile.update({
        where: { userId },
        data: {
          businessName: businessName || undefined,
          gstNumber: gstNumber || undefined
        }
      });
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          name: name || undefined,
          phone: phone || undefined
        },
        include: { addresses: true }
      });

      if (street || city || state || zip) {
        if (user.addresses.length > 0) {
          await tx.address.update({
            where: { id: user.addresses[0].id },
            data: {
              street: street || undefined,
              city: city || undefined,
              state: state || undefined,
              zip: zip || undefined
            }
          });
        } else {
          await tx.address.create({
            data: {
              userId,
              street: street || "",
              city: city || "",
              state: state || "",
              zip: zip || ""
            }
          });
        }
      }

      // Return composite profile
      return await tx.user.findUnique({
        where: { id: userId },
        include: {
          sellerProfile: true,
          addresses: true
        }
      });
    });

    // Formatting response to match expectation (flattening slightly if needed, or returning hierarchy)
    const response = {
      ...result.sellerProfile,
      name: result.name,
      phone: result.phone,
      address: result.addresses[0] || null
    };

    res.json(response);

  } catch (error) {
    const status = error.message === "Seller profile not found" ? 404 : 500;
    res.status(status).json({ message: error.message });
  }
};

module.exports = { getMyListings, updateSellerProfile };