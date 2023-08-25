import LOGGER from "../utils/logger.js";
import { scrapeGraffitiTags } from "./processors/jsrf/graffitiTags.js";
import { executeTestJob } from "./processors/test/testJob.js";
import { processJSRGraffitiTags } from "./processors/jsr/graffitiTags.js";
import { processGames } from "./processors/games/gamesJob.js";
import processJSRFSongs from "./processors/jsrf/songs.js";
import processJSRSongs from "./processors/jsr/songs.js";
import { processCharacters } from "./processors/characters/characterJob.js";
import { processLocations } from "./processors/locations/locationsJob.js";

import { processMReliefFamily } from './m_fires_relief/jobs.js'


const TEST_JOB = 'TEST_JOB';
const JSRF_GRAFFITI_TAGS = 'JSRF_GRAFFITI_TAGS';
const JSR_GRAFFITI_TAGS = 'JSR_GRAFFITI_TAGS';
const JSRF_SONGS = 'JSRF_SONGS';
const JSR_SONGS = 'JSR_SONGS';
const GAMES = 'GAMES';
const CHARACTERS = 'CHARACTERS';
const LOCATIONS = 'LOCATIONS';

/* Need to move to cronjob-service */
const M_FIRES_RELIEF_FAMILY = 'M_FIRES_RELIEF_FAMILY';

export const JobInterchanger = {

  async executeJob(jobName) {
    if (!jobName) {
      LOGGER.warn(`Could not execute invalid jobName ${jobName} in JobInterchanger`);
      return () => {};
    }
    switch (jobName) {
      case TEST_JOB:
        return jobActions.doTestJob();
      case JSRF_GRAFFITI_TAGS:
        return await jobActions.processJSRFGraffitiTags();
      case JSR_GRAFFITI_TAGS:
        return await jobActions.processJSRGraffitiTags();
      case GAMES:
        return await jobActions.processGames();
      case JSRF_SONGS:
        return await jobActions.processJSRFSongs();
      case JSR_SONGS:
        return await jobActions.processJSRSongs();
      case CHARACTERS:
        return await jobActions.processCharacters();
      case LOCATIONS:
        return await jobActions.processLocations();
      
      /* cron-job service */
      case M_FIRES_RELIEF_FAMILY:
        return await jobActions.processMReliefFamily();
    }
    return () => {};
  }

} 

const jobActions = {
  doTestJob: () => executeTestJob(),
  processJSRFGraffitiTags: async () => await scrapeGraffitiTags(),
  processJSRGraffitiTags: async () => await processJSRGraffitiTags(),
  processGames: async () => await processGames(),
  processJSRFSongs: async () => await processJSRFSongs(),
  processJSRSongs: async () => await processJSRSongs(),
  processCharacters: async () => await processCharacters(),
  processLocations: async () => await processLocations(),

  /* cron-job service */
  processMReliefFamily: async () => await processMReliefFamily()
}