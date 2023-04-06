import mongoose from 'mongoose';
import { jsrConnection, jsrfConnection } from '../config/db.js';


const collectionName = "Song";
const jsrfSongSchema = new mongoose.Schema (
  {
    name: { type: String },
    shortName: { type: String },
    audioLink: { type: String },
    duration: { type: String },
    chapter: { type: String },
    gameId: { type: mongoose.Types.ObjectId, ref: 'Game' },
    artistId: { type: mongoose.Types.ObjectId, ref: 'Artist' }
  }, { timestamps: true, versionKey: false, collection: collectionName }
);

const jsrSongSchema = new mongoose.Schema (
  {
    name: { type: String },
    shortName: { type: String },
    audioLink: { type: String },
    duration: { type: String },
    gameId: { type: mongoose.Types.ObjectId, ref: 'Game' },
    artistId: { type: mongoose.Types.ObjectId, ref: 'Artist' }
  }, { timestamps: true, versionKey: false, collection: collectionName }
)

export const SongJSR = jsrConnection.model(collectionName, jsrSongSchema);
export const SongJSRF = jsrfConnection.model(collectionName, jsrfSongSchema);