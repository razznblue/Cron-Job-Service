import express from 'express';
import LOGGER from '../../utils/logger.js';
import scrapeGraffitiTags from '../../jobs/jsrf/graffitiTags.js';

const graffitiTags = express.Router();

graffitiTags.get('/', async (req, res) => {
  res.send(`Graffiti-Tags job started at ${new Date().toISOString()}. See logs for status.`);
  try {
    await scrapeGraffitiTags();
  } catch(err) {
    LOGGER.error(`Error occurred while executing GraffitiTagsJob \n${err}`);
  }
})

export default graffitiTags;