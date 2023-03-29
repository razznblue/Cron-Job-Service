import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import { getAllGraffitiTags, getJSRFGraffitiTags, getJSRGraffitiTags } from '../../../controllers/api/entities/graffitiTagsController.js';


const graffitiTags = express.Router();

graffitiTags.get('/', async (req, res) => { await getAllGraffitiTags(req, res) });
graffitiTags.get('/jsr', async (req, res) => { await getJSRGraffitiTags(req, res) });
graffitiTags.get('/jsrf', async (req, res) => { await getJSRFGraffitiTags(req, res) });

export default graffitiTags;