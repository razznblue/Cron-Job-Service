import mongoose from 'mongoose';
import { coreConnection } from '../config/db.js';


const CollectionName = "AvailableCronJob";

const AvailableCronJobIntervalSchema = new mongoose.Schema({
  name: { type: String },
  expression: { type: String }
}, { _id : false })

const AvailableCronJobSchema = new mongoose.Schema (
  {
    jobName: { type: String },
    interval: { type: AvailableCronJobIntervalSchema },
    timezone: { type: String },
  }, { timestamps: false, versionKey: false, collection: CollectionName }
);

export const AvailableCronJob = coreConnection.model(CollectionName, AvailableCronJobSchema);