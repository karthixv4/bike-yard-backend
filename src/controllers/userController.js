// src/controllers/userController.js
const prisma = require('../prisma/prismaConnection');

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { addresses: true, sellerProfile: true, mechanicProfile: true }
    });
    // Remove password from response
    delete user.password;
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { name, phone, street, city, state, zip } = req.body;

    // Use transaction to ensure both user and address are updated correctly
    const updatedUser = await prisma.$transaction(async (tx) => {
      // 1. Update User Details
      const user = await tx.user.update({
        where: { id: req.user.id },
        data: {
          name: name || undefined,
          phone: phone || undefined
        },
        include: { addresses: true }
      });

      // 2. Update or Create Address
      // If address fields are provided
      if (street || city || state || zip) {
        if (user.addresses.length > 0) {
          // Update existing primary address
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
          // Create new address
          await tx.address.create({
            data: {
              userId: user.id,
              street: street || "",
              city: city || "",
              state: state || "",
              zip: zip || ""
            }
          });
        }
      }

      // Return fully updated profile
      return await tx.user.findUnique({
        where: { id: user.id },
        include: { addresses: true, sellerProfile: true, mechanicProfile: true }
      });
    });

    delete updatedUser.password;
    res.json(updatedUser);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addBikeToGarage = async (req, res) => {
  try {
    const { brand, model, year, registration } = req.body;

    if (!brand || !model || !year) {
      return res.status(400).json({ message: "Brand, model, and year are required" });
    }

    const bike = await prisma.userBike.create({
      data: {
        userId: req.user.id,
        brand,
        model,
        year: parseInt(year),
        registration
      }
    });

    res.status(201).json(bike);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyGarage = async (req, res) => {
  try {
    const bikes = await prisma.userBike.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bikes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProfile, updateUserProfile, addBikeToGarage, getMyGarage };