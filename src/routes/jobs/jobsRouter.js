import express from 'express';
import { getActiveJobs, getAvailableJobs, createJob, triggerJob, stopJob, startAllJobs, stopAllJobs } from '../../controllers/jobsController.js';


const jobs = express.Router();

jobs.get('/', (req, res) => getAvailableJobs(req, res));
jobs.get('/active', async (req, res) => await getActiveJobs(req, res));
jobs.post('/:jobName', async (req, res) => await createJob(req, res));
jobs.get('/:jobName/trigger', async (req, res) => await triggerJob(req, res)); // When you trigger, the job should already be started
jobs.delete('/:jobName', async (req, res) => await stopJob(req, res));
jobs.delete('/delete/all', async (req, res) => await stopAllJobs(req, res));
jobs.get('/start/all', async (req, res) => await startAllJobs(req, res));

export default jobs;