import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

import MiddlewareManager from './managers/MiddlewareManager.js';
import setUpSwagger from './utils/swagger.js';
import LOGGER from './utils/logger.js';
import { cleanupJobs } from './jobs/jobsUtil.js';


const PORT = process.env.PORT;

const App = {

  start() {
    const app = express();
    this.setMiddleware(app);

    app.listen(PORT || 3006, () => this.init(app));
  },

  init(app) {
    LOGGER.info(`JetSetRadio-API listening on Port ${PORT}`);
    const baseUrl = process.env.BASE_URL;
    setUpSwagger(app);
    
    //On startup, delete any remaining CronJob records in the DB
    const delay = process.env.NODE_ENV === 'production' ? 120000 : 10000;
    setTimeout(async () => {
      const {data: {dbState}} = await axios.get(`${baseUrl}/health`);
      dbState.core === 'connected' ? cleanupJobs() : LOGGER.warn(`SKipped cleaning up CronJobs : CORE_DB connection not established`);
    }, delay);

    // Ping App every 10 minutes
    setInterval(async () => {
      const res = await axios.get(`${baseUrl}/health`);
      console.log(`App Ping - ${baseUrl}. Status: ${res.data.message}`);
    }, 600000);
  },

  setMiddleware(app) {
    const middlewareManager = new MiddlewareManager(app);
    middlewareManager.setMiddleware();
  }
}

export default App;