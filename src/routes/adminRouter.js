import express from 'express';

import { validateAdminForm } from '../utils/validation/ValidatorUtil.js';
import { createAdmin, renderAdmin, loginAdmin, logoutAdmin } from '../controllers/adminController.js';


const admin = express.Router();

admin.post('/create', validateAdminForm(), async (req, res) => await createAdmin(req, res));
admin.get('/login', (req, res) => renderAdmin(req, res));
admin.post('/login', validateAdminForm(), async (req, res) => { await loginAdmin(req, res) });
admin.get('/logout', (req, res) => logoutAdmin(req, res));

export default admin;