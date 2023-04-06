import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

import LOGGER from '../../../utils/logger.js';
import { Game } from '../../../models/GameModel.js';
import BaseModel from '../../../models/BaseModel.js';


const __dirname = dirname(fileURLToPath(import.meta.url));

export const processGames = async () => {
  LOGGER.info('Starting Games Job');
  const pathToGamesFile = path.join(__dirname, '..', '..', 'storage', 'games.json');
  const games = await fs.readFile(pathToGamesFile, 'utf8');
  for (const g of JSON.parse(games.toString())) {
    const exists = await BaseModel.existsByKeyAndValue('game', 'name', g.name);
    if (!exists) {
      const game = new Game();
      game.name = g.name;
      game.aliases = g.aliases;
      game.intro = g.intro;
      game.description = g.description;
      game.developers = g.developers;
      game.publishers = g.publishers;
      game.platforms = g.platforms;
      game.releaseDates = g.releaseDates;
      game.genre = g.genre;
      game.assets = g.assets;
      await game.save();
      LOGGER.info(`Saved new Game ${game._id} with name ${game.name} to DB`);
    } else {
      LOGGER.warn(`Found existing game ${g.name} in DB`);
    }
  }
}