import LOGGER from "../utils/logger.js";
import { processMReliefFamily } from './m_fires_relief/jobs.js'
import { processCardsSWGU, processLocationsSWGU } from "./swgu/jobs.js";

const SWGU_CARDS = 'SWGU_CARDS';
const SWGU_LOCATIONS = 'SWGU_LOCATIONS';

export const JobInterchanger = {

  async executeJob(jobName) {
    if (!jobName) {
      LOGGER.warn(`Could not execute invalid jobName ${jobName} in JobInterchanger`);
      return () => {};
    }
    switch (jobName) {
      case SWGU_CARDS:
        return await jobActions.processCardsSWGU();
      case SWGU_LOCATIONS:
        return await jobActions.processLocationsSWGU();
    }
    return () => {};
  }

} 

const jobActions = {
  processCardsSWGU: async () => await processCardsSWGU(),
  processLocationsSWGU: async () => await processLocationsSWGU()
}