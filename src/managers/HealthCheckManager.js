class HealthCheckManager {
  constructor() {
    this.uptimeInSeconds = process.uptime()
    this.responseTime = process.hrtime()
    this.message = 'OK'
    this.timestamp = Date.now()
    this.nodeVersion = process.version
  }

  getAppHealth() {
    return {
      uptimeInSeconds: this.uptimeInSeconds,
      responseTime: this.responseTime,
      message: this.message,
      timestamp: this.timestamp,
      nodeVersion: this.nodeVersion
    };
  }
}

export default HealthCheckManager;