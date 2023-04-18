import axios from 'axios';
import LOGGER from './logger.js';

const Axios = {
  async get(url) {
    try {
      return await axios.get(url);
    } catch(err) {
      LOGGER.error(`AXIOS: Could not call url: ${url}. \n${err}`);
    }
  }
}

export default Axios;