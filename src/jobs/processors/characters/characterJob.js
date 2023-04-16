import axios from "axios";
import { load } from 'cheerio';

import { CharacterJSR, CharacterJSRF } from "../../../models/CharacterModel.js";
import Constants from "../../../constants/Constants.js";
import LOGGER from "../../../utils/logger.js";
import BaseModel from "../../../models/BaseModel.js";


const jobExecutionTimeName = 'CronJob | characters';
const { 
  GAMES: { JET_SET_RADIO, JET_SET_RADIO_FUTURE },
  URL: { BASE_URL, WIKI_BASE_URL, CHARACTERS_CATEGORY_PATH, CHARACTER_STATS_PATH }
} = Constants;
const JET_SET_RADIO_CHARACTER = "Jet Set Radio Character";
const CHARACTERS_IN_JET_SET_RADIO = "Characters in Jet Set Radio";
const JET_SET_RADIO_GANG = "Jet Set Radio Gang";
const GANGS_IN_JET_SET_RADIO = "Gangs in Jet Set Radio";

const JET_SET_RADIO_FUTURE_CHARACTER = "Jet Set Radio Future Character";
const JET_SET_RADIO_FUTURE_CHARACTERS = "Jet Set Radio Future characters";
const CHARACTERS_IN_JET_SET_RADIO_FUTURE = "Characters in Jet Set Radio Future";
const JET_SET_RADIO_FUTURE_GANG = "Jet Set Radio Future Gang";
const GANGS_IN_JET_SET_RADIO_FUTURE = "Gangs in Jet Set Radio Future";

/**
 * The following characters have both JSR and JSRF versions on a single page.
 *  - Poison Jam
 *  - Love Shockers
 *  - Noise Tanks
 *  - Golden Rhinos
 * 
 * The following characters are not in the Wiki but we want to add these in after
 *  - Pyrotech Golden Rhino/JSRF
 *  - Cyborg Golden Rhino/JSRF
 */

export const processCharacters = async () => {
  console.time(jobExecutionTimeName);

  const characters = await getCharacterNames();
  const promises = [];
  for (const character of characters) {
    promises.push(processCharacter(character));
  }
  await Promise.all(promises);
  await processCharacterStats();
  
  console.timeEnd(jobExecutionTimeName);
}

const getCharacterNames = async () => {
  const url = `${WIKI_BASE_URL}${CHARACTERS_CATEGORY_PATH}`;
  const response = await axios.get(url);
  const $ = load(response.data);

  /* Get wiki url links for all characters */
  const categoryPageMember = $('.category-page__members > .category-page__members-wrapper > .category-page__members-for-char > .category-page__member > a');
  const characters = [];
  for (const member of categoryPageMember) {
    const attrs = member.attributes;
    const characterData = {
      name: attrs.find(member => member.name === 'title').value,
      url: attrs.find(member => member.name === 'href').value
    }

    /* Remove the /JSRF suffix on the name if it exists */
    characterData.name = characterData.name.includes('/') && characterData.name.includes('JSRF')
      ? characterData.name.split('/')[0] : characterData.name;

    /* Filter out "Category" pages because they are not a single character page */
    if (!characterData.name.includes('Category')) {
      characters.push(characterData);
    }
  }

  /* Validate URLs */
  const promises = [];
  for (const character of characters) {
    promises.push(validateCharacterUrl(character.name, character.url))
  }
  const brokenCharacters = await Promise.all(promises);
  const validatedCharacters = characters.filter(ch => !brokenCharacters.includes(ch.name));
  LOGGER.info(`Character Urls Validated. Removed ${characters.length - validatedCharacters.length} Broken links`);
  return validatedCharacters;
}

const validateCharacterUrl = async (characterName, characterPath) => {
  const url = await axios.get(BASE_URL + characterPath);
  if (url.status === !200) {
    LOGGER.error(`Encountered broken character page ${BASE_URL + characterPath} for ${characterName}`);
    return characterName;
  }
}

const processCharacter = async (character) => {
  const response = await axios.get(BASE_URL + character.url);
  const $ = load(response.data);

  /* Determine which game a character belongs to and send it to the appropriate processor */
  const pageCategories = $('.page-header__categories > a');
  const categories = [];
  for (const category of pageCategories) {
    const categoryName = $(category).html();
    if (isJSRCategory(categoryName)) categories.push(JET_SET_RADIO_CHARACTER);
    if (isJSRFCategory(categoryName)) categories.push(JET_SET_RADIO_FUTURE_CHARACTER);
  }
  const finalCategories = [...new Set(categories)];
  if (finalCategories.length === 1 && finalCategories[0] === JET_SET_RADIO_CHARACTER) {
    await processJSRCharacter(character, $);
  }
  if (finalCategories.length === 1 && finalCategories[0] === JET_SET_RADIO_FUTURE_CHARACTER) {
    await processJSRFCharacter(character, $);
  }
  if (finalCategories.length > 1) {
    await Promise.all([processJSRCharacter(character, $), processJSRFCharacter(character, $)]);
  }
}

