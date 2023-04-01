import axios from "axios";
import { load } from 'cheerio';

import { GraffitiTagJSR } from "../../models/GraffitiTagModel.js";
import Constants from "../../constants/Constants.js";
import LOGGER from "../../utils/logger.js";
import BaseModel from "../../models/BaseModel.js";

const sizesMap = {
  XL: {
    height: 512,
    width: 128
  },
  L: {
    height: 256,
    width: 128
  },
  S: {
    height: 128,
    width: 128
  }
}

const jobExecutionTimeName = 'CronJob | jsr-graffiti-tags';
const { JOBS: { JSR_GRAFFITI_TAGS }, GAMES: { JET_SET_RADIO } } = Constants;

export const processJSRGraffitiTags = async () => {
  LOGGER.info(`Starting ${JSR_GRAFFITI_TAGS} Cron Job`);
  console.time(jobExecutionTimeName);
  const url = `https://greg-kennedy.com/jsr`;
  const response = await axios.get(url);

  const $ = load(response.data);
  const modelName = 'graffitiTagJsr';

  const figures = $('.center');
  if (figures) {
    const promises = [];
    for (const figure of figures) {
      const img = $(figure).find('img');
      const figcaption = $(figure).find('figcaption');
      if (img && figcaption) {

        const imageUrl = img.attr('src');
        const number = getGraffitiNumber(imageUrl);
        const { tagName, tagSubName } = getGraffitiNames($, figcaption);

        const exists = await Promise.all([BaseModel.existsByKeyAndValue(modelName, 'number', number),
          BaseModel.existsByKeyAndValue(modelName, 'tagSubName', tagSubName)]);
        if (!exists.every(v => v === true)) {
          const graffitiTag = new GraffitiTagJSR();
          const height = img.attr('width');
          const width = img.attr('height');

          const size = getGraffitiSize({ height, width });

          graffitiTag.number = number;
          graffitiTag.tagName = tagName;
          graffitiTag.tagSubName = tagSubName;
          graffitiTag.size = size;
          graffitiTag.gameId = await BaseModel.getGameId(JET_SET_RADIO);
          graffitiTag.imageUrl = imageUrl;

          promises.push(saveGraffitiTag(graffitiTag));
        } else {
          LOGGER.info(`Found existing JSR GraffitiTag in DB ${number}`);
        }
      }
    }
    const docs = await Promise.all(promises);
    console.timeEnd(jobExecutionTimeName);
    LOGGER.info(`Finished JSR Graffiti-Tags Job. Processed ${docs.length} new documents.`);
  }

}

const saveGraffitiTag = async (graffitiTag) => {
  await graffitiTag.save();
  LOGGER.info(`Saved new JSRF GraffitiTag ${graffitiTag.number} : ${graffitiTag.tagName}`);
}

const getGraffitiNames = ($, figcaption) => {
  const bTag = $(figcaption).find('b');
  const iTag = $(figcaption).find('i');

  // Some figcaptions contain an <i> or a <b>, we use one or the other
  let tagName = '';
  if (bTag && bTag.text().trim() !== '') {
    tagName = bTag.text().trim().replace(/[\n\t\r]/g,"");
  }
  if (iTag && iTag.text().trim() !== '' && tagName === '') {
    tagName = iTag.text().trim().replace(/[\n\t\r]/g,"");
  }
  let tagSubNameRaw = $(figcaption).text().trim().replace(/[\n\t\r]/g,"").replace("(","").replace(")","");

  // Use cases for items near the bottom of the list
  if (tagName === '' && tagSubNameRaw !== '') {
    tagName = tagSubNameRaw;
    tagSubNameRaw = '';
  }

  // Handle another special case
  if (tagName.includes('replaces') && tagSubNameRaw !== '') {
    let tmp = tagName;
    tagName = tagSubNameRaw;
    tagSubNameRaw = tmp.replace("(","").replace(")","");

    if (tagName.includes('"')) {
      tagName = tagName.split('"')[1];
    }
  }

  //Remove any whitespace between text
  let tagSubName = tagSubNameRaw.split(' ').filter(str => str !== '').join(' ')

  return { 
    tagName,
    tagSubName 
  }
}

const getGraffitiNumber = (imageUrl) => {
  const splitted = imageUrl.split(".");
  return splitted[splitted.length - 2]; 
}

const getGraffitiSize = (dimensions) => {
  for (const [key, value] of Object.entries(sizesMap)) {
    if (dimensions.height.toString() === value.height.toString() 
        && dimensions.width.toString() === value.width.toString()) {
      return key;
    } 
  }
  return undefined;
}