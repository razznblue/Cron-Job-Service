import mongoose from 'mongoose';
import { jsrConnection, jsrfConnection } from '../config/db.js';

const collectionName = "GraffitiTag";
const graffitiTagSchema = new mongoose.Schema (
  {
    number: { type: String },
    tagName: { type: String },
    level: { type: String },
    location: { type: String },
    size: { type: String },
    wikiImageUrl: { type: String },
    imageUrl: { type: String }
  }, { timestamps: true, versionKey: false, collection: collectionName }
);

export const GraffitiTagJSR = jsrConnection.model(collectionName, graffitiTagSchema);
export const GraffitiTagJSRF = jsrfConnection.model(collectionName, graffitiTagSchema);