import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import MiddlewareManager from './managers/MiddlewareManager.js';
import swaggerDocs from './utils/swagger.js';
import LOGGER from './utils/logger.js';


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
  },

  setMiddleware(app) {
    const middlewareManager = new MiddlewareManager(app);
    middlewareManager.setMiddleware();
  }
}

export default App;