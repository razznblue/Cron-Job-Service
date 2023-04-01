import mongoose from 'mongoose';
import { jsrConnection, jsrfConnection } from '../config/db.js';


const collectionName = "GraffitiTag";
const jsrfGraffitiTagSchema = new mongoose.Schema (
  {
    number: { type: String },
    tagName: { type: String },
    level: { type: String },
    location: { type: String },
    size: { type: String },
    wikiImageUrl: { type: String },
    imageUrl: { type: String },
    gameId: { type: mongoose.Types.ObjectId, ref: 'Game' }
  }, { timestamps: true, versionKey: false, collection: collectionName }
);


const jsrGraffitiTagModel = new mongoose.Schema (
  {
    number: { type: String },
    tagName: { type: String },
    tagSubName: { type: String },
    // level: { type: String },
    // location: { type: String }, 
    size: { type: String }, 
    imageUrl: { type: String },
    gameId: { type: mongoose.Types.ObjectId, ref: 'Game' }
  }, { timestamps: true, versionKey: false, collection: collectionName }
)

export const GraffitiTagJSR = jsrConnection.model(collectionName, jsrGraffitiTagModel);
export const GraffitiTagJSRF = jsrfConnection.model(collectionName, jsrfGraffitiTagSchema);