import BaseModel from "../../../models/BaseModel.js";
import LOGGER from "../../../utils/logger.js";


const modelName = 'game';
const orderedProperties = ["_id","name","intro","description","aliases","developers",
  "publishers","platforms","releaseDates","country","date","genre","assets","images",
  "frontCover","frontCoverSecondary","backCover","disc"];

export const getAllGames = async (req, res) => {
  try {
    const gamesfromDB = await BaseModel.getAllDocuments(modelName);
    const parsedGames = []
    for (const game of gamesfromDB) {
      parsedGames.push(JSON.parse(JSON.stringify(game, orderedProperties, 4)))
    }
    res.send(parsedGames);
  } catch(err) {
    LOGGER.error(`Error getting ALL Games: \n${err}`);
    res.status(500).send('Unknown Error');
  }
}

export const getGameById = async (req, res) => {
  const id = req?.params?.gameId;
  try {
    const gameFromDB = await BaseModel.getById(modelName, id);
    res.send(JSON.parse(JSON.stringify(gameFromDB, orderedProperties, 4)));
  } catch(err) {
    LOGGER.error(`Error getting Game By Id ${id}: \n${err}`);
    res.status(500).send('Unknown Error');
  }
}