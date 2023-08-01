import { load } from 'cheerio';

import Axios from '../../../utils/axios.js';
import Constants from "../../../constants/Constants.js";
import { GraffitiTagJSRF } from '../../../models/GraffitiTagModel.js';
import BaseModel from '../../../models/BaseModel.js';
import LOGGER from '../../../utils/logger.js';

const { WIKI_BASE_URL, JET_SET_RADIO_FUTURE } = Constants;
const GRAFFITI_TAGS_PATH = '/wiki/Graffiti_Tags_(JSRF)';
const jobExecutionTimeName = 'CronJob | jsrf-graffiti-tags';
const LOCATION_JSRF = 'locationJsrf';

/*
   - Scrapes the Graffiti-Tags page on the wiki and builds out a 'GraffitiTagJSRF' model. It will also 
  add the imgUrl from media-service if it exists. Saves the resulting document to mongoDB
*/
export const scrapeGraffitiTags = async () => {
  console.time(jobExecutionTimeName);
  const url = `${WIKI_BASE_URL}${GRAFFITI_TAGS_PATH}`;

  const wikiHtml = await Axios.get(url);

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
    promises.push(saveGraffitiTag(modelName, dataToSave))
  }
  const tags = await Promise.all(promises);
  console.timeEnd(jobExecutionTimeName);

  LOGGER.info(`Finished JSRF Graffiti-Tags Job. Processed ${tags.length} new documents.`);
}

const saveGraffitiTag = async (modelName, dataToSave) => {
  const { number, tagName, level, location, size, wikiImageUrl } = dataToSave;
  const graffitiSoulLocation = location;
  const tag = await BaseModel.getByKeyAndValue(modelName, 'number', number);
    if (!tag && number) {
      const graffitiTag = new GraffitiTagJSRF();
      graffitiTag.number = number;
      graffitiTag.tagName = tagName;
      graffitiTag.graffitiSoulLocation = graffitiSoulLocation;
      graffitiTag.size = size;
      graffitiTag.gameId = await BaseModel.getGameId(JET_SET_RADIO_FUTURE);
      graffitiTag.wikiImageUrl = wikiImageUrl;
      await setImgUrl(graffitiTag);
      await graffitiTag.save();
      LOGGER.info(`Saved new JSRF GraffitiTag ${number} : ${tagName}`);
    } else {
      if (level) {
        //TODO Turn this into a trigger in a future config tool
        try {
          const levels = level.split('/');
          for (const lev of levels) {
            const capitalizedlevel = capitalize(lev);
            const location = await BaseModel.getByKeyAndValue(LOCATION_JSRF, 'name', capitalizedlevel);
            if (location && !itemExistsInObject(location.name, tag.locations)) {
              tag.locations.push({name: location.name, id: location._id});
              tag.level = undefined;
              tag.graffitiSoulLocation = graffitiSoulLocation;
              await tag.save();
              LOGGER.info(`Saved GraffitiTag with location: '${location.name}'`);
            } else {
              LOGGER.warn(`Found existing location '${capitalizedlevel}' on tag '${tag.tagName}'`);
            }
          }
        } catch(err) {
          LOGGER.error(`Could not get locationId with location '${location.name}' for GraffitiTag. => \n${err}`);
        }
      }
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

const setImgUrl = async (graffitiTag) => {
  const graffitiNumber = extractNumbers(graffitiTag.number);
  const imgUrl = `https://media-library-swgu.netlify.app/jetsetradio-api/jsrf/graffiti-tags/${graffitiNumber}.png`;
  try {
    const response = await Axios.get(imgUrl);
    if (response.status === 200) {
      graffitiTag.imageUrl = imgUrl;
    }
  } catch(err) {
    LOGGER.error(`ImgUrl does exist for graffitiTag ${graffitiTag.number} in media-service`);
  }
}

const extractNumbers = (str) => {
  try {
    return str.match(/\d+/).toString();
  } catch {
    LOGGER.debug(`Error extracting numbers from string ${str}`);
  }
}

const excludedWords = ['of', 'the', 'and'];
const capitalize = (str) => {
  let words = str.split(" ");
  for (let i = 0; i < words.length; i++) {
    if (!excludedWords.includes(words[i]) || i === 0 ) {
      words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
    }
  }
  return words.join(" ");
}

const itemExistsInObject = (item, objects) => {
  if (objects === undefined) return false;
  const items = objects.map(obj => {return obj.name});
  return items.includes(item);
}

export default scrapeGraffitiTags;

