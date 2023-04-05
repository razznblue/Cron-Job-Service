import LOGGER from "../utils/logger.js"; 
import schedule from 'node-schedule';
import { createAndSaveJob, getActiveJobsList, triggerCronJob, stopCronJob, getAllAvailableJobNames, cleanupJobs } from "../jobs/jobsUtil.js";
import BaseModel from "../models/BaseModel.js";
import getCronExpression from '../jobs/intervals.js';
import { AvailableCronJob } from "../models/AvailableCronJob.js";


export const getAvailableJobs = async (req, res) => {
  res.send(await BaseModel.getAllDocuments('availableCronJob'));
}

export const getAvailableJob = async (req, res) => {
  res.send(await BaseModel.getById('availableCronJob', req?.params?.id));
}

export const createAvailableJob = async (req, res) => {
  if (req?.body) {
    const jobName = req?.body?.jobName;
    const exists = await BaseModel.existsByKeyAndValue('availableCronJob', 'jobName', jobName);
    if (!exists) {
      const intervalName = req?.body?.interval;
      const cronExpression = getCronExpression(intervalName);
      if (cronExpression) {
        const availableCronJob = new AvailableCronJob();
        availableCronJob.jobName = req?.body?.jobName;
        availableCronJob.interval = { name: intervalName, expression: cronExpression };
        if (req?.body?.timezone) {
          availableCronJob.timezone = req?.body?.timezone;
        }
        await availableCronJob.save();
        LOGGER.info(`Saved new AvailableCronJob with name ${intervalName}`);
        res.send(availableCronJob);
      } else {
        res.status(500).send('Invalid interval');
      }
    } else {
      res.status(500).send('JobName taken. Try Another');
    }
  }
}

export const updateAvailableJob = async (req, res) => {
  let updated = false;
  const id = req?.params?.id;
  if (req?.body && id) {
    const job = await BaseModel.getById('availableCronJob', id);
    if (!job) {
      return res.status(404).send(`Job not found`);
    }
    if (req?.body?.interval) {
      const cronExpression = getCronExpression(req?.body?.interval);
      if (cronExpression) {
        job.interval = { name: req?.body?.interval, expression: cronExpression };
      }
    }
    if (req?.body?.timezone) {
      job.timezone = req?.body?.timezone;
    }
    await job.save();
    updated = true;
    LOGGER.info(`Updated AvailableCronJob ${id}`);
    res.send({job, "updated": updated});
  } else {
    res.status(500).send(`Invalid ID or unknown error occurred`);
  }
}

export const getActiveJobs = async (req, res) => {
  const jobNames = getActiveJobsList();
  //TODO (optional) Verify each jobName has a record in DB
  return res.send(jobNames);
}

export const createJob = async (req, res) => {
  const jobName = req?.params?.jobName;
  await createAndSaveJob(jobName);
  return res.status(204).send();
}

export const triggerJob = async (req, res) => {
  const jobName = req?.params.jobName;
  await triggerCronJob(jobName);
  return res.status(204).send();
}

export const stopJob = async (req, res) => {
  const jobName = req?.params.jobName;
  await stopCronJob(jobName);
  return res.status(204).send();
}

export const startAllJobs = async (req, res) => {
  const jobs = await getAllAvailableJobNames(); 
  if (jobs.length > 0) {
    for (const job of jobs) {
      await createAndSaveJob(job);
    }
    return res.status(204).send();
  } else {
    LOGGER.info(`CRON_JOB list is empty...`);
    return res.status(500).send('CRON_JOB list is empty...');
  }
}

export const stopAllJobs = async (req, res) => {
  try {
    await schedule.gracefulShutdown();
    await cleanupJobs();
    LOGGER.info(`Stopped all CronJobs`);
    res.status(204).send();
  } catch(err) {
    LOGGER.error(`Unknown error occurred attempting to shut down all CronJobs: \n${err}`);
    res.status(500).send('Unknown Error');
  }
}
