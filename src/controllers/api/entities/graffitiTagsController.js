import BaseModel from "../../../models/BaseModel.js";


export const getAllGraffitiTags = async (req, res) => {
  try {
    const jsrTags = await getJSRTags();
    const jsrfTags = await getJSRFTags();
    res.send([...jsrTags, ...jsrfTags]);
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