import mongoose from 'mongoose';
import { coreConnection } from '../config/db.js';

const CollectionName = "CronJob";

const CronJobIntervalSchema = new mongoose.Schema({
  name: { type: String },
  expression: { type: String }
}, { _id : false })

const CronJobFireTimes = new mongoose.Schema({
  startFire: { type: Date },
  nextFire: { type: Date },
  previousFire: { type: Date }
}, { _id : false })

const CronJobSchema = new mongoose.Schema (
  {
    jobName: { type: String },
    timezone: { type: String },
    interval: { type: CronJobIntervalSchema },
    fireTimes: { type: CronJobFireTimes },
  }, { timestamps: false, versionKey: false, collection: CollectionName }
);

export const CronJob = coreConnection.model(CollectionName, CronJobSchema);