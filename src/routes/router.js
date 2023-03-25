import express from 'express';

import api from './api/apiRouter.js';
import HealthCheckManager from '../managers/HealthCheckManager.js';


const router = express.Router();

router.use('/api', api);

/**
 * @openapi
 * /:
 *  get:
 *    tags: 
 *      - Index
 *    description: Homepage of JetSetRadio API
 *    responses:
 *      200:
 *        description: App is serving the home page
 */
router.get('/', (req, res) => {
  res.send('JetSetRadio API');
})

/**
 * @openapi
 * /health:
 *   get:
 *     tags: 
 *       - HealthCheck
 *     description: Responds if the app is running
 *     responses:
 *       200:
 *         description: App is Healthy!
 */
router.get('/health', (req, res) => {
  const healthCheckManager = new HealthCheckManager();
  let healthStatus;
  try {
    healthStatus = healthCheckManager.getAppHealth();
    res.send(healthStatus);
  } catch (error) {
    healthStatus.message = error;
    res.status(504).send(healthStatus);
  }
})

export default router;