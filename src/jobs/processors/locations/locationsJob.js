import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

import { LocationJSR, LocationJSRF } from "../../../models/LocationModel.js";
import { LevelJSR } from "../../../models/LevelModel.js";
import Constants from "../../../constants/Constants.js";
import LOGGER from "../../../utils/logger.js";
import BaseModel from "../../../models/BaseModel.js";


const jobExecutionTimeName = 'CronJob | locations';
const { JET_SET_RADIO, JET_SET_RADIO_FUTURE } = Constants;

const CHARACTER_JSR = 'characterJsr';
const CHARACTER_JSRF = 'characterJsrf';
const LOCATION_JSR = 'locationJsr';
const LOCATION_JSRF = 'locationJsrf';
const LEVEL_JSR = 'levelJsr';

const __dirname = dirname(fileURLToPath(import.meta.url));
import { readJSONFile } from "../../../utils/fileUtil.js";

export const processLocations = async () => {
  console.time(jobExecutionTimeName);

  await processJSRLocations();
  await processJSRLevels();
  await processJSRFLocations();
  await processAdjacentLocations();

  console.timeEnd(jobExecutionTimeName);
}

const processJSRLocations = async () => {
  const jsrLocations = path.join(__dirname, '..', '..', '..', 'storage', 'locations', 'jsr-locations.json');
  const locations = await readJSONFile(jsrLocations, 'utf8');
  if (!locations) {
    LOGGER.error(`Could not Process JSR Locations`);
    return;
  }
  for (const loc of locations) {
    const name = loc.name;
    const exists = await BaseModel.getByKeyAndValue(LOCATION_JSR, 'name', name);
    if (!exists) {
      const location = new LocationJSR();
      location.name = name;
      location.description = loc.description;
      location.subLocations = loc.subLocations;
      location.gameId = await BaseModel.getGameId(JET_SET_RADIO);

      try {
        const secretCharacter = await BaseModel.getByKeyAndValue(CHARACTER_JSR, 'name', loc.secretCharacter);
        location.secretCharacter = { name: secretCharacter.name, id: secretCharacter._id };
      } catch(err) {
        LOGGER.warn(`Could not find character '${loc.secretCharacter}' while processing secretChaarcter for JSR location '${location.name}' => \n${err}`);
      }

      for (const unlockableCharacterName of loc.unlockableCharacters) {
        try {
          const unlockableCharacter = await BaseModel.getByKeyAndValue(CHARACTER_JSR, 'name', unlockableCharacterName);
          location.unlockableCharacters.push({name: unlockableCharacter.name, id: unlockableCharacter._id});
        } catch(err) {
          LOGGER.warn(`Could not find character '${unlockableCharacterName}' while processing unlockableCharacters for JSR location '${location.name}' => \n${err}`);
        }
      }

      await location.save();
      LOGGER.info(`Saved new JSR Location '${location.name}'`);
    } else {
      LOGGER.warn(`Found existing JSR Location '${name}'`);
    }
  }

}

const processJSRLevels = async () => {
  const jsrLevels = path.join(__dirname, '..', '..', '..', 'storage', 'locations', 'jsr-levels.json');
  const levels = await readJSONFile(jsrLevels, 'utf8');
  if (!levels) {
    LOGGER.error(`Could not Process JSR Levels`);
    return;
  }
  for (const lev of levels) {
    const name = lev.name;
    const exists = await BaseModel.getByKeyAndValue(LEVEL_JSR, 'name', name);
    if (!exists) {
      const level = new LevelJSR();
      level.name = name;
      level.description = lev.description;
      
      try {
        const location = await BaseModel.getByKeyAndValue(LOCATION_JSR, 'name', lev.location);
        level.location = {name: location.name, id: location._id};
      } catch(err) {
        LOGGER.warn(`Could not find Location '${lev.location}' while processing JSR level '${lev.name}'`);
      }

      level.jetRankingPoints = lev.jetRankingPoints;
      level.smallTagsCount = lev.smallTagsCount ? lev.smallTagsCount : undefined;
      level.largeTagsCount = lev.largeTagsCount ? lev.largeTagsCount : undefined;
      level.extraLargeTagsCount = lev.extraLargeTagsCount ? lev.extraLargeTagsCount : undefined;
      level.bossLevel = lev.bossLevel ? true : false;
      level.chapter = lev.chapter;

      await level.save();
      LOGGER.info(`Saved new JSR Level '${level.name}'`);
    } else {
      LOGGER.warn(`Found existing JSR Level '${name}'`);
    }
  }
}


