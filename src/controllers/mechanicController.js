// src/controllers/mechanicController.js
const prisma = require('../prisma/prismaConnection');

// function removed

// ... (Keep addService and getMechanics as they were)
const addService = async (req, res) => {
  // ... existing code ...
  try {
    const { name, description, basePrice } = req.body;

    const mechanic = await prisma.mechanicProfile.findUnique({ where: { userId: req.user.id } });
    if (!mechanic) return res.status(404).json({ message: "Mechanic profile not found" });

    const service = await prisma.service.create({
      data: {
        mechanicId: mechanic.id,
        name,
        description,
        basePrice: parseFloat(basePrice)
      }
    });
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMechanics = async (req, res) => {
  // ... existing code ...
  try {
    const mechanics = await prisma.mechanicProfile.findMany({
      include: { user: { select: { name: true, avatarUrl: true } }, services: true }
    });
    res.json(mechanics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const {
      name, phone, // User details
      experienceYears, shopAddress, isMobileService, hourlyRate // Mechanic details
    } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Mechanic Profile
      const mechanic = await tx.mechanicProfile.findUnique({ where: { userId: req.user.id } });
      if (!mechanic) throw new Error("Mechanic profile not found");

      await tx.mechanicProfile.update({
        where: { id: mechanic.id },
        data: {
          experienceYears: experienceYears ? parseInt(experienceYears) : undefined,
          shopAddress: shopAddress || undefined,
          isMobileService: isMobileService !== undefined ? isMobileService : undefined,
          hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined
        }
      });

      // 2. Update User Details
      if (name || phone) {
        await tx.user.update({
          where: { id: req.user.id },
          data: {
            name: name || undefined,
            phone: phone || undefined
          }
        });
      }

      // 3. Return merged profile
      return await tx.mechanicProfile.findUnique({
        where: { id: mechanic.id },
        include: { user: { select: { name: true, phone: true, email: true } } }
      });
    });

    res.json(result);
  } catch (error) {
    if (error.message === "Mechanic profile not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addService, getMechanics, updateProfile };