const isJSRCategory = (category) => {
  const cat = category.toLowerCase();
  return cat === JET_SET_RADIO_CHARACTER.toLowerCase() || cat === JET_SET_RADIO_GANG.toLowerCase()
  || cat === CHARACTERS_IN_JET_SET_RADIO.toLowerCase() || cat === GANGS_IN_JET_SET_RADIO.toLowerCase();
}

const isJSRFCategory = (category) => {
  const cat = category.toLowerCase();
  return cat === JET_SET_RADIO_FUTURE_CHARACTER.toLowerCase() || cat === JET_SET_RADIO_FUTURE_GANG.toLowerCase()
  || cat === CHARACTERS_IN_JET_SET_RADIO_FUTURE.toLowerCase() || cat === GANGS_IN_JET_SET_RADIO_FUTURE.toLowerCase()
|| cat === JET_SET_RADIO_FUTURE_CHARACTERS.toLowerCase();
}

/* Actual ETL processing methods */
const processJSRCharacter = async (character, $) => {
  //LOGGER.info(`processing JSR character ${character.name}`);
  const modelName = 'characterJsr';

  const name = character.name;
  const descriptions = getWikiDescription($);
  const gender = $('.mw-parser-output > .portable-infobox > [data-source=gender] > div').html() || undefined;
  const debut = $('.mw-parser-output > .portable-infobox > [data-source=debut] > div').html() || undefined;
  const age = $('.mw-parser-output > .portable-infobox > [data-source=age] > div').html() || undefined;
  const height = $('.mw-parser-output > .portable-infobox > [data-source=height] > div').html() || undefined;
  const trait = $('.mw-parser-output > .portable-infobox > [data-source=trait] > div').html() || undefined;
  const likes = $('.mw-parser-output > .portable-infobox > [data-source=likes] > div').html() || undefined;
  const wikiPage = BASE_URL + character.url;
  const heroImage = getWikiImage($);
  const gallery = getGallery($);

  const exists = await BaseModel.getByKeyAndValue(modelName, 'name', name);
  if (!exists) {
    const character = new CharacterJSR();
    character.name = name;
    character.descriptions = descriptions;
    character.gender = gender;
    character.age = age !== undefined ? age.replace(/\D/g, "") : undefined;
    character.height = height;
    character.trait = trait;
    character.likes = likes;
    character.debut = debut;
    character.heroImage = heroImage;
    character.wikiPage = wikiPage;
    character.gender = gender;
    character.gameId = await BaseModel.getGameId(JET_SET_RADIO);
    character.gallery = gallery;
    await character.save();
    LOGGER.info(`Created new JSR Character ${character.name}`);
  } else {
    LOGGER.warn(`Found existing JSR Characters ${name}`);
  }
}

const processJSRFCharacter = async (character, $) => {
  const modelName = 'characterJsrf';
  const name = character.name;
  const descriptions = getWikiDescription($);
  const gender = $('.mw-parser-output > .portable-infobox > [data-source=gender] > div').html() || undefined;
  const debut = $('.mw-parser-output > .portable-infobox > [data-source=debut] > div').html() || undefined;
  const wikiPage = BASE_URL + character.url;
  const heroImage = getWikiImage($);
  const gallery = getGallery($);

  const exists = await BaseModel.getByKeyAndValue(modelName, 'name', name);
  if (!exists) {
    const character = new CharacterJSRF();
    character.name = name;
    character.descriptions = descriptions;
    character.gender = gender;
    character.debut = debut;
    character.heroImage = heroImage;
    character.wikiPage = wikiPage;
    character.gender = gender;
    character.gameId = await BaseModel.getGameId(JET_SET_RADIO_FUTURE);
    character.gallery = gallery;
    await character.save();
    LOGGER.info(`Created new JSRF Character ${character.name}`);
  } else {
    LOGGER.warn(`Found existing JSRF Characters ${name}`);
  }

}

