import axios from "axios";

const baseUrl = process.env.SWGU_URL;

export const processCardsSWGU = async () => {
  console.log(process.env.SWGU_USER, process.env.SWGU_KEY);
  const url = `${baseUrl}/api/jobs/cards`;
  try {
    await axios.post(url, {
      username: process.env.SWGU_USER, accessKey: process.env.SWGU_KEY
    });
    console.log(`Called ${url} successfully`);
  } catch(err) {
    console.log(`error calling ${url}. Reason: ${err?.response?.data}`);
  } 
}

export const processLocationsSWGU = async () => {
  const url = `${baseUrl}/api/jobs/locations`;
  try {
    await axios.post(url, {
      username: process.env.SWGU_USER, accessKey: process.env.SWGU_KEY
    });
    console.log(`Called ${url} successfully`);
  } catch(err) {
    console.log(`error calling ${url}. Reason: ${err?.response?.data}`);
  } 
}