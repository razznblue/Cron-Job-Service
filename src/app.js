import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import MiddlewareManager from './managers/MiddlewareManager.js';
import swaggerDocs from './utils/swagger.js';
import LOGGER from './utils/logger.js';
import { cleanupJobs } from './jobs/jobsUtil.js';


const PORT = process.env.PORT;

const App = {

  start() {
    const app = express();
    this.setMiddleware(app);

    app.listen(PORT || 3006, () => {
      LOGGER.info(`JetSetRadio-API listening on Port ${PORT}`);
      this.init(app);
    })
  },

  init(app) {
    swaggerDocs(app);
    cleanupJobs();
    (async () => {
      setInterval(async () => {
        const baseUrl = process.env.BASE_URL;
        const res = await axios.get(`${baseUrl}/health`);
        console.log(`App Ping - ${baseUrl}. Status: ${res.data.message}`);
      }, 600000);
    })();
  },

  setMiddleware(app) {
    const middlewareManager = new MiddlewareManager(app);
    middlewareManager.setMiddleware();
  }
}

export default App;