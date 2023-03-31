import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import { getAllGraffitiTags, getJSRFGraffitiTags, getJSRGraffitiTags } from '../../../controllers/api/entities/graffitiTagsController.js';


const graffitiTags = express.Router();

/**
 * @openapi
 * /v1/api/graffiti-tags:
 *  get:
 *    tags: 
 *      - Graffiti-Tags
 *    description: All graffiti tags
 *    responses:
 *      200:
 *        description: Returning all graffiti-tags from JSRF and JSR
 */
graffitiTags.get('/', async (req, res) => { await getAllGraffitiTags(req, res) });

/**
 * @openapi
 * /v1/api/graffiti-tags/jsr:
 *  get:
 *    tags: 
 *      - Graffiti-Tags
 *    description: JSR graffiti tags
 *    responses:
 *      200:
 *        description: Returning only graffiti-tags from JSR
 */
graffitiTags.get('/jsr', async (req, res) => { await getJSRGraffitiTags(req, res) });

/**
 * @openapi
 * /v1/api/graffiti-tags/jsrf:
 *  get:
 *    tags: 
 *      - Graffiti-Tags
 *    description: JSRF graffiti tags
 *    responses:
 *      200:
 *        description: Returning only graffiti-tags from JSRF
 */
graffitiTags.get('/jsrf', async (req, res) => { await getJSRFGraffitiTags(req, res) });

export default graffitiTags;