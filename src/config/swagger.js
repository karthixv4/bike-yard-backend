// src/config/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BikeBazaar API Docs',
      version: '1.0.0',
      description: 'API documentation for the Trust-First Marketplace Hackathon project',
      contact: {
        name: 'BikeBazaar Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // This looks for API documentation in your route files
  apis: [path.join(__dirname, '../routes/*.js')], 
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;