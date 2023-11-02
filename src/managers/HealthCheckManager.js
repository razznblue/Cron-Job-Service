import mongoose from 'mongoose';
import { coreConnection } from "../config/db.js";

class HealthCheckManager {
  constructor() {
    this.uptimeInSeconds = process.uptime();
    this.responseTime = process.hrtime();
    this.message = 'OK';
    this.dbState = {
      core: mongoose.STATES[coreConnection.readyState],
    };
    this.timestamp = Date.now();
    this.nodeVersion = process.version;
  }

  getAppHealth() {
    return {
      uptimeInSeconds: this.uptimeInSeconds,
      responseTime: this.responseTime,
      message: this.message,
      dbState: this.dbState,
      activeCronJobs: this.activeCronJobs,
      timestamp: this.timestamp,
      nodeVersion: this.nodeVersion
    };
  }
}

export default HealthCheckManager;