const processJSRFLocations = async () => {
  const jsrfLocations = path.join(__dirname, '..', '..', '..', 'storage', 'locations', 'jsrf-locations.json');
  const locations = await readJSONFile(jsrfLocations, 'utf8');
  if (!locations) {
    LOGGER.error(`Could not Process JSRF Locations`);
    return;
  }
  for (const loc of locations) {
    const name = loc.name;
    const exists = await BaseModel.getByKeyAndValue(LOCATION_JSRF, 'name', name);
    if (!exists) {
      const location = new LocationJSRF();
      location.name = name;
      location.description = loc.description;
      location.gameId = await BaseModel.getGameId(JET_SET_RADIO_FUTURE);
      location.hasMixtape = loc.hasMixtape;
      location.imageUrl = loc.imageUrl;

      if (loc.secretCharacter) {
        try {
          const secretCharacter = await BaseModel.getByKeyAndValue(CHARACTER_JSRF, 'name', loc.secretCharacter);
          location.secretCharacter = { name: secretCharacter.name, id: secretCharacter._id };
        } catch(err) {
          LOGGER.warn(`Could not find character '${loc.secretCharacter}' while processing secretChaarcter for JSRF location '${location.name}' => \n${err}`);
        }
      }

      for (const unlockableCharacterName of loc.unlockableCharacters) {
        try {
          const unlockableCharacter = await BaseModel.getByKeyAndValue(CHARACTER_JSRF, 'name', unlockableCharacterName);
          location.unlockableCharacters.push({name: unlockableCharacter.name, id: unlockableCharacter._id});
        } catch(err) {
          LOGGER.warn(`Could not find character '${unlockableCharacterName}' while processing unlockableCharacters for JSRF location '${location.name}' => \n${err}`);
        }
      }
      await location.save();
      LOGGER.info(`Saved new JSRF Location '${location.name}'`);
    } else {
      LOGGER.warn(`Found existing JSRF Location '${name}'`);
    }
  }
}

const processAdjacentLocations = async () => {
  const jsrfLocations = path.join(__dirname, '..', '..', '..', 'storage', 'locations', 'jsrf-locations.json');
  const locations = await readJSONFile(jsrfLocations, 'utf8');
  if (!locations) {
    LOGGER.error(`Could not Process JSRF Adjacent Locations`);
    return;
  }

  for (const loc of locations) {
    const location = await BaseModel.getByKeyAndValue(LOCATION_JSRF, 'name', loc.name);
    if (!location) {
      LOGGER.error(`Could not Process adjacent locations for JSRF location '${loc.name}'`);
    } else {
      for (const adjacentLocationName of loc.adjacentLocations) {
        if (!adjacentLocationExists(adjacentLocationName, location.adjacentLocations)) {
          const adjLocation = await BaseModel.getByKeyAndValue(LOCATION_JSRF, 'name', adjacentLocationName);
          location.adjacentLocations.push({name: adjLocation.name, id: adjLocation._id});
        } else {
          LOGGER.warn(`Found existing adjacent location '${adjacentLocationName}' for location '${location.name}'`)
        }
      }

      await location.save();
    }
  }

}

const adjacentLocationExists = (incomingAdjacentLocationName, existingAdjacentLocations) => {
  const names = existingAdjacentLocations.map(location => {return location.name});
  return names.includes(incomingAdjacentLocationName);
}