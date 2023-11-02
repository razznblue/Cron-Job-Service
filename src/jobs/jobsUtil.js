import parser from 'cron-parser';

import { CronJob } from "../models/CronJobModel.js";
import BaseModel from "../models/BaseModel.js";
import LOGGER from "../utils/logger.js";
import { JobInterchanger } from './jobInterchanger.js';
import schedule from 'node-schedule';


export const getActiveJobsList = async () => {
  const cronJobs = [];
  const activeJobs = schedule.scheduledJobs;
  const keys = Object.keys(activeJobs);
  for (const key of keys) {
    const jobName = activeJobs[key].name;
    const cronJob = await BaseModel.getByKeyAndValue('cronJob', 'jobName', jobName);
    if (!cronJob) {
      LOGGER.warn(`Could not find DB record of active cron job ${jobName}`);
    } else {
      cronJobs.push(cronJob);
    }
  }
  return cronJobs;
}

const jobIsActive = async (jobName) => {
  const activeJobs = await getActiveJobsList();
  for (const activeJob of activeJobs) {
    if (activeJob.jobName === jobName) {
      return true;
    }
  }
  return false;
}

export const createAndSaveJob = async (jobName) => {

  if (!await jobIsActive(jobName)) {
    const job = await findJobFromAvailableList(jobName);
    if (job) {
      const cronJob = new CronJob();
      cronJob.jobName = jobName;
      cronJob.timezone = job?.timezone || 'America/Chicago';
      cronJob.interval = job?.interval;
      await updateFireTimes(cronJob, { firstExecution: true });
      
      const scheduledJob = await scheduleJob(cronJob);
      if (scheduledJob) {
        LOGGER.info(`Started CronJob ${cronJob.jobName}`);
      }

      return cronJob;
    } else {
      LOGGER.warn(`Could not fire job with name "${jobName}" that doesn't exist in JobList`);
      const deleted = await BaseModel.deleteSingleDocument('cronJob', 'jobName', jobName);
      LOGGER.info(`deleted: \n${deleted}`);
    }
  } else {
    LOGGER.warn(`Requested job ${jobName} is already started!`);
  }
}

export const updateCronJob = async (jobName) => {
  if (jobIsActive(jobName)) {
    const cronJob = await BaseModel.getByKeyAndValue('cronJob', 'jobName', jobName);
    if (!cronJob) {
      LOGGER.warn(`Job ${jobName} needs a refresh. It is started but has no Mongo Document.`);
      return false;
    }
    updateFireTimes(cronJob, { firstExecution: false });
  } else {
    LOGGER.warn(`Could not update Job ${jobName} because job is not currently scheduled`);
  }
}

export const triggerCronJob = async (jobName) => {
  if (await findJobFromAvailableList(jobName)) {
    LOGGER.info(`Triggering CronJob ${jobName}`);
    await JobInterchanger.executeJob(jobName);
    const mongoJobRecord = await BaseModel.getByKeyAndValue('cronJob', 'jobName', jobName);
    if (mongoJobRecord) {
      await updateFireTimes(mongoJobRecord);
      LOGGER.info(`Updated firetimes for triggered job ${jobName}`);
    }
  } else {
    LOGGER.warn(`Could not trigger ${jobName} because it doesn't exist.`);
  }
}

export const stopCronJob = async (jobName) => {
  if (await jobIsActive(jobName)) {
    const cancelled = removeJobFromActiveList(jobName);
    if (cancelled) {
      await BaseModel.deleteSingleDocument('cronJob', 'jobName', jobName);
    }
  } else {
    LOGGER.warn(`Could not unschedule Job ${jobName} because job is not currently scheduled`);
  }
}


const scheduleJob = async (cronJob) => {
  try {
    const jobName = cronJob?.jobName;
    schedule.scheduleJob(jobName, cronJob?.interval?.expression, async () => {
      await Promise.all([JobInterchanger.executeJob(jobName), updateCronJob(jobName)]);
    })
    return jobIsActive(jobName);
  } catch(err) {
    LOGGER.error(`Could not schedule CronJob ${cronJob.jobName} \n${err}`);
  }
}

const removeJobFromActiveList = (jobName) => {
  const cancelled = schedule.cancelJob(jobName);
  if (!cancelled) {
    LOGGER.warn(`Job ${jobName} could not be unscheduled`);
    return cancelled;
  }
  LOGGER.info(`Job ${jobName} was unscheduled`);
  return cancelled;

}

const findJobFromAvailableList = async (jobName) => {
  const availableJobs = await BaseModel.getAllDocuments('availableCronJob');
  for (const job of availableJobs) {
    if (jobName === job.jobName) {
      return job;
    }
  }
  return false;
}

const updateFireTimes = async (cronJob, options) => {
  try {
    const firstExecution = options?.firstExecution;
    const expression = cronJob?.interval?.expression;
    const timezone = cronJob?.timezone || 'America/Chicago';
    LOGGER.debug(`Setting fireTimes for expression ${expression} with timezone ${timezone}`);

    const interval = parser.parseExpression(expression, { tz: timezone });
    const nextInterval = interval.next().toString();
    const prev = interval.prev().toString();
    
    const now = new Date().toISOString();
    const previousInterval = new Date(now) > new Date(prev) ? now : prev;

    if (firstExecution) {
      cronJob.fireTimes = {
        startFire: previousInterval,
        nextFire: nextInterval,
        previousFire: null
      } 
    } else {
      cronJob.fireTimes.nextFire = nextInterval;
      cronJob.fireTimes.previousFire = previousInterval;
    }
    await cronJob.save();
  } catch (err) {
    LOGGER.error(`Could not update fire times for job ${cronJob.jobName} \n${err}`);
  }
}

export const cleanupJobs = async () => {
  try {
    LOGGER.debug(`Cleaning up Jobs`);
    await BaseModel.deleteAllFromCollection('cronJob');
  } catch(err) {
    LOGGER.error(`Unable to delete All Cron Jobs from Mongo: \n${err}`);
  }
}

export const getAllAvailableJobNames = async () => {
  const names = [];
  const availableJobs = await BaseModel.getAllDocuments('availableCronJob');
  for (const job of availableJobs) {
    names.push(job.jobName);
  }
  return names;
}