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

module.exports = { addService, getMechanics };