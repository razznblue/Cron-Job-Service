import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import LOGGER from '../utils/logger.js';


function createDBConnection(uri) {
  const db = mongoose.createConnection(uri, {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
  });

  db.on('error', function(error) {
    LOGGER.error(`DB :: Connection Failed to ${this.name} ${JSON.stringify(error)}`);
    db.close().catch(() => LOGGER.error(`DB : Failed to close connection to ${this.name}`));
  })

  db.on('connected', function() {
    mongoose.set('debug', function(col, method, query, doc) {
      //LOGGER.debug(`DB :: connected to ${this.conn.name} ${col}.${method}(${JSON.stringify(query)},${JSON.stringify(doc)})`);
    });
    LOGGER.info(`DB :: connected to ${this.name}`);
  });

  db.on('disconnected', function() {
    LOGGER.info(`DB :: disconnected to ${this.name}`);
  })

  return db;
}

const getMongoUri = (DB_TYPE) => {
  const user = process.env.MONGO_USER;
  const password = process.env.MONGO_PASS;
  const database = process.env[DB_TYPE];
  const clusterName = process.env.MONGO_CLUSTER;
  const domainName = process.env.MONGO_DOMAIN;
  if (!user) {
    return LOGGER.error(`Invalid admin user found while building mongo uri`);
  }
  if (!password) {
    return LOGGER.error(`Invalid admin password found while building mongo uri`);
  }
  if (!database) {
    return LOGGER.error(`Invalid database name found while building mongo uri`);
  }
  if (!clusterName) {
    return LOGGER.error(`Invalid cluster name found while building mongo uri`);
  }
  return `mongodb+srv://${user}:${password}@${clusterName}.${domainName}/${database}?retryWrites=true&w=majority`;
}


export const coreConnection = createDBConnection(getMongoUri('CORE_DB'));