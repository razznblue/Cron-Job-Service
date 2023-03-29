import BaseModel from "../../../models/BaseModel.js";


export const getAllGraffitiTags = async (req, res) => {
  const jsrTags = await getJSRTags();
  const jsrfTags = await getJSRFTags();
  res.send([...jsrTags, ...jsrfTags]);
}

export const getJSRGraffitiTags = async (req, res) => {
  res.send(await getJSRTags());
}

export const getJSRFGraffitiTags = async (req, res) => {
  res.send(await getJSRFTags());
}

const getJSRTags = async () => {
  const graffitiTagJSR = 'graffitiTagJsr';
  return await BaseModel.getAllDocuments(graffitiTagJSR);
}

const getJSRFTags = async () => {
  const graffitiTagJSRF = 'graffitiTagJsrf';
  return await BaseModel.getAllDocuments(graffitiTagJSRF);
}