import CRON_JOBS from "../jobs/jobList.js";
import LOGGER from "../utils/logger.js"; 
import schedule from 'node-schedule';
import { createAndSaveJob, getActiveJobsList, triggerCronJob, stopCronJob, getAllAvailableJobNames, cleanupJobs } from "../jobs/jobsUtil.js";


export const getAvailableJobs = (req, res) => {
  return res.send(CRON_JOBS);
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
  const jobs = getAllAvailableJobNames(); 
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
