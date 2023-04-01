import { GraffitiTagJSR, GraffitiTagJSRF } from "./GraffitiTagModel.js";
import { Game } from "./GameModel.js";
import { CronJob } from "./CronJobModel.js";
import { Admin } from "./AdminModel.js";
import LOGGER from "../utils/logger.js";


const models = {
  graffitiTagJsr: GraffitiTagJSR,
  graffitiTagJsrf: GraffitiTagJSRF,
  cronJob: CronJob,
  admin: Admin,
  game: Game
};

const BaseModel = {

  async existsById(modelName, id) {
    try {
      return await models[modelName].exists({ _id: id });
    } catch(err) {
      LOGGER.error(`Error determining if ${modelName} with id ${id} exists \n${err}`);
    }
  },

  async existsByKeyAndValue(modelName, key, value) {
    try {
      return await models[modelName].exists({ [key]: value });
    } catch(err) {
      LOGGER.error(`Error determining if ${modelName} with key ${key} and value ${value} exists \n${err}`);
    }
  },

  async getById(modelName, id) {
    try {
      return await models[modelName].findById(id);
    } catch(err) {
      LOGGER.error(`Error getting ${modelName} document by Id \n${err}`);
    }
  },

  async getByKeyAndValue(modelName, key, value) {
    try {
      return await models[modelName].findOne({ [key]: value });
    } catch(err) {
      LOGGER.error(`Error getting ${modelName} document by key ${key} and value ${value} \n${err}`);
    }
  },

  async getAllDocuments(modelName) {
    try {
      return await models[modelName].find({});
    } catch(err) {
      LOGGER.error(`Error getting ALL documents from ${modelName} collection. \n${err}`);
    }
  },

  async deleteSingleDocument(modelName, key, value) {
    try {
      return await models[modelName].deleteOne({ [key]: value });
    } catch(err) {
      LOGGER.error(`Error deleting ${modelName} document by key ${key} and value ${value} \n${err}`);
    }
  },

  async deleteAllFromCollection(modelName) {
    try {
      return await models[modelName].deleteMany({});
    } catch(err) {
      LOGGER.error(`Error removing ALL documents from ${modelName} collection. \n${err}`);
    }
  },

  async getGameId(gameName) {
    try {
      const game = await models['game'].findOne({ name: gameName }, '_id');
      return game._id;
    } catch(err) {
      LOGGER.error(`Error removing ALL documents from ${modelName} collection. \n${err}`);
    }
  }

}

export default BaseModel;