const express = require('express');
const { addService, getMechanics, updateProfile } = require('../controllers/mechanicController');
const verifyJWT = require('../middleware/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Mechanic
 *     description: Mechanic profile and service management
 */

// Route removed

/**
 * @swagger
 * /mechanic/service:
 *   post:
 *     summary: Add a service
 *     description: Add a new service offered by the authenticated mechanic
 *     tags: [Mechanic]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - basePrice
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Engine Oil Change"
 *               description:
 *                 type: string
 *                 example: "Complete engine oil change with filter replacement"
 *               basePrice:
 *                 type: number
 *                 format: float
 *                 example: 800.00
 *     responses:
 *       201:
 *         description: Service created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 mechanicId:
 *                   type: string
 *                   format: uuid
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 basePrice:
 *                   type: number
 *       404:
 *         description: Mechanic profile not found
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.post('/service', verifyJWT, addService);

/**
 * @swagger
 * /mechanic/profile:
 *   put:
 *     summary: Update mechanic profile
 *     description: Update mechanic's professional and personal details
 *     tags: [Mechanic]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               experienceYears:
 *                 type: integer
 *               shopAddress:
 *                 type: string
 *               isMobileService:
 *                 type: boolean
 *               hourlyRate:
 *                 type: number
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       404:
 *         description: Mechanic profile not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put('/profile', verifyJWT, updateProfile);

/**
 * @swagger
 * /mechanic:
 *   get:
 *     summary: Get all mechanics
 *     description: Retrieve a list of all mechanics with their services and user information
 *     tags: [Mechanic]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mechanics retrieved successfully
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
 *                   userId:
 *                     type: string
 *                     format: uuid
 *                   experienceYears:
 *                     type: integer
 *                   shopAddress:
 *                     type: string
 *                   isMobileService:
 *                     type: boolean
 *                   hourlyRate:
 *                     type: number
 *                   isVerified:
 *                     type: boolean
 *                   user:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       avatarUrl:
 *                         type: string
 *                   services:
 *                     type: array
 *                     items:
 *                       type: object
 *       500:
 *         description: Internal server error
 */
router.get('/', getMechanics); // Public route effectively

module.exports = router;