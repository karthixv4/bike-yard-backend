const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');
require('dotenv').config();

// central router
const apiRoutes = require('./src/routes/routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust Proxy (Required for Rate Limiting behind load balancers like Vercel/Heroku/Railway)
app.set('trust proxy', 1);

// Global Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined'));
} else {
    app.use(morgan('dev'));
}

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api', limiter); // Apply to API routes only

// CORS
const corsOptions = {
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
};
app.use(cors(corsOptions));

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