const processCharacterStats = async () => {
  LOGGER.info('processing characterStats');
  const url = `${WIKI_BASE_URL}${CHARACTER_STATS_PATH}`;
  const response = await axios.get(url);
  const $ = load(response.data);

  /* Process Stats for JSR Characters */
  const jsrStatsTable = $('.mw-parser-output > table.sortable').first();
  const jsrTableRows = $(jsrStatsTable).find('tbody > tr');
  let name;
  for (const tr of jsrTableRows) {
    const charHtml = $(tr).find('td').html();
    if (charHtml && charHtml.includes('title="')) {
      name = charHtml.split('title="')[1].split('">')[0];
    } 
    const tds = $(tr).find("td");
    const stats = {
      power: $(tds[1]).text().trim(),
      technique: $(tds[2]).text().trim(),
      graffiti: $(tds[3]).text().trim()
    }

    /* Edge case for Tab/Corn */
    if (name === 'Tab') {
      const mongoCharacter = await BaseModel.getByKeyAndValue('characterJsr', 'name', 'Corn');
      if (mongoCharacter) {
        mongoCharacter.stats = stats;
        if (!mongoCharacter.aliases.includes('Tab')) mongoCharacter.aliases.push('Tab');
        await mongoCharacter.save();
        LOGGER.info(`Saved STATS for JSR Character ${name}`);
      }
    }

    const mongoCharacter = await BaseModel.getByKeyAndValue('characterJsr', 'name', name);
    if (mongoCharacter) {
      mongoCharacter.stats = stats;
      await mongoCharacter.save();
      LOGGER.info(`Saved STATS for JSR Character ${name}`);
    } else {
      LOGGER.warn(`Could not save stats for ${name} (JSR)`)
    }
  }

  /* process STATS for JSRF Characters */
  const children = $('.mw-parser-output').children()
  let jsrfTable;
  for (let i = 0; i < children.length; i++) {
    if (i === children.length - 1);
    jsrfTable = children[i];
  }
  const rows = $(jsrfTable).children().first().find('tr');
  for (const row of rows) {
    let name;
    const charHtml = $(row).find('td').first().html();
    if (charHtml && charHtml.includes('title="')) {
      name = charHtml.split('title="')[1].split('">')[0];
    } 

    const tds = $(row).find("td");
    const stats = {
      stamina: $(tds[1]).text().trim(),
      gStamina: $(tds[2]).text().trim(),
      graffiti: $(tds[3]).text().trim(),
      acceleration: $(tds[4]).text().trim(),
      cornering: $(tds[5]).text().trim(),
      grind: $(tds[6]).text().trim(),
      sprayCans: $(tds[7]).text().trim().replace(/\D/g, "")
    }

    /* Incase the page name is similar to: Beat/JSRF */
    if (name) {
      name = name.includes('/') ? name.split('/')[0] : name;
    }
    const mongoCharacter = await BaseModel.getByKeyAndValue('characterJsrf', 'name', name);
    if (mongoCharacter) {
      mongoCharacter.stats = stats;
      await mongoCharacter.save();
      LOGGER.info(`Saved STATS for JSRF Character ${name}`);
    } else {
      LOGGER.warn(`Could not save stats for ${name} (JSRF)`)
    }
  }

}

const getWikiDescription = ($) => {
  const descriptions = [];
  const paragraphs = $('.mw-parser-output > p');
  for (const p of paragraphs) {
    if ($(p).text().trim() !== '') {
      descriptions.push($(p).text().trim());
    }
  }
  return descriptions;
}

const getWikiImage = ($) => {
  const elements = $('.mw-parser-output').first().children();
  const primaryATag = $('.mw-parser-output > .thumb > a');
  const secondaryATag = $('.mw-parser-output > .portable-infobox > .pi-image > a');
  let first = "";

  /* Return the FIRST <a> tag instance under hero section */
  for (let i = 0; i < elements.length; i++) {
    const elementClasses = $(elements[i]).attr('class');
    if (elementClasses) {
      if (elementClasses.includes('thumb')) {
        first = primaryATag;
        break;
      }
      if (elementClasses.includes('portable-infobox')) {
        first = secondaryATag;
        break;
      }
    }
    first = primaryATag;
  }
  return $(first).attr('href');
}

const getGallery = ($) => {
  const gallery = [];
  const galleryImages = $('#gallery-0 > .wikia-gallery-item > .thumb > .gallery-image-wrapper > a > img');
  const galleryTexts = $('#gallery-0 > .wikia-gallery-item > .lightbox-caption')
  for (let i = 0; i < galleryImages.length; i++) {
    gallery.push({
      photo: $(galleryImages[i]).attr('data-src'),
      description: $(galleryTexts[i]).text().trim()
    })
  }
  return gallery;
}