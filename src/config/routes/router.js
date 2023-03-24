import express from 'express';

import api from './api/apiRouter.js';


const router = express.Router();
router.use('/api', api);

export default router;