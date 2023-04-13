import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import jobs from './jobsRouter.js';
import admin from './adminRouter.js';
import HealthCheckManager from '../managers/HealthCheckManager.js';
import LOGGER from '../utils/logger.js';
import { sessionAuth } from '../config/auth.js';
import { pipeDatabase } from '../controllers/pipeController.js';


const router = express.Router();

router.use('/jobs', sessionAuth, jobs); 
router.use('/admin', admin);

router.get('/', (req, res) => res.send('JetSetRadio API'));

router.get('/health', (req, res) => {
  const healthCheckManager = new HealthCheckManager();
  let healthStatus;
  try {
    healthStatus = healthCheckManager.getAppHealth();
    res.send(healthStatus);
  } catch (error) {
    LOGGER.error(`App Health Check Failed \n${error}`);
    healthStatus.message = error;
    res.status(504).send(healthStatus);
  }
})

/* A single route to populate local database with ALL data from the API in production */
router.get('/pipe', async (req, res) => process.env.NODE_ENV !== 'production' ? await pipeDatabase(req, res) : res.status(500).send());

export default router;