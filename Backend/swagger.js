// config/swagger.js
import swaggerJsdoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mindally API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Mindally project',
    },
    servers: [
      {
        url: 'http://localhost:8000', // Adjust to your server's URL
      },
    ],
  },
  apis: ['./routes/authenticaionRoutes/*.js'], // Path to the API routes files
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerSpec };
