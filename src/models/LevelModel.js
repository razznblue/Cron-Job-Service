import mongoose from 'mongoose';
import { jsrConnection } from '../config/db.js';

const LocationSchema = new mongoose.Schema({
  name: { type: String },
  id: { type: mongoose.Types.ObjectId, ref: 'Location' }
}, {_id : false})

const collectionName = "Level";
const jsrLevelSchema = new mongoose.Schema (
  {
    name: { type: String },
    description: { type: String },
    location: { type: LocationSchema },
    jetRankingPoints: { type: String },
    smallTagsCount: { type: String },
    largeTagsCount: { type: String },
    extraLargeTagsCount: { type: String },
    bossLevel: { type: Boolean },
    chapter: { type: String },
  }, { timestamps: true, versionKey: false, collection: collectionName }
);

export const LevelJSR = jsrConnection.model(collectionName, jsrLevelSchema);