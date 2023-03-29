import mongoose from 'mongoose';
import { coreConnection } from '../config/db.js';

const CollectionName = "Admin";

const AdminSchema = new mongoose.Schema (
  {
    username: { type: String },
    password: { type: String },
  }, { timestamps: false, versionKey: false, collection: CollectionName }
);

export const Admin = coreConnection.model(CollectionName, AdminSchema);