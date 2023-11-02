import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

import MiddlewareManager from './managers/MiddlewareManager.js';
import setUpSwagger from './utils/swagger.js';
import LOGGER from './utils/logger.js';


const PORT = process.env.PORT;


const App = {

  start() {
    const app = express();
    this.setMiddleware(app);

    app.listen(PORT || 3006, () => this.init(app));
  },

  init(app) {
    LOGGER.info(`Cron Job Service listening on Port ${PORT}`);
    const baseUrl = process.env.BASE_URL;
    const ping = process.env.PING;
    setUpSwagger(app);

    // Ping App every 10 minutes
    if (ping === true) {
      setInterval(async () => {
        const res = await axios.get(`${baseUrl}/health`);
        LOGGER.info(`App Ping - ${baseUrl}. Status: ${res.data.message}`);
      }, 600000);
    }
  },

  setMiddleware(app) {
    const middlewareManager = new MiddlewareManager(app);
    middlewareManager.setMiddleware();
  }
}

export default App;