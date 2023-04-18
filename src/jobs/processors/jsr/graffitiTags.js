import { load } from 'cheerio';

import Axios from '../../../utils/axios.js';
import { GraffitiTagJSR } from "../../../models/GraffitiTagModel.js";
import Constants from "../../../constants/Constants.js";
import LOGGER from "../../../utils/logger.js";
import BaseModel from "../../../models/BaseModel.js";

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
const { JET_SET_RADIO } = Constants;

export const processJSRGraffitiTags = async () => {
  console.time(jobExecutionTimeName);
  const url = `https://greg-kennedy.com/jsr`;
  const response = await Axios.get(url);

  const $ = load(response.data);
  const modelName = 'graffitiTagJsr';

  const figures = $('.center');
  if (figures) {
    LOGGER.info(`Processing ${figures.length} jsr graffiti records`);
    const promises = [];
    for (const figure of figures) {
      const img = $(figure).find('img');
      const figcaption = $(figure).find('figcaption');
      if (img && figcaption) {

        const imageUrl = img.attr('src');
        const number = getGraffitiNumber(imageUrl);
        const { tagName, tagSubName } = getGraffitiNames($, figcaption);

        const imgUrlExists = await BaseModel.existsByKeyAndValue(modelName, 'imageUrl', imageUrl);
        if (!imgUrlExists) {
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
          LOGGER.warn(`Found existing JSR Tag with img ${imageUrl}`);
        }
      }
    }
    const docs = await Promise.all(promises);
    console.timeEnd(jobExecutionTimeName);
    LOGGER.info(`Finished JSR Graffiti-Tags Job. Saved ${docs.length} new documents.`);
  }

}

const saveGraffitiTag = async (graffitiTag) => {
  await graffitiTag.save();
  LOGGER.info(`Saved new JSR GraffitiTag ${graffitiTag.number} : ${graffitiTag.tagName}`);
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