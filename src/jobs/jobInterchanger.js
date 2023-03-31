import LOGGER from "../utils/logger.js";
import Constants from "../constants/Constants.js";
import { scrapeGraffitiTags } from "./jsrf/graffitiTags.js";
import { executeTestJob } from "./test/testJob.js";
import { processJSRGraffitiTags } from "./jsr/graffitiTags.js";


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
    }
    return () => {};
  }

} 

const jobActions = {
  doTestJob: () => executeTestJob(),
  processJSRFGraffitiTags: async () => await scrapeGraffitiTags(),
  processJSRGraffitiTags: async () => await processJSRGraffitiTags()
}