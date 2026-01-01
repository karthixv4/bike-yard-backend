const express = require('express');
const { createBooking, getMyBookings } = require('../controllers/bookingController');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Bookings
 *     description: Mechanic service booking management
 */

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     description: Create a new booking request for a mechanic service
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mechanicId
 *               - serviceId
 *               - date
 *             properties:
 *               mechanicId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               serviceId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174001"
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-25T10:00:00Z"
 *               notes:
 *                 type: string
 *                 example: "Please bring spare parts"
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Mechanic requested successfully"
 *                 booking:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     customerId:
 *                       type: string
 *                       format: uuid
 *                     mechanicId:
 *                       type: string
 *                       format: uuid
 *                     serviceId:
 *                       type: string
 *                       format: uuid
 *                     date:
 *                       type: string
 *                       format: date-time
 *                     status:
 *                       type: string
 *                       enum: [PENDING, CONFIRMED, COMPLETED, CANCELLED]
 *                       default: PENDING
 *                     notes:
 *                       type: string
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.post('/', createBooking);

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get my bookings
 *     description: Retrieve all bookings made by the authenticated user
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bookings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   customerId:
 *                     type: string
 *                     format: uuid
 *                   mechanicId:
 *                     type: string
 *                     format: uuid
 *                   serviceId:
 *                     type: string
 *                     format: uuid
 *                   date:
 *                     type: string
 *                     format: date-time
 *                   status:
 *                     type: string
 *                     enum: [PENDING, CONFIRMED, COMPLETED, CANCELLED]
 *                   notes:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   mechanic:
 *                     type: object
 *                     properties:
 *                       user:
 *                         type: object
 *                   service:
 *                     type: object
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/', getMyBookings);

module.exports = router;