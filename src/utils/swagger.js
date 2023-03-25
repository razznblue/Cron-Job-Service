import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import LOGGER from './logger.js';


const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'JetSetRadio-API',
      version: process.env.npm_package_version,
    },
  },
  apis: ['./src/routes/router.js'],
};

const swaggerSpec = swaggerJSDoc(options);

const swaggerDocs = (app) => {
  // Swagger Page
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Docs in JSON
  app.get('/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  LOGGER.info(`Docs available at ${process.env.BASE_URL}/docs`);
}

export default swaggerDocs;