import express from 'express';

import api from './api/apiRouter.js';
import HealthCheckManager from '../managers/HealthCheckManager.js';


const router = express.Router();

router.use('/api', api);

router.get('/', (req, res) => {
  res.send('JetSetRadio API');
})

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