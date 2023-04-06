import mongoose from 'mongoose';
import { coreConnection } from '../config/db.js';

// Open to collecting more info about each artist.
const collectionName = "Artist";
const artistSchema = new mongoose.Schema (
  {
    name: { type: String },
    gameIds: [{ type: mongoose.Types.ObjectId, ref: 'Game' }],
  }, { timestamps: true, versionKey: false, collection: collectionName }
);

export const Artist = coreConnection.model(collectionName, artistSchema);