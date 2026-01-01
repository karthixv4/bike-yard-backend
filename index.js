// index.js - Restart 12
const express = require('express'); // Force Restart 2
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');
require('dotenv').config();

// Import central router
const apiRoutes = require('./src/routes/routes');

// App Init
const app = express();
const PORT = process.env.PORT || 5000;

// Global Middleware
app.use(express.json());       // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(helmet());             // Security Headers
app.use(morgan('dev'));        // Logging
app.use(cors({
    origin: true, // <--- Set this to true (instead of '*') to allow any origin with credentials
    credentials: true,
}));
// Health Check
app.get('/', (req, res) => {
    res.send('BikeBazaar API is running 🚀');
});
// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// API Routes Entry Point
app.use('/api', apiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT}`);
});