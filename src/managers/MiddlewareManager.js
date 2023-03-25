import express from 'express';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

import router from '../routes/router.js';


const __dirname = dirname(fileURLToPath(import.meta.url));

class MiddlewareManager {
  constructor(app) {
    this.app = app;
  }

  setMiddleware() {
    this.app.set('views', path.join(__dirname, '..', 'views'));
    this.app.set('view engine', 'ejs');
  
    this.app.use(express.static(path.join(__dirname, '..', 'public')));
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
    this.app.use('/', router);
  }
}

export default MiddlewareManager;