import LOGGER from "../utils/logger.js";
import Constants from "../constants/Constants.js";
import { scrapeGraffitiTags } from "./jsrf/graffitiTags.js";
import { executeTestJob } from "./test/testJob.js";


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
        return await jobActions.processGraffitiTags();
    }
    return () => {};
  }

} 

const jobActions = {
  doTestJob: () => executeTestJob(),
  processGraffitiTags: async () => await scrapeGraffitiTags()
}