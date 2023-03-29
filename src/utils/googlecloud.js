import { Storage } from "@google-cloud/storage";
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import dotenv from 'dotenv';
dotenv.config();


const __dirname = dirname(fileURLToPath(import.meta.url));
const credentials = path.join(__dirname, '..', '..', 'credentials.json');
const storage = new Storage({ keyFilename: credentials });
const bucket = storage.bucket(process.env.CLOUD_BUCKET_NAME);
import LOGGER from "./logger.js";

export const getListFiles = async (req, res) => {
  try {
    res.status(200).send(await getCloudFiles('jsrf/graffiti-tags/', '/'));
  } catch (err) {
    LOGGER.error(err);

    res.status(500).send({
      message: "Unable to read list of files!",
    });
  }
};

export const getCloudFiles = async (prefix, delimiter) => {
  try {
    const [files] = await bucket.getFiles({
      prefix: prefix, // 'jsrf/graffiti-tags/'
      delimiter: delimiter  // '/'
    });
    let fileInfos = [];

    files.forEach((file) => {
      fileInfos.push({
        name: file.name,
        url: `https://storage.googleapis.com/${file.bucket.name}/${file.name}`
      });
    });

    return fileInfos;
  } catch(err) {
    LOGGER.error(JSON.stringify.err);
  }
}