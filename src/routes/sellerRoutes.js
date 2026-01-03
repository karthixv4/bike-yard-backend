const express = require('express');
const { getMyListings, updateSellerProfile } = require('../controllers/sellerController');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Seller
 *     description: Seller profile and product listing management
 */

/**
 * @swagger
 * /seller/create-profile:
 *   post:
 *     summary: Create seller profile
 *     description: Create a seller profile for the authenticated user. Users cannot be both a seller and a mechanic.
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - businessName
 *               - gstNumber
 *             properties:
 *               businessName:
 *                 type: string
 *                 example: "BikeBazaar Motors"
 *               gstNumber:
 *                 type: string
 *                 example: "27AABCU9603R1ZM"
 *     responses:
 *       201:
 *         description: Seller profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 userId:
 *                   type: string
 *                   format: uuid
 *                 businessName:
 *                   type: string
 *                 gstNumber:
 *                   type: string
 *                 isVerified:
 *                   type: boolean
 *       400:
 *         description: Bad request - User already has a seller profile or is registered as a mechanic
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /seller/profile:
 *   put:
 *     summary: Update seller profile
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               businessName:
 *                 type: string
 *               gstNumber:
 *                 type: string
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
 *         description: Profile updated
 */
router.put('/profile', updateSellerProfile);

/**
 * @swagger
 * /seller/my-listings:
 *   get:
 *     summary: Get my product listings
 *     description: Retrieve all products listed by the authenticated seller
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Listings retrieved successfully
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
 *                   sellerId:
 *                     type: string
 *                     format: uuid
 *                   type:
 *                     type: string
 *                     enum: [BIKE, ACCESSORY, PART]
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   price:
 *                     type: number
 *                   images:
 *                     type: array
 *                     items:
 *                       type: string
 *                   condition:
 *                     type: string
 *                     enum: [NEW, USED, REFURBISHED, OPEN_BOX]
 *                   brand:
 *                     type: string
 *                   model:
 *                     type: string
 *                   stock:
 *                     type: integer
 *                   isSold:
 *                     type: boolean
 *       404:
 *         description: Seller profile not found
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/my-listings', getMyListings);

module.exports = router;