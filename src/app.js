import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import MiddlewareManager from './managers/MiddlewareManager.js';


const PORT = process.env.PORT;

const App = {

  start() {
    const app = express();
    this.setMiddleware(app);

    app.listen(PORT || 3006, () => {
      console.log(`JetSetRadio-API listening on Port ${PORT}`);
    })
  },

  setMiddleware(app) {
    const middlewareManager = new MiddlewareManager(app);
    middlewareManager.setMiddleware();
  }
}

export default App;