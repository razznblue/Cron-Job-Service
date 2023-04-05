import axios from 'axios';
import { load } from 'cheerio';

import Constants from "../../constants/Constants.js";
import { GraffitiTagJSRF } from '../../models/GraffitiTagModel.js';
import BaseModel from '../../models/BaseModel.js';
import LOGGER from '../../utils/logger.js';
import { getCloudFiles } from '../../utils/googlecloud.js';

const jobExecutionTimeName = 'CronJob | jsrf-graffiti-tags';
const { URL: { WIKI_BASE_URL, GRAFFITI_TAGS_PATH } } = Constants;
const { JOBS: { JSRF_GRAFFITI_TAGS }, GAMES: { JET_SET_RADIO_FUTURE } } = Constants;

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

  const requests = await Promise.all([axios.get(url), getCloudFiles('jsrf/graffiti-tags/', '/')])
  const wikiHtml = requests[0];
  const cloudFiles = requests[1];

  const $ = load(wikiHtml.data);
  const modelName = 'graffitiTagJsrf';
  const promises = [];

  const trList = $('.article-table > tbody > tr');
  const filteredTrList = filterTableRows($, trList);

  LOGGER.info(`Filtered GraffitiTag TableRows records from ${trList.length} to ${filteredTrList.length}`);
  for (const el of filteredTrList) {
    const tds = $(el).find("td");
    const dataToSave = {
      number: $(tds[0]).text().trim(),
      tagName: $(tds[1]).text().trim(),
      level: $(tds[2]).text().trim() !== 'N/A' ? $(tds[2]).text().trim() : undefined,
      location: $(tds[3]).text().trim() !== 'N/A' ? $(tds[3]).text().trim() : undefined,
      size: $(tds[4]).text().trim(),
      wikiImageUrl: getWikiImageUrl($, tds)
    }
    promises.push(saveGraffitiTag(modelName, dataToSave, cloudFiles))
  }
  const users = await Promise.all(promises);
  console.timeEnd(jobExecutionTimeName);
  LOGGER.info(`Finished JSRF Graffiti-Tags Job. Processed ${users.length} new documents.`);
}

const saveGraffitiTag = async (modelName, dataToSave, cloudFiles) => {
  const { number, tagName, level, location, size, wikiImageUrl } = dataToSave;
  const exists = await BaseModel.existsByKeyAndValue(modelName, 'number', number);
    if (!exists && number) {
      const graffitiTag = new GraffitiTagJSRF();
      graffitiTag.number = number;
      graffitiTag.tagName = tagName;
      graffitiTag.level = level;
      graffitiTag.location = location;
      graffitiTag.size = size;
      graffitiTag.gameId = await BaseModel.getGameId(JET_SET_RADIO_FUTURE);
      graffitiTag.wikiImageUrl = wikiImageUrl;
      setImgUrl(graffitiTag, cloudFiles);
      console.log(graffitiTag)
      await graffitiTag.save();
      LOGGER.debug(`Saved new JSRF GraffitiTag ${number} : ${tagName}`);
    } else {
      LOGGER.debug(`Found existing JSRF GraffitiTag in DB ${number}`);
    }
}

const getWikiImageUrl = ($, tds) => {
  let wikiImageUrl = '';
  const wikiImageUrlExists = $(tds[5]).find('figure').length > 0;
  if (wikiImageUrlExists) {
    wikiImageUrl = $(tds[5]).find('figure').find('a').find('img').attr('data-src');
  }
  if (!wikiImageUrlExists) { // Some img tags on the wiki dont have a data-src attr
    wikiImageUrl = $(tds[5]).find('figure').find('a').find('img').attr('src');
  }
  return wikiImageUrl;
}

const filterTableRows = ($, tableRowsList) => {
  const filteredTrList = [];
  const filteredNumbers = [];
  for (const tr of tableRowsList) {
    const tds = $(tr).find("td");
    const number = $(tds[0]).text().trim();
    if (number && !filteredNumbers.includes(number)) {
      filteredTrList.push(tr);
      filteredNumbers.push(number);
    }
  }
  return filteredTrList;
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

