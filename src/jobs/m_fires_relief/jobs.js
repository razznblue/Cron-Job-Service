import axios from "axios";

const mReliefBaseUrl = process.env.MFR_BASE_URL;

/**
 * Calls the Maui Fires Relief Project to Update Family Info
 */
export const processMReliefFamily = async () => {
  try {
    const url = `${mReliefBaseUrl}/api/family/process`;
    await axios.post(url, {
      username: process.env.MFR_USER, password: process.env.MFR_PASS
    });
    console.log(`Called MRF-Service /family/process successfully`);
  } catch(err) {
    console.log(`error processing family. Reason: ${err?.response?.data}`)
  } 
}