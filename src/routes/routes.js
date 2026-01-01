// src/routes/routes.js
const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/authMiddleware');

// Import Route Files
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const sellerRoutes = require('./sellerRoutes');
const mechanicRoutes = require('./mechanicRoutes');
const productRoutes = require('./productRoutes');
const bookingRoutes = require('./bookingRoutes');
const orderRoutes = require('./orderRoutes');
const inspectionRoutes = require('./inspectionRoutes');

// Public Routes (No JWT required)
router.use('/auth', authRoutes);

// Protected Routes (Require JWT)
// Note: Some product/mechanic GET routes might need to be public in a real app. 
// If so, handle middleware inside the specific route file or split them here.
// For this structure, we assume create/update needs auth, viewing might not.
// But following your request, I am applying verifyJWT as requested for specific blocks.

router.use('/user', verifyJWT, userRoutes);
router.use('/seller', verifyJWT, sellerRoutes);
router.use('/mechanic', verifyJWT, mechanicRoutes); // viewing mechanics might need to be public?
router.use('/products', productRoutes);  // viewing products usually public
router.use('/bookings', verifyJWT, bookingRoutes);
router.use('/orders', verifyJWT, orderRoutes);
router.use('/inspections', verifyJWT, inspectionRoutes);

module.exports = router;