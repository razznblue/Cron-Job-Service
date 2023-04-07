import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

import LOGGER from '../../../utils/logger.js';
import BaseModel from '../../../models/BaseModel.js';
import { Artist } from '../../../models/ArtistModel.js';
import { SongJSRF } from '../../../models/SongModel.js';
import { readFile } from '../../../utils/fileUtil.js';


const __dirname = dirname(fileURLToPath(import.meta.url));

const processJSRFSongs = async () => {
  let songSaveCount = 0;
  let artistSaveCount = 0;
  const songsFilePath = path.join(__dirname, '..', '..', '..', 'storage', 'songs', 'jsrf-audio.json');
  const songs = await readFile(songsFilePath);
  const parsed = JSON.parse(JSON.stringify(songs));
  console.log(`Found ${JSON.parse(parsed.toString()).length} JSRF songs to process`);

  for (const rawSong of JSON.parse(parsed.toString())) {
    const audioLink = rawSong.link;

    const names = getNames(audioLink);
    const artistId = await getArtist(audioLink, artistSaveCount);
    const name = names[0];
    const shortName = names[1];
    const gameId = await BaseModel.getGameId('Jet Set Radio Future');
    const chapters = rawSong.chapters;

    const exists = await BaseModel.getByKeyAndValue('songJsrf', 'name', name);
    if (!exists) {
      const song = new SongJSRF();
      song.name = name;
      song.shortName = shortName;
      song.gameId = gameId;
      song.artistId = artistId;
      song.audioLink = audioLink;
      song.chapters = chapters;
      await song.save();
      songSaveCount++;
      LOGGER.info(`Created new song with name ${song.name}`);
    } else {
      LOGGER.warn(`Found existing JSRF Song with name ${name}`);
    }
  }

  LOGGER.info(`Saved ${songSaveCount} new JSRF Songs`);
  LOGGER.info(`Saved ${artistSaveCount} new Artists`);

}

const getNames = (rawName) => {
  const splitted = rawName.split(' - ');
  let shortName = '';
  const fullName = splitted[1].split('.mp3')[0].trim();
  if (fullName.includes('(') && fullName.includes(')')) {
    shortName = fullName.split('(')[0].trim();
  } else {
    shortName = fullName;
  }
  return [fullName, shortName];
}

const getArtist = async (rawName, artistSaveCount) => {
  const splitted = rawName.split(' - ');
  const prefix = splitted[0].split('/');
  const artistName = prefix[prefix.length - 1].trim();

  const artist = await saveArtist(artistName, artistSaveCount);
  return artist._id;
}

const saveArtist = async (artistName, artistSaveCount) => {
  const exists = await BaseModel.getByKeyAndValue('artist', 'name', artistName);
  if (!exists) {
    const artist = new Artist();
    artist.name = artistName;
    const gameId = await BaseModel.getGameId('Jet Set Radio Future');
    artist.gameIds.push(gameId);
    await artist.save();
    artistSaveCount++;
    LOGGER.info(`Saved new Artist with name ${artist.name}`);
    return artist;
  } else {
    LOGGER.warn(`Found existing Artist with name ${artistName}`);
    return exists._id;
  }
}

export default processJSRFSongs;