import axios from 'axios';
import { load } from 'cheerio';

import Constants from "../../constants/Constants.js";
import { GraffitiTagJSRF } from '../../models/GraffitiTagModel.js';
import BaseModel from '../../models/BaseModel.js';
import LOGGER from '../../utils/logger.js';
import { getCloudFiles } from '../../utils/googlecloud.js';

const jobExecutionTimeName = 'CronJob | graffiti-tags';
const { URL: { WIKI_BASE_URL, GRAFFITI_TAGS_PATH } } = Constants;
const { JOBS: { JSRF_GRAFFITI_TAGS } } = Constants;

/*
   - Scrapes the Graffiti-Tags page on the wiki and
  builds out a 'GraffitiTagJSRF' model. It will also 
  add the imgUrl from google cloud storage if it exists.
  Saves the resulting document to mongoDB
*/
export const scrapeGraffitiTags = async () => {
  LOGGER.info(`Starting ${JSRF_GRAFFITI_TAGS} Cron Job`);
  console.time(jobExecutionTimeName);
  const url = `${WIKI_BASE_URL}${GRAFFITI_TAGS_PATH}`;
  const response = await axios.get(url);
  const $ = load(response.data);

  let savedDocuments = 0;
  const modelName = 'graffitiTagJsrf';
  const cloudFiles = await getCloudFiles('jsrf/graffiti-tags/', '/');
  const trList = $('.article-table > tbody > tr');

  for (const el of trList) {
    const graffitiTag = new GraffitiTagJSRF();

    const tds = $(el).find("td");
    const number = $(tds[0]).text().trim();
    const tagName = $(tds[1]).text().trim();
    const level = $(tds[2]).text().trim() !== 'N/A' ? $(tds[2]).text().trim() : null;
    const location = $(tds[3]).text().trim() !== 'N/A' ? $(tds[3]).text().trim() : null;
    const size = $(tds[4]).text().trim();
    let imageUrl = '';

    const imgUrlExists = $(tds[5]).find('figure').length > 0;
    if (imgUrlExists) {
      imageUrl = $(tds[5]).find('figure').find('a').find('img').attr('data-src');
    }
    if (!imageUrl) { // Some img tags dont have a data-src on this website
      imageUrl = $(tds[5]).find('figure').find('a').find('img').attr('src');
    }

    // In the future, set up "UpdateFields" option a CronJob object to customize the updating of certain fields
    const exists = await BaseModel.existsByKeyAndValue(modelName, 'number', number);
    if (!exists && number) {
      LOGGER.debug(`Creating new GraffitiTag ${number} : ${tagName}`);
      graffitiTag.number = number;
      graffitiTag.tagName = tagName;
      graffitiTag.level = level;
      graffitiTag.location = location;
      graffitiTag.size = size;
      graffitiTag.wikiImageUrl = imageUrl;
      setImgUrl(graffitiTag, cloudFiles);
      await graffitiTag.save();
      savedDocuments++;
    } else {
      LOGGER.debug(`Found existing GraffitiTag in DB ${number}`);
    }
  }

  console.timeEnd(jobExecutionTimeName);
  LOGGER.info(`Finished Graffiti-Tags Job. Created ${savedDocuments} new documents.`);
}

const setImgUrl = (graffitiTag, cloudFiles) => {
  for (const file of cloudFiles) {
    const fileNumber = extractNumbers(file.name);
    const graffitiNumber = extractNumbers(graffitiTag.number);
    if (graffitiNumber === fileNumber) {
      graffitiTag.imageUrl = file.url;
    }
  }
}

const extractNumbers = (str) => {
  try {
    return str.match(/\d+/).toString();
  } catch {
    //LOGGER.warn(`Error extracting numbers from string ${str}`);
  }
}

export default scrapeGraffitiTags;

