// src/controllers/bookingController.js
const prisma = require('../prisma/prismaConnection');

const createBooking = async (req, res) => {
  try {
    const { mechanicId, serviceId, date, notes } = req.body;

    const booking = await prisma.booking.create({
      data: {
        customerId: req.user.id,
        mechanicId,
        serviceId,
        date: new Date(date), // Ensure format is ISO-8601
        notes,
        status: 'PENDING'
      }
    });

    res.status(201).json({ message: 'Mechanic requested successfully', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { customerId: req.user.id },
      include: { mechanic: { include: { user: true } }, service: true }
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createBooking, getMyBookings };