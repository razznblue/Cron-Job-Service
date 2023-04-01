import mongoose from 'mongoose';
import { coreConnection } from '../config/db.js';


const collectionName = "Game";

const ReleaseDatesSchema = new mongoose.Schema({
  country: { type: String },
  date: { type: String },
}, {_id : false})

const AssetsSchema = new mongoose.Schema({
  country: { type: String },
  images: { 
    frontCover: { type: String, default: undefined },
    frontCoverSecondary: { type: String, default: undefined },
    backCover: { type: String, default: undefined },
    disc: { type: String, default: undefined }
  },
}, {_id : false})

const GameSchema = new mongoose.Schema (
  {
    name: { type: String },
    aliases: [{ type: String }],
    intro: { type: String },
    description: { type: String },
    developers: [{ type: String }],
    publishers: [{ type: String }],
    platforms: [{ type: String }],
    releaseDates: [{ type: ReleaseDatesSchema }],
    genre: { type: String },
    assets: [{ type: AssetsSchema }]
  }, { timestamps: true, versionKey: false, collection: collectionName }
);

export const Game = coreConnection.model(collectionName, GameSchema);