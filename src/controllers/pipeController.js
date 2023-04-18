import Axios from '../utils/axios.js';
import LOGGER from '../utils/logger.js';
import BaseModel from '../models/BaseModel.js';

export const pipeDatabase = async (req, res) => {
  const jsrapiBaseUrl = 'https://jetsetradio-api.onrender.com';
  const apiEndpoints = await Axios.get(`${jsrapiBaseUrl}/endpoints?pipe=true`);
  const jsr = 'Jsr';
  const jsrf = 'Jsrf';
  const pipeData = [];

  // Loop through endpoints and create PipeData Object
  for (const endpoint of apiEndpoints.data) {
    const model = endpoint.split('/')[3];
    let modelSingular = model.slice(0, model.length-1);
    if (model.includes('-')) {
      const newString = [];
      const splitted = modelSingular.split('');
      const dashPosition = splitted.indexOf('-');
      const afterDashPosition = splitted.indexOf('-') + 1;
      for (let i = 0; i < splitted.length; i++) {
        if (i !== dashPosition && i !== afterDashPosition) {
          newString.push(splitted[i])
        } else if (i === afterDashPosition) {
          newString.push(splitted[afterDashPosition].toUpperCase());
        } 
      } 
      if (endpoint.includes('jsr') && !endpoint.includes('jsrf')) {
        pipeData.push({model: newString.join('') + jsr, endpoint: endpoint});
        continue;
      }
      if (endpoint.includes('jsrf')) {
        pipeData.push({model: newString.join('') + jsrf, endpoint: endpoint});
        continue;
      }
      pipeData.push({model: newString.join(''), endpoint: endpoint});
      continue;
    }
    if (endpoint.includes('jsr') && !endpoint.includes('jsrf')) {
      pipeData.push({model: modelSingular + jsr, endpoint: endpoint});
      continue;
    }
    if (endpoint.includes('jsrf')) {
      pipeData.push({model: modelSingular + jsrf, endpoint: endpoint});
      continue;
    }
    pipeData.push({model: modelSingular, endpoint: endpoint});
  }
  LOGGER.info(`Attempting to pipe database`);
  res.send(pipeData);

  for (const pipe of pipeData) {
    LOGGER.debug(`Attempting to pipe ${pipe}`);
  
    await BaseModel.deleteAllFromCollection(pipe.model);
    const pipeResponse = await Axios.get(`${jsrapiBaseUrl}${pipe.endpoint}`);
    const insert = await BaseModel.insertAllDocuments(pipe.model, pipeResponse.data);
    if (insert) {
      LOGGER.info(`Piped ${pipe.model}`);
    }
  }
  
  LOGGER.info(`Piping Complete!`);
}