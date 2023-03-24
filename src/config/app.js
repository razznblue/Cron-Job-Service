import express from 'express';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import dotenv from 'dotenv';
dotenv.config();

import router from './routes/router.js';


const __dirname = dirname(fileURLToPath(import.meta.url));
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
    app.set('views', path.join(__dirname, '..', 'views'));
    app.set('view engine', 'ejs');
  
    app.use(express.static(path.join(__dirname, '..', 'public')));
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use('/', router);
  }
}

export default App;