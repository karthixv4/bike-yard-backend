const express = require('express');
const router = express.Router();
const {
    requestInspection,
    getMyInspections,
    getInspectionById,
    getMechanicInspections,
    getAvailableInspections,
    updateInspectionStatus,
    cancelInspection,
    submitInspectionReport,
    getSellerInspections
} = require('../controllers/inspectionController');

// Buyer Routes
/**
 * @swagger
 * /inspections/request:
 *   post:
 *     summary: Request an inspection
 *     tags: [Inspections]
 *     security:
 *       - bearerAuth: []
 */
router.post('/request', requestInspection);

/**
 * @swagger
 * /inspections/my-inspections:
 *   get:
 *     summary: Get all inspections requested by me (Buyer)
 *     tags: [Inspections]
 *     security:
 *       - bearerAuth: []
 */
router.get('/my-inspections', getMyInspections);



// Mechanic Routes
/**
 * @swagger
 * /inspections/available:
 *   get:
 *     summary: Get available inspections (Marketplace)
 *     tags: [Inspections]
 *     security:
 *       - bearerAuth: []
 */
router.get('/available', getAvailableInspections);

/**
 * @swagger
 * /inspections/mechanic:
 *   get:
 *     summary: Get inspections assigned to me (Mechanic)
 *     tags: [Inspections]
 *     security:
 *       - bearerAuth: []
 */
router.get('/mechanic', getMechanicInspections);

/**
 * @swagger
 * /inspections/:id/status:
 *   put:
 *     summary: Update inspection status (Accept/Reject)
 *     tags: [Inspections]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id/status', updateInspectionStatus);

/**
 * @swagger
 * /inspections/:id/report:
 *   post:
 *     summary: Submit inspection report
 *     tags: [Inspections]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/report', submitInspectionReport);

// Seller Routes
/**
 * @swagger
 * /inspections/seller:
 *   get:
 *     summary: Get inspections for my products (Seller)
 *     tags: [Inspections]
 *     security:
 *       - bearerAuth: []
 */
router.get('/seller', getSellerInspections);

/**
 * @swagger
 * /inspections/{id}:
 *   get:
 *     summary: Get inspection details by ID
 *     description: Accessible by Buyer, Seller, or assigned Mechanic
 *     tags: [Inspections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:id', getInspectionById);

/**
 * @swagger
 * /inspections/{id}/cancel:
 *   put:
 *     summary: Cancel inspection
 *     description: Cancel inspection by ID (Buyer)
 *     tags: [Inspections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.put('/:id/cancel', cancelInspection);
module.exports = router;
