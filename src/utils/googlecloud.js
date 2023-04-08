import { Storage } from "@google-cloud/storage";
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import dotenv from 'dotenv';
dotenv.config();


const __dirname = dirname(fileURLToPath(import.meta.url));
import LOGGER from "./logger.js";

const getBucket = () => {
  try {
    const credentials = path.join(__dirname, '..', '..', 'credentials.json');
    const storage = new Storage({ keyFilename: credentials });
    return storage.bucket(process.env.CLOUD_BUCKET_NAME)
  } catch(err) {
    LOGGER.warn(`Unable to get GCS Bucket. Is the bucket being set in the .env file? \n${err}`);
  }
}

export const getListFiles = async (req, res) => {
  try {
    const files = await getCloudFiles('jsrf/graffiti-tags/', '/');
    console.log(`files: ${files}`);
    if (files === false) {
      return res.status(500).send('Error retrieving Cloud Files. Check ogs for more details');
    }
    res.status(200).send(files);
  } catch (err) {
    LOGGER.error(`Error getting List of Cloud Files. \n${err}`);

    res.status(500).send({
      message: "Unable to read list of files!",
    });
  }
};

export const getCloudFiles = async (prefix, delimiter) => {
  try {
    const [files] = await getBucket().getFiles({
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
    LOGGER.error(`Failed to retrieve files from Cloud Bucket \n${err}`);
    return false;
  }
}