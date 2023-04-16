import LOGGER from "../utils/logger.js";
import Constants from "../constants/Constants.js";
import { scrapeGraffitiTags } from "./processors/jsrf/graffitiTags.js";
import { executeTestJob } from "./processors/test/testJob.js";
import { processJSRGraffitiTags } from "./processors/jsr/graffitiTags.js";
import { processGames } from "./processors/games/gamesJob.js";
import processJSRFSongs from "./processors/jsrf/songs.js";
import processJSRSongs from "./processors/jsr/songs.js";
import { processCharacters } from "./processors/characters/characterJob.js";


const { JOBS } = Constants

export const JobInterchanger = {

  async executeJob(jobName) {
    if (!jobName) {
      LOGGER.warn(`Could not execute invalid jobName ${jobName} in JobInterchanger`);
      return () => {};
    }
    switch (jobName) {
      case JOBS.TEST_JOB:
        return jobActions.doTestJob();
      case JOBS.JSRF_GRAFFITI_TAGS:
        return await jobActions.processJSRFGraffitiTags();
      case JOBS.JSR_GRAFFITI_TAGS:
        return await jobActions.processJSRGraffitiTags();
      case JOBS.GAMES:
        return await jobActions.processGames();
      case JOBS.JSRF_SONGS:
        return await jobActions.processJSRFSongs();
      case JOBS.JSR_SONGS:
        return await jobActions.processJSRSongs();
      case JOBS.CHARACTERS:
        return await jobActions.processCharacters();
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
  processCharacters: async () => await processCharacters()
}