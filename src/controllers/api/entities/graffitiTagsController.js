import BaseModel from "../../../models/BaseModel.js";
import LOGGER from "../../../utils/logger.js";


export const getAllGraffitiTags = async (req, res) => {
  try {
    const tags = await Promise.all([getJSRTags(), getJSRFTags()]);
    res.send([...tags[0], ...tags[1]]);
  } catch(err) {
    LOGGER.error(`Error getting ALL GraffitiTags: \n${err}`);
    res.status(500).send('Unknown Error');
  }
}

export const getJSRGraffitiTags = async (req, res) => {
  try {
    res.send(await getJSRTags());
  } catch(err) {
    LOGGER.error(`Error getting ALL GraffitiTags: \n${err}`);
    res.status(500).send('Unknown Error');
  }
}

export const getJSRFGraffitiTags = async (req, res) => {
  try {
    res.send(await getJSRFTags());
  } catch(err) {
    LOGGER.error(`Error getting ALL GraffitiTags: \n${err}`);
    res.status(500).send('Unknown Error');
  }
}

const getJSRTags = async () => {
  const graffitiTagJSR = 'graffitiTagJsr';
  return await BaseModel.getAllDocuments(graffitiTagJSR);
}

const getJSRFTags = async () => {
  const graffitiTagJSRF = 'graffitiTagJsrf';
  return await BaseModel.getAllDocuments(graffitiTagJSRF);
}