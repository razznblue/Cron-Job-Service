import mongoose from 'mongoose';
import { jsrConnection, jsrfConnection } from '../config/db.js';

const CharacterSchema = new mongoose.Schema({
  name: { type: String },
  id: { type: mongoose.Types.ObjectId, ref: 'Character' }
}, {_id : false})

const collectionName = "Location";
const jsrLocationSchema = new mongoose.Schema (
  {
    name: { type: String },
    description: { type: String },
    levels: [{ type: mongoose.Types.ObjectId, ref: 'Level' }],
    subLocations: [{ type: String }],
    gameId: { type: mongoose.Types.ObjectId, ref: 'Game' },
    secretCharacter: { type: CharacterSchema },
    unlockableCharacters: [{ type: CharacterSchema }]
  }, { timestamps: true, versionKey: false, collection: collectionName }
);

const AdjacentLocation = new mongoose.Schema({
  name: { type: String },
  id: { type: mongoose.Types.ObjectId, ref: 'Location' }
}, {_id : false})

const jsrfLocationSchema = new mongoose.Schema (
  {
    name: { type: String, unique: true },
    description: { type: String },
    secretCharacter: { type: CharacterSchema },
    unlockableCharacters: [{ type: CharacterSchema }],
    adjacentLocations: [{ type: AdjacentLocation }],
    gameId: { type: mongoose.Types.ObjectId, ref: 'Game' },
    hasMixtape: { type: Boolean },
    imageUrl: { type: String }
  }, { timestamps: true, versionKey: false, collection: collectionName }
);

export const LocationJSR = jsrConnection.model(collectionName, jsrLocationSchema);
export const LocationJSRF = jsrfConnection.model(collectionName, jsrfLocationSchema);