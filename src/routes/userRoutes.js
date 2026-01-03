const express = require('express');
const {
    getProfile,
    updateUserProfile,
    addBikeToGarage,
    getMyGarage,
    updateBikeInGarage,
    getBikeServiceHistory
} = require('../controllers/userController');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: User
 *     description: User profile and address management
 */

/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieve the authenticated user's profile including addresses, seller profile, and mechanic profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 email:
 *                   type: string
 *                 name:
 *                   type: string
 *                 phone:
 *                   type: string
 *                   nullable: true
 *                 avatarUrl:
 *                   type: string
 *                   nullable: true
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 addresses:
 *                   type: array
 *                   items:
 *                     type: object
 *                 sellerProfile:
 *                   type: object
 *                   nullable: true
 *                 mechanicProfile:
 *                   type: object
 *                   nullable: true
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/profile', getProfile);

/**
 * @swagger
 * /user/profile:
 *   put:
 *     summary: Update user profile
 *     description: Update user details (name, phone) and address. If address exists, it's updated; otherwise created.
 *     tags: [User]
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
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zip:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 * 
 */
router.put('/profile', updateUserProfile);

/**
 * @swagger
 * /user/garage:
 *   post:
 *     summary: Add a bike to my garage
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - brand
 *               - model
 *               - year
 *             properties:
 *               brand:
 *                 type: string
 *               model:
 *                 type: string
 *               year:
 *                 type: integer
 *               registration:
 *                 type: string
 *     responses:
 *       201:
 *         description: Bike added
 */
router.post('/garage', addBikeToGarage);

/**
 * @swagger
 * /user/garage:
 *   get:
 *     summary: Get all bikes in my garage
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bikes
 */
router.get('/garage', getMyGarage);

/**
 * @swagger
 * /user/garage/{id}:
 *   put:
 *     summary: Update a bike in garage
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               brand:
 *                 type: string
 *               model:
 *                 type: string
 *               year:
 *                 type: integer
 *               registration:
 *                 type: string
 *     responses:
 *       200:
 *         description: Bike updated
 */
router.put('/garage/:id', updateBikeInGarage);

/**
 * @swagger
 * /user/garage/{id}/history:
 *   get:
 *     summary: Get service history of a bike
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service history list
 */
router.get('/garage/:id/history', getBikeServiceHistory);

module.exports = router;