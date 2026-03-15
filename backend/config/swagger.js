const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CivicConnect API',
      version: '1.0.0',
      description: 'Smart Civic Issue Management System API Documentation',
    },
    servers: [
      { url: 'http://localhost:5000/api', description: 'Development server' },
    ],
    components: {
      securitySchemes: {
        cookieAuth: { type: 'apiKey', in: 'cookie', name: 'token' },
      },
    },
    security: [{ cookieAuth: [] }],
  },
  apis: ['./routes/*.js'],
};

module.exports = swaggerJsdoc(options);
